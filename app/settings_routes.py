from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from . import database, models
from .dependencies import get_current_user_address
from .models import UserSettingsResponse, UserSettingsUpdate

router = APIRouter(prefix="/settings", tags=["User Settings"])


@router.get("/{user_address}", response_model=UserSettingsResponse)
def get_settings(user_address: str, db: Session = Depends(database.get_db)):
    settings = (
        db.query(models.UserSettings)
        .filter(models.UserSettings.user_address == user_address)
        .first()
    )
    if not settings:
        now = datetime.utcnow()
        return UserSettingsResponse(
            user_address=user_address,
            auto_protect_enabled=False,
            risk_threshold=50,
            auto_adjust_slippage=True,
            notify_on_high_risk=True,
            created_at=now,
            updated_at=now,
        )
    return settings


@router.post("/{user_address}", response_model=UserSettingsResponse)
def create_or_update_settings(
    user_address: str,
    settings_data: UserSettingsUpdate,
    db: Session = Depends(database.get_db),
    caller_address: str = Depends(get_current_user_address),
):
    if caller_address.lower() != user_address.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify another user's settings",
        )

    existing = (
        db.query(models.UserSettings)
        .filter(models.UserSettings.user_address == user_address)
        .first()
    )
    if existing:
        for key, value in settings_data.model_dump(exclude_unset=True).items():
            setattr(existing, key, value)
        existing.updated_at = datetime.utcnow()
    else:
        payload = settings_data.model_dump(exclude_unset=True)
        existing = models.UserSettings(user_address=user_address, **payload)
        db.add(existing)

    db.commit()
    db.refresh(existing)
    return existing
