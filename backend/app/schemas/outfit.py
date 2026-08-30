from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, date
import uuid
from app.schemas.clothing import ClothingItemOut


class OutfitGenerateRequest(BaseModel):
    occasion: Optional[str] = None
    season: Optional[str] = None
    count: int = 5


class ReasonOut(BaseModel):
    type: str
    description: str


class OutfitOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: Optional[str] = None
    top: Optional[ClothingItemOut] = None
    bottom: Optional[ClothingItemOut] = None
    outerwear: Optional[ClothingItemOut] = None
    shoes: Optional[ClothingItemOut] = None
    accessory_ids: List[str] = []
    compatibility_score: float
    recommendation_reasons: List[Dict[str, str]] = []
    occasion: Optional[str] = None
    season: Optional[str] = None
    is_favorite: bool
    is_ai_generated: bool
    created_at: datetime

    class Config:
        from_attributes = True


class OutfitFavoriteResponse(BaseModel):
    id: uuid.UUID
    is_favorite: bool


class HistoryCreate(BaseModel):
    outfit_id: uuid.UUID
    worn_date: Optional[date] = None
    rating: Optional[int] = None
    notes: Optional[str] = None


class HistoryOut(BaseModel):
    id: uuid.UUID
    outfit_id: uuid.UUID
    worn_date: date
    rating: Optional[int] = None
    notes: Optional[str] = None
    outfit: Optional[OutfitOut] = None
    created_at: datetime

    class Config:
        from_attributes = True
