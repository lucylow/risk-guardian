import logging

import httpx

from .config import settings

logger = logging.getLogger(__name__)


class OnePredictClient:
    def __init__(self) -> None:
        self.base_url = settings.ONE_PREDICT_API_URL.rstrip("/")
        self.api_key = settings.ONE_PREDICT_API_KEY
        self.client = httpx.AsyncClient(timeout=5.0)

    async def get_volatility_forecast(self, token_pair: str) -> float:
        """Return OnePredict volatility score (0-100) for next hour."""
        if not self.api_key:
            logger.warning("OnePredict API key not set; using fallback volatility.")
            return 50.0

        try:
            response = await self.client.get(
                f"{self.base_url}/forecast",
                params={"pair": token_pair},
                headers={"Authorization": f"Bearer {self.api_key}"},
            )
            response.raise_for_status()
            data = response.json()
            return float(data.get("volatility", 50.0))
        except Exception as exc:
            logger.error("OnePredict API error: %s", exc)
            return 50.0

    async def close(self) -> None:
        await self.client.aclose()


onepredict = OnePredictClient()

