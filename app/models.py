from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field
from sqlalchemy import JSON, Boolean, Column, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class RiskAssessmentLog(Base):
    __tablename__ = "risk_assessment_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_address = Column(String(42), index=True, nullable=False)
    token_in = Column(String(128), nullable=False)
    token_out = Column(String(128), nullable=False)
    amount_in = Column(Float, nullable=False)
    score = Column(Float, nullable=False)
    recommendation = Column(String(16), nullable=False)
    factors = Column(JSON, nullable=False)
    safety_score = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class SuggestionLog(Base):
    __tablename__ = "suggestion_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_address = Column(String(42), index=True, nullable=False)
    suggestion_type = Column(String(50), nullable=False)
    suggested_params = Column(Text, nullable=False)
    safety_score = Column(Integer, nullable=True)
    accepted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class UserSettings(Base):
    __tablename__ = "user_settings"

    user_address = Column(String(42), primary_key=True, index=True)
    auto_protect_enabled = Column(Boolean, default=False, nullable=False)
    risk_threshold = Column(Integer, default=50, nullable=False)
    auto_adjust_slippage = Column(Boolean, default=True, nullable=False)
    notify_on_high_risk = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class UserSettingsBase(BaseModel):
    auto_protect_enabled: bool = False
    risk_threshold: int = Field(50, ge=0, le=100)
    auto_adjust_slippage: bool = True
    notify_on_high_risk: bool = True


class UserSettingsCreate(UserSettingsBase):
    pass


class UserSettingsUpdate(BaseModel):
    auto_protect_enabled: Optional[bool] = None
    risk_threshold: Optional[int] = Field(None, ge=0, le=100)
    auto_adjust_slippage: Optional[bool] = None
    notify_on_high_risk: Optional[bool] = None


class UserSettingsResponse(UserSettingsBase):
    user_address: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RiskResponse(BaseModel):
    score: float
    recommendation: str
    factors: Dict[str, Any]
