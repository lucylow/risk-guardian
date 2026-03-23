import logging
from statistics import mean
from typing import Any, Dict

from cachetools import TTLCache
from sqlalchemy.orm import Session

from .config import settings
from .data_ingestion import (
    get_mempool_snapshot,
    get_pool_health,
    get_volatility_forecast,
    get_wallet_reputation,
)

logger = logging.getLogger(__name__)

feature_cache = TTLCache(maxsize=100, ttl=settings.FEATURE_CACHE_TTL)


class _FallbackSandwichDetector:
    def predict(self, features: Dict[str, Any]) -> int:
        score = 0
        if features.get("is_large_trade", 0):
            score += 30
        score += min(int(features.get("pending_count_same_pair", 0)), 40)
        score += int(float(features.get("volatility_forecast", 50)) * 0.2)
        return max(0, min(100, score))


class _FallbackLiquidityAssessor:
    def predict(self, features: Dict[str, Any]) -> int:
        liquidity = float(features.get("liquidity_usd", 0))
        concentration = float(features.get("lp_holder_concentration", 1))
        risk = 100
        if liquidity > 0:
            risk -= min(int(liquidity / 10000), 70)
        risk += int(concentration * 20)
        return max(0, min(100, risk))


class _FallbackWalletAssessor:
    def predict(self, features: Dict[str, Any]) -> int:
        score = int(features.get("wallet_score", 50))
        flags = int(features.get("flag_count", 0))
        risk = (100 - score) + (flags * 10)
        return max(0, min(100, risk))


class _FallbackModels:
    sandwich_detector = _FallbackSandwichDetector()
    liquidity_assessor = _FallbackLiquidityAssessor()
    wallet_assessor = _FallbackWalletAssessor()


try:
    from . import ml_models  # type: ignore
except Exception:
    ml_models = _FallbackModels()  # type: ignore

try:
    from . import models  # type: ignore
except Exception:
    models = None  # type: ignore


async def get_cached_or_fetch(cache_key: str, fetch_func, *args, **kwargs):
    if cache_key in feature_cache:
        return feature_cache[cache_key]
    data = await fetch_func(*args, **kwargs)
    feature_cache[cache_key] = data
    return data


async def detect_sandwich_risk(token_in: str, token_out: str, amount: float) -> int:
    token_pair = f"{token_in}_{token_out}"
    mempool = await get_cached_or_fetch(f"mempool_{token_pair}", get_mempool_snapshot, token_pair)
    pool = await get_cached_or_fetch(f"pool_{token_pair}", get_pool_health, token_in, token_out)
    volatility = await get_cached_or_fetch(f"volatility_{token_pair}", get_volatility_forecast, token_pair)

    amount_usd = amount
    features = {
        "pending_count_same_pair": mempool.get("pending_count", 0),
        "gas_price_percentile": mempool.get("gas_price_percentile", 50),
        "gas_price_std": mempool.get("gas_price_std", 0),
        "time_since_last_block": mempool.get("time_since_last_block", 2),
        "amount_usd": amount_usd,
        "is_large_trade": 1 if amount_usd > 5000 else 0,
        "pool_liquidity_usd": pool.get("liquidity_usd", 0),
        "volatility_forecast": volatility,
    }
    risk = int(ml_models.sandwich_detector.predict(features))
    return max(0, min(100, risk))


async def assess_liquidity_health(token_in: str, token_out: str) -> int:
    pool = await get_cached_or_fetch(f"pool_{token_in}_{token_out}", get_pool_health, token_in, token_out)
    features = {
        "liquidity_usd": pool.get("liquidity_usd", 0),
        "volume_24h": pool.get("volume_24h", 0),
        "lp_holder_count": pool.get("lp_holder_count", 0),
        "lp_holder_concentration": pool.get("lp_holder_concentration", 1),
    }
    risk = int(ml_models.liquidity_assessor.predict(features))
    return max(0, min(100, risk))


async def assess_wallet_risk(user_address: str) -> int:
    reputation = await get_cached_or_fetch(f"wallet_{user_address}", get_wallet_reputation, user_address)
    features = {
        "wallet_score": reputation.get("score", 50),
        "flag_count": len(reputation.get("flags", [])),
    }
    risk = int(ml_models.wallet_assessor.predict(features))
    return max(0, min(100, risk))


async def compute_risk_score(user_address: str, token_in: str, token_out: str, amount: float) -> Dict[str, Any]:
    sandwich_risk = await detect_sandwich_risk(token_in, token_out, amount)
    liquidity_risk = await assess_liquidity_health(token_in, token_out)
    wallet_risk = await assess_wallet_risk(user_address)

    total_score = round((0.45 * sandwich_risk) + (0.35 * liquidity_risk) + (0.20 * wallet_risk), 2)
    recommendation = "BLOCK" if total_score >= 75 else "WARN" if total_score >= 45 else "ALLOW"

    return {
        "score": total_score,
        "recommendation": recommendation,
        "factors": {
            "sandwich_risk": sandwich_risk,
            "liquidity_risk": liquidity_risk,
            "wallet_risk": wallet_risk,
        },
    }


async def get_adaptive_risk_threshold(user_address: str, db: Session) -> int:
    """
    Compute personalized tolerance (0-100) from user history and market volatility.
    Higher value means user historically tolerates more risk.
    """
    if models is None or not hasattr(models, "RiskAssessmentLog"):
        return 50

    logs = (
        db.query(models.RiskAssessmentLog)
        .filter(models.RiskAssessmentLog.user_address == user_address)
        .order_by(models.RiskAssessmentLog.created_at.desc())
        .limit(50)
        .all()
    )
    if not logs:
        return 50

    accepted_safety_scores = [
        int(log.safety_score)
        for log in logs
        if getattr(log, "safety_score", None) is not None
    ]
    avg_accepted = mean(accepted_safety_scores) if accepted_safety_scores else 50.0

    volatility = float(await get_volatility_forecast("ONE_USDC"))
    volatility_factor = max(0.0, 1.0 - (volatility / 100.0))
    threshold = int(avg_accepted * volatility_factor)
    return max(10, min(90, threshold))

