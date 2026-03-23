import json
from typing import Any, Optional

from .config import settings

try:
    import redis.asyncio as redis
except Exception:
    redis = None  # type: ignore

redis_client: Optional[Any] = None


async def init_redis() -> None:
    global redis_client
    if redis is None:
        redis_client = None
        return
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)


async def close_redis() -> None:
    global redis_client
    if redis_client is not None:
        await redis_client.aclose()
        redis_client = None


async def get_cache(key: str) -> Optional[Any]:
    if redis_client is None:
        return None
    data = await redis_client.get(key)
    if not data:
        return None
    return json.loads(data)


async def set_cache(key: str, value: Any, ttl: int = 60) -> None:
    if redis_client is None:
        return
    await redis_client.setex(key, ttl, json.dumps(value))
