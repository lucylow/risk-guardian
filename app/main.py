import asyncio
import json
import logging
from contextlib import asynccontextmanager
from typing import Any, Dict, Generator, Optional

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware

from .automation import add_transaction_to_monitor, automation_worker
from .auth import create_access_token, get_current_user
from .cache import close_redis, get_cache, init_redis, set_cache
from .config import settings
from .decision_support import suggest_alternatives
from .logger import setup_logging
from .monitoring import setup_metrics
from .oneid import oneid
from .onepredict import onepredict
from .risk_engine import compute_risk_score, get_adaptive_risk_threshold
from .settings_routes import router as settings_router
from .websocket import router as websocket_router
from .wallet import verify_onewallet_signature

try:
    from . import database  # type: ignore
except Exception:
    database = None  # type: ignore

try:
    from . import ml_models  # type: ignore
except Exception:
    ml_models = None  # type: ignore

try:
    from . import models  # type: ignore
except Exception:
    models = None  # type: ignore


class SwapRequest(BaseModel):
    user_address: str
    token_in: str
    token_out: str
    amount_in: float
    signature: Optional[str] = None
    nonce: Optional[str] = None


class LoginRequest(BaseModel):
    address: str
    signature: str
    nonce: str


class RiskResponse(BaseModel):
    score: float
    recommendation: str
    factors: Dict[str, Any]


class HealthResponse(BaseModel):
    status: str


class SuggestionFeedbackRequest(BaseModel):
    user_address: str
    suggestion_type: str
    suggested_params: Dict[str, Any]
    safety_score: Optional[int] = None
    accepted: bool = False


setup_logging()
logger = logging.getLogger(__name__)
try:
    from slowapi import Limiter, _rate_limit_exceeded_handler
    from slowapi.errors import RateLimitExceeded
    from slowapi.util import get_remote_address

    limiter = Limiter(key_func=get_remote_address)
    _rate_limit_enabled = True
except Exception:
    class _NoOpLimiter:
        def limit(self, _rule: str):
            def _decorator(func):
                return func

            return _decorator

    limiter = _NoOpLimiter()
    _rate_limit_enabled = False


def _get_db_fallback() -> Generator[Optional[Session], None, None]:
    yield None


if database and hasattr(database, "get_db"):
    get_db = database.get_db  # type: ignore
else:
    get_db = _get_db_fallback


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await init_redis()
    if ml_models and hasattr(ml_models, "init_models"):
        ml_models.init_models()
    if database and models and hasattr(models, "Base") and hasattr(database, "engine"):
        models.Base.metadata.create_all(bind=database.engine)
    worker_task = asyncio.create_task(automation_worker())
    yield
    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass
    try:
        from .flashbots import flashbots

        await flashbots.close()
    except Exception:
        pass
    await close_redis()
    await onepredict.close()
    await oneid.close()


app = FastAPI(title="Risk Oracle API", version="1.0.0", lifespan=lifespan)
app.state.limiter = limiter
if _rate_limit_enabled:
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.include_router(settings_router)
app.include_router(websocket_router)
setup_metrics(app)
if settings.ENFORCE_HTTPS_REDIRECT:
    app.add_middleware(HTTPSRedirectMiddleware)


@app.exception_handler(Exception)
async def global_exception_handler(_request: Request, exc: Exception):
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.post("/auth/login")
async def login(request: LoginRequest):
    message = f"Sign in to Risk Oracle: {request.nonce}"
    if not verify_onewallet_signature(request.address, message, request.signature):
        raise HTTPException(status_code=401, detail="Invalid signature")
    access_token = create_access_token(data={"sub": request.address})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post(
    "/assess",
    response_model=RiskResponse,
    summary="Assess swap risk",
    description="Get AI-powered risk score for a swap on OneDEX.",
)
@limiter.limit("10/minute")
async def assess_swap(
    request: Request,
    swap_request: SwapRequest,
    db: Session = Depends(get_db),
    user_address: str = Depends(get_current_user),
):
    _ = request
    if user_address.lower() != swap_request.user_address.lower():
        raise HTTPException(status_code=403, detail="Address mismatch")

    assess_cache_key = (
        f"risk_assess:{swap_request.user_address}:{swap_request.token_in}:"
        f"{swap_request.token_out}:{swap_request.amount_in}"
    )
    cached_risk = await get_cache(assess_cache_key)
    if cached_risk is not None:
        risk_data = cached_risk
    else:
        risk_data = await compute_risk_score(
            user_address=swap_request.user_address,
            token_in=swap_request.token_in,
            token_out=swap_request.token_out,
            amount=swap_request.amount_in,
        )
        await set_cache(
            assess_cache_key,
            risk_data,
            ttl=settings.RISK_ASSESSMENT_CACHE_TTL,
        )

    if db is not None and models is not None and hasattr(models, "RiskAssessmentLog"):
        try:
            safety_score = max(0, min(100, int(round(100 - float(risk_data["score"])))))
            log_entry = models.RiskAssessmentLog(
                user_address=swap_request.user_address,
                token_in=swap_request.token_in,
                token_out=swap_request.token_out,
                amount_in=swap_request.amount_in,
                score=risk_data["score"],
                safety_score=safety_score,
                recommendation=risk_data["recommendation"],
                factors=risk_data["factors"],
            )
            db.add(log_entry)
            db.commit()
        except Exception:
            db.rollback()

    await add_transaction_to_monitor(
        {
            "user_address": swap_request.user_address,
            "token_in": swap_request.token_in,
            "token_out": swap_request.token_out,
            "amount_in": swap_request.amount_in,
            "signed_tx": swap_request.signature,
        }
    )

    return RiskResponse(**risk_data)


@app.post("/suggest")
async def get_swap_suggestions(
    request: SwapRequest,
    db: Session = Depends(get_db),
    user_address: str = Depends(get_current_user),
):
    if user_address.lower() != request.user_address.lower():
        raise HTTPException(status_code=403, detail="Address mismatch")

    adaptive_threshold = None
    if db is not None:
        try:
            adaptive_threshold = await get_adaptive_risk_threshold(request.user_address, db)
        except Exception:
            adaptive_threshold = 50

    suggestions = await suggest_alternatives(
        token_in=request.token_in,
        token_out=request.token_out,
        amount=request.amount_in,
        user_address=request.user_address,
        db=db,
    )
    return {"adaptive_threshold": adaptive_threshold, "suggestions": suggestions}


@app.post("/suggestion-feedback")
async def suggestion_feedback(
    payload: SuggestionFeedbackRequest,
    db: Session = Depends(get_db),
    user_address: str = Depends(get_current_user),
):
    if user_address.lower() != payload.user_address.lower():
        raise HTTPException(status_code=403, detail="Address mismatch")

    if (
        db is not None
        and models is not None
        and hasattr(models, "SuggestionLog")
    ):
        try:
            record = models.SuggestionLog(
                user_address=payload.user_address,
                suggestion_type=payload.suggestion_type,
                suggested_params=json.dumps(payload.suggested_params),
                safety_score=payload.safety_score,
                accepted=payload.accepted,
            )
            db.add(record)
            db.commit()
        except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to log suggestion feedback",
            )
    return {"ok": True}


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="ok")

