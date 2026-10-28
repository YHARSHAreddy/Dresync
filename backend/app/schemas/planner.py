from pydantic import BaseModel, field_validator
from typing import Optional, Any
from datetime import date, datetime
import uuid
from app.schemas.outfit import OutfitOut


class PlannerGenerateRequest(BaseModel):
    occasion: Optional[str] = None
    season: Optional[str] = None


class DayOutfitUpdate(BaseModel):
    outfit_id: Optional[uuid.UUID] = None  # null to clear a day


class WeeklyPlanOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    week_start: date
    monday: Optional[OutfitOut] = None
    tuesday: Optional[OutfitOut] = None
    wednesday: Optional[OutfitOut] = None
    thursday: Optional[OutfitOut] = None
    friday: Optional[OutfitOut] = None
    saturday: Optional[OutfitOut] = None
    sunday: Optional[OutfitOut] = None
    created_at: datetime
    updated_at: datetime

    @field_validator("id", "user_id", mode="before")
    @classmethod
    def parse_uuid(cls, v: Any) -> uuid.UUID:
        if isinstance(v, str):
            return uuid.UUID(v)
        return v

    class Config:
        from_attributes = True

