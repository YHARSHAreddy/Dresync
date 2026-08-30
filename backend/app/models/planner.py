import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class WeeklyPlan(Base):
    __tablename__ = "weekly_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Monday of the week this plan covers
    week_start = Column(Date, nullable=False)

    monday_outfit_id = Column(UUID(as_uuid=True), ForeignKey("outfits.id", ondelete="SET NULL"), nullable=True)
    tuesday_outfit_id = Column(UUID(as_uuid=True), ForeignKey("outfits.id", ondelete="SET NULL"), nullable=True)
    wednesday_outfit_id = Column(UUID(as_uuid=True), ForeignKey("outfits.id", ondelete="SET NULL"), nullable=True)
    thursday_outfit_id = Column(UUID(as_uuid=True), ForeignKey("outfits.id", ondelete="SET NULL"), nullable=True)
    friday_outfit_id = Column(UUID(as_uuid=True), ForeignKey("outfits.id", ondelete="SET NULL"), nullable=True)
    saturday_outfit_id = Column(UUID(as_uuid=True), ForeignKey("outfits.id", ondelete="SET NULL"), nullable=True)
    sunday_outfit_id = Column(UUID(as_uuid=True), ForeignKey("outfits.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="weekly_plans")
    monday_outfit = relationship("Outfit", foreign_keys=[monday_outfit_id])
    tuesday_outfit = relationship("Outfit", foreign_keys=[tuesday_outfit_id])
    wednesday_outfit = relationship("Outfit", foreign_keys=[wednesday_outfit_id])
    thursday_outfit = relationship("Outfit", foreign_keys=[thursday_outfit_id])
    friday_outfit = relationship("Outfit", foreign_keys=[friday_outfit_id])
    saturday_outfit = relationship("Outfit", foreign_keys=[saturday_outfit_id])
    sunday_outfit = relationship("Outfit", foreign_keys=[sunday_outfit_id])
