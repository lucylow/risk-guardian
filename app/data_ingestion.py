from typing import Any, Dict

from .config import settings
from .mock_data import (
    get_mock_mempool,
    get_mock_pool_health,
    get_mock_volatility,
    get_mock_wallet_reputation,
)


async def get_pool_health(token_in: str, token_out: str) -> Dict[str, Any]:
    if settings.USE_MOCK_DATA:
        return get_mock_pool_health(token_in, token_out)
    raise NotImplementedError("Live pool health integration not implemented.")


async def get_mempool_snapshot(token_pair: str) -> Dict[str, Any]:
    if settings.USE_MOCK_DATA:
        return get_mock_mempool(token_pair)
    raise NotImplementedError("Live mempool integration not implemented.")


async def get_wallet_reputation(address: str) -> Dict[str, Any]:
    if settings.USE_MOCK_DATA:
        return get_mock_wallet_reputation(address)
    raise NotImplementedError("Live wallet reputation integration not implemented.")


async def get_volatility_forecast(token_pair: str) -> float:
    if settings.USE_MOCK_DATA:
        return get_mock_volatility(token_pair)
    raise NotImplementedError("Live volatility integration not implemented.")
import logging
from typing import Any, Dict

from .blockchain import onechain
from .oneid import oneid
from .onepredict import onepredict

logger = logging.getLogger(__name__)


async def get_mempool_snapshot(token_pair: str) -> Dict[str, Any]:
    """
    Fetch mempool-derived metrics for a token pair.
    Public RPC often cannot expose full txpool; fallback values are returned.
    """
    _ = token_pair
    return {
        "pending_count": 0,
        "gas_price_percentile": 50,
        "gas_price_std": 0,
        "time_since_last_block": 2,
    }


async def get_pool_health(token_in: str, token_out: str) -> Dict[str, Any]:
    """Fetch pool metrics from OneChain / OneDEX."""
    try:
        _pool_addr = await onechain.get_pool(token_in, token_out)
        liquidity_usd = await onechain.get_pool_liquidity_usd(token_in, token_out)

        return {
            "liquidity_usd": liquidity_usd,
            "volume_24h": 0.0,
            "lp_holder_count": 0,
            "lp_holder_concentration": 0.0,
        }
    except Exception as exc:
        logger.error("Failed to fetch pool health: %s", exc)
        return {
            "liquidity_usd": 0.0,
            "volume_24h": 0.0,
            "lp_holder_count": 0,
            "lp_holder_concentration": 1.0,
        }


async def get_wallet_reputation(address: str) -> Dict[str, Any]:
    return await oneid.get_wallet_reputation(address)


async def get_volatility_forecast(token_pair: str) -> float:
    return await onepredict.get_volatility_forecast(token_pair)

