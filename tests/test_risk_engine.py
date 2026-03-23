import asyncio

from app.risk_engine import compute_risk_score


def test_compute_risk_score_shape():
    result = asyncio.run(
        compute_risk_score(
            user_address="0x123",
            token_in="ONE",
            token_out="USDC",
            amount=100,
        )
    )
    assert "score" in result
    assert "recommendation" in result
    assert "factors" in result
    assert 0 <= result["score"] <= 100
