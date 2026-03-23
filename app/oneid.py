import logging
from typing import Any, Dict

import httpx

from .config import settings

logger = logging.getLogger(__name__)


class OneIDClient:
    def __init__(self) -> None:
        self.base_url = settings.ONE_ID_API_URL.rstrip("/")
        self.api_key = settings.ONE_ID_API_KEY
        self.client = httpx.AsyncClient(timeout=5.0)

    async def get_wallet_reputation(self, address: str) -> Dict[str, Any]:
        """
        Returns:
        {
          "score": int(0-100),
          "flags": list[str],
          "history": dict
        }
        """
        if not self.api_key:
            logger.warning("OneID API key not set; using fallback reputation.")
            return {"score": 50, "flags": [], "history": {}}

        try:
            response = await self.client.get(
                f"{self.base_url}/reputation/{address}",
                headers={"Authorization": f"Bearer {self.api_key}"},
            )
            response.raise_for_status()
            data = response.json()
            if not isinstance(data, dict):
                return {"score": 50, "flags": [], "history": {}}
            return data
        except Exception as exc:
            logger.error("OneID API error: %s", exc)
            return {"score": 50, "flags": [], "history": {}}

    async def close(self) -> None:
        await self.client.aclose()


oneid = OneIDClient()

