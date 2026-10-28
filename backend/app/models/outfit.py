import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, Float, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


def _new_uuid() -> str:
    return str(uuid.uuid4())


class Outfit(Base):
    __tablename__ = "outfits"

    id = Column(String(36), primary_key=True, default=_new_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    name = Column(String(200), nullable=True)

    # Item references — each role is optional
    top_id = Column(String(36), ForeignKey("clothing_items.id", ondelete="SET NULL"), nullable=True)
    bottom_id = Column(String(36), ForeignKey("clothing_items.id", ondelete="SET NULL"), nullable=True)
    outerwear_id = Column(String(36), ForeignKey("clothing_items.id", ondelete="SET NULL"), nullable=True)
    shoes_id = Column(String(36), ForeignKey("clothing_items.id", ondelete="SET NULL"), nullable=True)
    accessory_ids = Column(Text, default="[]")  # JSON list stored as text

    # Scoring
    compatibility_score = Column(Float, default=0.0)
    recommendation_reasons = Column(Text, default="[]")  # JSON list stored as text

    # Context
    occasion = Column(String(100), nullable=True)
    season = Column(String(50), nullable=True)

    # State
    is_favorite = Column(Boolean, default=False, nullable=False)
    is_ai_generated = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="outfits")
    top = relationship("ClothingItem", foreign_keys=[top_id])
    bottom = relationship("ClothingItem", foreign_keys=[bottom_id])
    outerwear = relationship("ClothingItem", foreign_keys=[outerwear_id])
    shoes = relationship("ClothingItem", foreign_keys=[shoes_id])


class OutfitHistory(Base):
    __tablename__ = "outfit_history"

    id = Column(String(36), primary_key=True, default=_new_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    outfit_id = Column(String(36), ForeignKey("outfits.id", ondelete="CASCADE"), nullable=False)
    worn_date = Column(Date, nullable=False, default=date.today)
    rating = Column(Integer, nullable=True)  # 1–5 stars
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="outfit_history")
    outfit = relationship("Outfit")
