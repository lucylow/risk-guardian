from celery import Celery

from .config import settings

celery_app = Celery(
    "risk_oracle",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)


@celery_app.task
def send_alert(user_address: str, message: dict) -> None:
    # Placeholder for push/email integrations.
    _ = (user_address, message)
