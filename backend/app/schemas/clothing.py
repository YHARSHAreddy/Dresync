from pydantic import BaseModel, field_validator
from typing import Optional, List, Any
from datetime import datetime, date


from app.models.clothing import ClothingCategory, ClothingPattern, UsageStatus


class ClothingItemCreate(BaseModel):
    name: str
    category: ClothingCategory
    subcategory: Optional[str] = None
    primary_color: str
    secondary_colors: List[str] = []
    pattern: ClothingPattern = ClothingPattern.solid
    styles: List[str] = []
    seasons: List[str] = []
    occasions: List[str] = []
    notes: Optional[str] = None
    usage_status: UsageStatus = UsageStatus.active


class ClothingItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[ClothingCategory] = None
    subcategory: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_colors: Optional[List[str]] = None
    pattern: Optional[ClothingPattern] = None
    styles: Optional[List[str]] = None
    seasons: Optional[List[str]] = None
    occasions: Optional[List[str]] = None
    notes: Optional[str] = None
    usage_status: Optional[UsageStatus] = None


class ClothingItemOut(BaseModel):
    id: str
    user_id: str
    name: str
    category: ClothingCategory
    subcategory: Optional[str] = None
    primary_color: str
    secondary_colors: List[str] = []
    pattern: ClothingPattern
    styles: List[str] = []
    seasons: List[str] = []
    occasions: List[str] = []
    notes: Optional[str] = None
    image_url: Optional[str] = None
    usage_status: UsageStatus
    wear_count: int
    last_worn: Optional[date] = None
    created_at: datetime
    updated_at: datetime


    @field_validator("secondary_colors", "styles", "seasons", "occasions", mode="before")
    @classmethod
    def parse_json_lists(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            try:
                import json
                parsed = json.loads(v)
                return parsed if isinstance(parsed, list) else []
            except Exception:
                return []
        return v or []

    class Config:
        from_attributes = True



class WardrobeStats(BaseModel):
    total_items: int
    by_category: dict
    total_outfits: int
    total_worn: int
