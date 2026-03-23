from typing import Any, Dict, List

from sqlalchemy.orm import Session

from .data_ingestion import get_mempool_snapshot
from .risk_engine import compute_risk_score


async def suggest_alternatives(
    token_in: str,
    token_out: str,
    amount: float,
    user_address: str,
    db: Session,
) -> List[Dict[str, Any]]:
    _ = db
    suggestions: List[Dict[str, Any]] = []

    for fraction in (0.5, 0.25, 0.1):
        new_amount = round(amount * fraction, 6)
        risk_data = await compute_risk_score(
            user_address=user_address,
            token_in=token_in,
            token_out=token_out,
            amount=new_amount,
        )
        safety_score = max(0, min(100, int(round(100 - float(risk_data["score"])))))
        suggestions.append(
            {
                "type": "reduce_amount",
                "amount": new_amount,
                "safety_score": safety_score,
                "description": f"Swap {new_amount} {token_in} instead of {amount}",
                "recommendation": risk_data["recommendation"],
            }
        )

    suggestions.append(
        {
            "type": "alternative_pool",
            "safety_score": 85,
            "description": f"Use {token_out}-{token_in} pool (simulated lower routing risk)",
            "recommendation": "Lower slippage and deeper liquidity",
        }
    )

    mempool = await get_mempool_snapshot(f"{token_in}_{token_out}")
    if int(mempool.get("pending_count", 0)) > 10:
        suggestions.append(
            {
                "type": "wait",
                "safety_score": None,
                "description": "Wait 30 seconds while mempool congestion cools down",
                "recommendation": "Retry shortly for better execution",
            }
        )

    suggestions.sort(key=lambda s: s.get("safety_score") or 0, reverse=True)
    return suggestions
