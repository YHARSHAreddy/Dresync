from pydantic import BaseModel
from typing import Optional
from datetime import date
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
    created_at: date
    updated_at: date

    class Config:
        from_attributes = True
