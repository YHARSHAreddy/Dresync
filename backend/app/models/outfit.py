import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, Float, Integer, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base


class Outfit(Base):
    __tablename__ = "outfits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    name = Column(String(200), nullable=True)

    # Item references — each role is optional since not every outfit has all pieces
    top_id = Column(UUID(as_uuid=True), ForeignKey("clothing_items.id", ondelete="SET NULL"), nullable=True)
    bottom_id = Column(UUID(as_uuid=True), ForeignKey("clothing_items.id", ondelete="SET NULL"), nullable=True)
    outerwear_id = Column(UUID(as_uuid=True), ForeignKey("clothing_items.id", ondelete="SET NULL"), nullable=True)
    shoes_id = Column(UUID(as_uuid=True), ForeignKey("clothing_items.id", ondelete="SET NULL"), nullable=True)
    accessory_ids = Column(JSONB, default=list)  # list of UUID strings

    # Scoring
    compatibility_score = Column(Float, default=0.0)
    recommendation_reasons = Column(JSONB, default=list)  # [{"type": "color", "description": "..."}]

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

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    outfit_id = Column(UUID(as_uuid=True), ForeignKey("outfits.id", ondelete="CASCADE"), nullable=False)
    worn_date = Column(Date, nullable=False, default=date.today)
    rating = Column(Integer, nullable=True)  # 1–5 stars
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="outfit_history")
    outfit = relationship("Outfit")
