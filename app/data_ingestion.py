import logging
from typing import Any, Dict

from .cache import get_cache, set_cache
from .config import settings
from .blockchain import onechain
from .mock_data import (
    get_mock_mempool,
    get_mock_pool_health,
    get_mock_volatility,
    get_mock_wallet_reputation,
)
from .oneid import oneid
from .onepredict import onepredict

logger = logging.getLogger(__name__)


async def get_mempool_snapshot(token_pair: str) -> Dict[str, Any]:
    """
    Fetch mempool-derived metrics for a token pair.
    Public RPC often cannot expose full txpool; fallback values are returned.
    """
    if settings.USE_MOCK_DATA:
        return get_mock_mempool(token_pair)

    cache_key = f"mempool:{token_pair}"
    cached = await get_cache(cache_key)
    if cached is not None:
        return cached

    # Public RPC often does not expose txpool; keep stable fallback.
    snapshot = {
        "pending_count": 0,
        "gas_price_percentile": 50,
        "gas_price_std": 0,
        "time_since_last_block": 2,
    }
    await set_cache(cache_key, snapshot, ttl=settings.FEATURE_CACHE_TTL)
    return snapshot


async def get_pool_health(token_in: str, token_out: str) -> Dict[str, Any]:
    """Fetch pool metrics from OneChain / OneDEX."""
    if settings.USE_MOCK_DATA:
        return get_mock_pool_health(token_in, token_out)

    cache_key = f"pool_health:{token_in}:{token_out}"
    cached = await get_cache(cache_key)
    if cached is not None:
        return cached

    try:
        _pool_addr = await onechain.get_pool(token_in, token_out)
        liquidity_usd = await onechain.get_pool_liquidity_usd(token_in, token_out)

        pool_data = {
            "liquidity_usd": liquidity_usd,
            "volume_24h": 0.0,
            "lp_holder_count": 0,
            "lp_holder_concentration": 0.0,
        }
        await set_cache(cache_key, pool_data, ttl=settings.FEATURE_CACHE_TTL)
        return pool_data
    except Exception as exc:
        logger.error("Failed to fetch pool health: %s", exc)
        fallback = {
            "liquidity_usd": 0.0,
            "volume_24h": 0.0,
            "lp_holder_count": 0,
            "lp_holder_concentration": 1.0,
        }
        await set_cache(cache_key, fallback, ttl=10)
        return fallback


async def get_wallet_reputation(address: str) -> Dict[str, Any]:
    if settings.USE_MOCK_DATA:
        return get_mock_wallet_reputation(address)

    return await oneid.get_wallet_reputation(address)


async def get_volatility_forecast(token_pair: str) -> float:
    if settings.USE_MOCK_DATA:
        return get_mock_volatility(token_pair)

    return await onepredict.get_volatility_forecast(token_pair)

