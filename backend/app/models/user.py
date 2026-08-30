import uuid
from datetime import datetime
import sqlalchemy
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String(200), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    clothing_items = relationship(
        "ClothingItem", back_populates="user", cascade="all, delete-orphan"
    )
    outfits = relationship(
        "Outfit", back_populates="user", cascade="all, delete-orphan"
    )
    weekly_plans = relationship(
        "WeeklyPlan", back_populates="user", cascade="all, delete-orphan"
    )
    outfit_history = relationship(
        "OutfitHistory", back_populates="user", cascade="all, delete-orphan"
    )
    body_profile = relationship(
        "BodyProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )

class BodyProfile(Base):
    __tablename__ = "body_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), sqlalchemy.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    height_cm = Column(sqlalchemy.Float, nullable=True)
    front_photo_url = Column(String, nullable=True)
    side_photo_url = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="body_profile")
