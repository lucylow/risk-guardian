import asyncio
import json
from contextlib import asynccontextmanager
from typing import Any, Dict, Generator, Optional

from fastapi import Depends, FastAPI, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .automation import add_transaction_to_monitor, automation_worker
from .decision_support import suggest_alternatives
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


def _get_db_fallback() -> Generator[Optional[Session], None, None]:
    yield None


if database and hasattr(database, "get_db"):
    get_db = database.get_db  # type: ignore
else:
    get_db = _get_db_fallback


@asynccontextmanager
async def lifespan(_app: FastAPI):
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
    await onepredict.close()
    await oneid.close()


app = FastAPI(title="Risk Oracle API", version="1.0.0", lifespan=lifespan)
app.include_router(settings_router)
app.include_router(websocket_router)


@app.post("/assess", response_model=RiskResponse)
async def assess_swap(request: SwapRequest, db: Session = Depends(get_db)):
    message = (
        f"Swap {request.token_in} to {request.token_out} "
        f"amount {request.amount_in} nonce {request.nonce}"
    )
    if not verify_onewallet_signature(request.user_address, message, request.signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid signature",
        )

    risk_data = await compute_risk_score(
        user_address=request.user_address,
        token_in=request.token_in,
        token_out=request.token_out,
        amount=request.amount_in,
    )

    if db is not None and models is not None and hasattr(models, "RiskAssessmentLog"):
        try:
            safety_score = max(0, min(100, int(round(100 - float(risk_data["score"])))))
            log_entry = models.RiskAssessmentLog(
                user_address=request.user_address,
                token_in=request.token_in,
                token_out=request.token_out,
                amount_in=request.amount_in,
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
            "user_address": request.user_address,
            "token_in": request.token_in,
            "token_out": request.token_out,
            "amount_in": request.amount_in,
            "signed_tx": request.signature,
        }
    )

    return RiskResponse(**risk_data)


@app.post("/suggest")
async def get_swap_suggestions(request: SwapRequest, db: Session = Depends(get_db)):
    message = (
        f"Swap {request.token_in} to {request.token_out} "
        f"amount {request.amount_in} nonce {request.nonce}"
    )
    if not verify_onewallet_signature(request.user_address, message, request.signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid signature",
        )

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
    payload: SuggestionFeedbackRequest, db: Session = Depends(get_db)
):
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

