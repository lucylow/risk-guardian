import asyncio
import logging
from typing import Any, Dict

from . import database, models
from .flashbots import flashbots
from .risk_engine import compute_risk_score
from .websocket import manager

logger = logging.getLogger(__name__)
monitor_queue: asyncio.Queue[Dict[str, Any]] = asyncio.Queue()


async def add_transaction_to_monitor(tx_data: Dict[str, Any]):
    await monitor_queue.put(tx_data)


async def automation_worker():
    while True:
        tx = None
        db = None
        try:
            tx = await monitor_queue.get()
            user_address = tx.get("user_address")
            if not user_address:
                continue

            db = next(database.get_db())
            settings = (
                db.query(models.UserSettings)
                .filter(models.UserSettings.user_address == user_address)
                .first()
            )
            if not settings or not settings.auto_protect_enabled:
                continue

            risk_data = await compute_risk_score(
                user_address=user_address,
                token_in=tx["token_in"],
                token_out=tx["token_out"],
                amount=tx["amount_in"],
            )
            safety_score = max(0, min(100, int(round(100 - risk_data["score"]))))

            if safety_score < settings.risk_threshold:
                logger.info(
                    "Auto-protect triggered for %s: safety=%s",
                    user_address,
                    safety_score,
                )
                if settings.auto_adjust_slippage and tx.get("signed_tx"):
                    await flashbots.send_private_transaction(tx["signed_tx"])

                if settings.notify_on_high_risk:
                    await manager.send_personal_message(
                        {
                            "type": "high_risk_alert",
                            "safety_score": safety_score,
                            "risk_breakdown": risk_data["factors"],
                            "recommendation": risk_data["recommendation"],
                        },
                        user_address,
                    )
        except Exception as exc:
            logger.error("Automation worker error: %s", exc)
        finally:
            if db is not None:
                db.close()
            if tx is not None:
                monitor_queue.task_done()
            await asyncio.sleep(1)
