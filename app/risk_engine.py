"""
risk_engine.py — AI-powered risk scoring orchestrator for The Risk Oracle.

Computes a 0-100 Safety Score from three weighted ML sub-models:
  - Sandwich Attack Risk  (50%)
  - Liquidity Health Risk (30%)
  - Wallet Risk           (20%)

Falls back to heuristic models if trained .joblib files are absent.
All external data calls use a short-lived TTL cache to minimise RPC load.
"""

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

feature_cache: TTLCache = TTLCache(maxsize=256, ttl=settings.FEATURE_CACHE_TTL)

# ─── Weights ──────────────────────────────────────────────────────────────────

WEIGHTS: Dict[str, float] = {
    "sandwich":  0.50,
    "liquidity": 0.30,
    "wallet":    0.20,
}

# ─── Fallback heuristic models ────────────────────────────────────────────────


class _FallbackSandwichDetector:
    """Rule-based sandwich attack probability (0-100)."""

    def predict(self, features: Dict[str, Any]) -> int:
        score = 10
        pending = int(features.get("pending_count_same_pair", 0))
        if pending > 30:
            score += 35
        elif pending > 15:
            score += 20
        elif pending > 8:
            score += 8
        amount_usd: float = float(features.get("amount_usd", 0))
        score += int(min(amount_usd / 5000, 1.0) * 25)
        if float(features.get("gas_price_std", 0)) > 20:
            score += 5
        return max(0, min(100, score))


class _FallbackLiquidityAssessor:
    """Rule-based liquidity health score (0-100, higher = healthier)."""

    def predict(self, features: Dict[str, Any]) -> int:
        health = 50
        liquidity: float = float(features.get("liquidity_usd", 0))
        concentration: float = float(features.get("lp_holder_concentration", 1.0))
        volume: float = float(features.get("volume_24h", 0))
        amount_usd: float = float(features.get("amount_usd", 0))

        if liquidity > 3_000_000:
            health += 25
        elif liquidity > 500_000:
            health += 10

        if concentration < 0.25:
            health += 20
        elif concentration > 0.60:
            health -= 25

        if volume > 1_000_000:
            health += 5

        health -= int(min(amount_usd / 5000, 1.0) * 15)
        return max(0, min(100, health))


class _FallbackWalletAssessor:
    """Rule-based wallet risk score (0-100, higher = riskier)."""

    def predict(self, features: Dict[str, Any]) -> int:
        rep_score: int = int(features.get("wallet_score", 50))
        flags: int = int(features.get("flag_count", 0))
        risk = (100 - rep_score) + (flags * 10)
        return max(0, min(100, risk))


class _FallbackModels:
    sandwich_detector = _FallbackSandwichDetector()
    liquidity_assessor = _FallbackLiquidityAssessor()
    wallet_assessor = _FallbackWalletAssessor()


# ─── Model loading ────────────────────────────────────────────────────────────

try:
    from . import ml_models  # type: ignore
except Exception:
    ml_models = _FallbackModels()  # type: ignore

try:
    from . import models as db_models  # type: ignore
except Exception:
    db_models = None  # type: ignore


# ─── Cache helper ─────────────────────────────────────────────────────────────


async def _cached(cache_key: str, fetch_func, *args, **kwargs):
    """Return cached value or call fetch_func and cache the result."""
    if cache_key in feature_cache:
        return feature_cache[cache_key]
    data = await fetch_func(*args, **kwargs)
    feature_cache[cache_key] = data
    return data


# ─── Sub-model inference ──────────────────────────────────────────────────────


async def detect_sandwich_risk(token_in: str, token_out: str, amount: float) -> int:
    """Return sandwich attack probability 0-100."""
    pair = f"{token_in}_{token_out}"
    mempool = await _cached(f"mempool_{pair}", get_mempool_snapshot, pair)
    pool = await _cached(f"pool_{pair}", get_pool_health, token_in, token_out)
    volatility = await _cached(f"vol_{pair}", get_volatility_forecast, pair)

    features: Dict[str, Any] = {
        "pending_count_same_pair": mempool.get("pending_count", 0),
        "gas_price_percentile":   mempool.get("gas_price_percentile", 50),
        "gas_price_std":          mempool.get("gas_price_std", 0),
        "time_since_last_block":  mempool.get("time_since_last_block", 2),
        "amount_usd":             amount,
        "is_large_trade":         1 if amount > 5_000 else 0,
        "pool_liquidity_usd":     pool.get("liquidity_usd", 0),
        "volatility_forecast":    volatility,
    }
    risk = int(ml_models.sandwich_detector.predict(features))
    logger.debug("sandwich_risk pair=%s amount=%.2f score=%d", pair, amount, risk)
    return max(0, min(100, risk))


async def assess_liquidity_health(token_in: str, token_out: str, amount: float = 0.0) -> int:
    """Return liquidity health 0-100 (higher = healthier pool)."""
    pair = f"{token_in}_{token_out}"
    pool = await _cached(f"pool_{pair}", get_pool_health, token_in, token_out)

    features: Dict[str, Any] = {
        "liquidity_usd":          pool.get("liquidity_usd", 0),
        "volume_24h":             pool.get("volume_24h", 0),
        "lp_holder_count":        pool.get("lp_holder_count", 0),
        "lp_holder_concentration":pool.get("lp_holder_concentration", 1.0),
        "amount_usd":             amount,
    }
    health = int(ml_models.liquidity_assessor.predict(features))
    logger.debug("liquidity_health pair=%s score=%d", pair, health)
    return max(0, min(100, health))


