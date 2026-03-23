import logging
from typing import Any, Dict, Optional

import httpx

from .config import settings

logger = logging.getLogger(__name__)


class FlashbotsClient:
    """
    Simulated client for submitting private transactions.
    In production, this should call a real relay API.
    """

    def __init__(self, relay_url: Optional[str] = None):
        self.relay_url = relay_url or settings.FLASHBOTS_RELAY_URL
        self.client = httpx.AsyncClient(timeout=10.0)

    async def send_private_transaction(
        self, signed_tx: str, target_block: Optional[int] = None
    ) -> Dict[str, Any]:
        _ = target_block
        logger.info("Simulated private tx submission: %s...", signed_tx[:20])
        return {"tx_hash": "0x" + "f" * 64, "accepted": True}

    async def close(self):
        await self.client.aclose()


flashbots = FlashbotsClient()
