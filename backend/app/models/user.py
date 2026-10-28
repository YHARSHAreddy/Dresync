import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


def _uuid_pk():
    """Cross-database UUID primary key (stored as VARCHAR for SQLite compat)."""
    return Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)


def _uuid_fk(target: str, **kwargs):
    """Cross-database UUID foreign key."""
    return Column(String(36), ForeignKey(target, **kwargs), nullable=False)


class User(Base):
    __tablename__ = "users"

    id = _uuid_pk()
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

    id = _uuid_pk()
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    height_cm = Column(Float, nullable=True)
    front_photo_url = Column(String, nullable=True)
    side_photo_url = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="body_profile")