async def assess_wallet_risk(user_address: str) -> int:
    """Return wallet risk 0-100 (higher = riskier)."""
    reputation = await _cached(f"wallet_{user_address}", get_wallet_reputation, user_address)
    features: Dict[str, Any] = {
        "wallet_score": reputation.get("score", 50),
        "flag_count":   len(reputation.get("flags", [])),
    }
    risk = int(ml_models.wallet_assessor.predict(features))
    logger.debug("wallet_risk address=%s score=%d", user_address, risk)
    return max(0, min(100, risk))


# ─── Explanation generator ────────────────────────────────────────────────────


def _build_explanation(sandwich: int, liquidity: int, wallet: int, volatility: float) -> str:
    parts: list[str] = []

    if sandwich > 40:
        parts.append("⚡ High sandwich probability: elevated mempool activity detected for this pair.")
    elif sandwich > 20:
        parts.append("⚠ Moderate sandwich risk — some MEV bot activity in the mempool.")
    else:
        parts.append("✓ Sandwich risk is low — mempool looks clean for this pair.")

    if liquidity < 50:
        parts.append("💧 Pool is shallow — your trade will cause significant price impact.")
    elif liquidity < 70:
        parts.append("💧 Pool health is moderate; monitor slippage carefully.")
    else:
        parts.append("💧 Pool has deep liquidity — price impact should be minimal.")

    if wallet > 60:
        parts.append("🔴 Wallet flagged by OneID for suspicious on-chain activity.")
    elif wallet > 30:
        parts.append("🟡 Limited wallet history — no flags, but verify all contract addresses.")
    else:
        parts.append("✅ Wallet reputation is clean per OneID.")

    if volatility > 70:
        parts.append("📈 High market volatility — prices may swing rapidly during execution.")

    return " ".join(parts)


def _build_recommendation(safety_score: int) -> tuple[str, str]:
    """Return (recommendation_text, recommendation_type)."""
    if safety_score < 30:
        return (
            "🚨 Do NOT proceed — extremely high risk. Consider a different pair or a much smaller amount.",
            "danger",
        )
    if safety_score < 60:
        return (
            "🟡 Proceed with caution — reduce swap size or increase slippage tolerance to mitigate risk.",
            "moderate",
        )
    return (
        "✅ Low risk — safe to swap. Always double-check the token contract address.",
        "safe",
    )


# ─── Main orchestrator ────────────────────────────────────────────────────────


async def compute_risk_score(
    user_address: str,
    token_in: str,
    token_out: str,
    amount: float,
) -> Dict[str, Any]:
    """
    Orchestrate all risk sub-models and return a unified risk assessment dict.

    Returns:
        {
            safety_score: int,            # 0-100 (higher = safer)
            recommendation_type: str,     # "safe" | "moderate" | "danger"
            risk_breakdown: {
                sandwich_risk: int,
                liquidity_health: int,
                wallet_risk: int,
            },
            explanation: str,
            recommendation: str,
            # legacy keys kept for backwards-compat with Python backend routes
            score: float,
            recommendation: str,
            factors: { sandwich_risk, liquidity_risk, wallet_risk },
        }
    """
    sandwich_risk  = await detect_sandwich_risk(token_in, token_out, amount)
    liquidity_health = await assess_liquidity_health(token_in, token_out, amount)
    wallet_risk    = await assess_wallet_risk(user_address)
    volatility     = float(await _cached(
        f"vol_{token_in}_{token_out}",
        get_volatility_forecast,
        f"{token_in}_{token_out}",
    ))

    liquidity_risk = 100 - liquidity_health
    total_risk = (
        WEIGHTS["sandwich"]  * sandwich_risk
        + WEIGHTS["liquidity"] * liquidity_risk
        + WEIGHTS["wallet"]    * wallet_risk
    )
    safety_score = max(0, min(100, round(100 - total_risk)))

    explanation = _build_explanation(sandwich_risk, liquidity_health, wallet_risk, volatility)
    recommendation, recommendation_type = _build_recommendation(safety_score)

    return {
        # Primary fields (used by edge function + frontend)
        "safety_score":        safety_score,
        "recommendation_type": recommendation_type,
        "risk_breakdown": {
            "sandwich_risk":    sandwich_risk,
            "liquidity_health": liquidity_health,
            "wallet_risk":      wallet_risk,
        },
        "explanation":    explanation,
        "recommendation": recommendation,
        # Legacy fields kept for Python /assess route
        "score":       float(safety_score),
        "factors": {
            "sandwich_risk":  sandwich_risk,
            "liquidity_risk": liquidity_risk,
            "wallet_risk":    wallet_risk,
        },
    }


# ─── Adaptive threshold ───────────────────────────────────────────────────────


async def get_adaptive_risk_threshold(user_address: str, db: Session) -> int:
    """
    Compute a personalised tolerance (0-100) from the user's acceptance history
    and current market volatility.  Higher value = user historically accepts more risk.
    Falls back to 50 if no history or DB models unavailable.
    """
    if db_models is None or not hasattr(db_models, "RiskAssessmentLog"):
        return 50

    logs = (
        db.query(db_models.RiskAssessmentLog)
        .filter(db_models.RiskAssessmentLog.user_address == user_address)
        .order_by(db_models.RiskAssessmentLog.created_at.desc())
        .limit(50)
        .all()
    )
    if not logs:
        return 50

    accepted_scores = [
        int(log.safety_score)
        for log in logs
        if getattr(log, "safety_score", None) is not None
    ]
    avg_accepted = mean(accepted_scores) if accepted_scores else 50.0

    volatility = float(await get_volatility_forecast("ONE_USDC"))
    # Dampen threshold when market is volatile
    volatility_factor = max(0.0, 1.0 - (volatility / 100.0))
    threshold = int(avg_accepted * volatility_factor)
    return max(10, min(90, threshold))
