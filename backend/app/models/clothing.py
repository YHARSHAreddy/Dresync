import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, Text, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base


class ClothingCategory(str, enum.Enum):
    top = "top"
    bottom = "bottom"
    outerwear = "outerwear"
    shoes = "shoes"
    accessory = "accessory"


class ClothingPattern(str, enum.Enum):
    solid = "solid"
    striped = "striped"
    checkered = "checkered"
    floral = "floral"
    geometric = "geometric"
    animal_print = "animal_print"
    abstract = "abstract"
    other = "other"


class UsageStatus(str, enum.Enum):
    active = "active"
    archived = "archived"


class ClothingItem(Base):
    __tablename__ = "clothing_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    name = Column(String(200), nullable=False)
    category = Column(Enum(ClothingCategory), nullable=False)
    subcategory = Column(String(100), nullable=True)

    primary_color = Column(String(50), nullable=False)
    secondary_colors = Column(JSONB, default=list)  # ["white", "grey"]

    pattern = Column(Enum(ClothingPattern), default=ClothingPattern.solid)

    styles = Column(JSONB, default=list)     # ["casual", "smart_casual"]
    seasons = Column(JSONB, default=list)    # ["spring", "summer", "all"]
    occasions = Column(JSONB, default=list)  # ["casual", "work", "formal"]

    notes = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)

    usage_status = Column(Enum(UsageStatus), default=UsageStatus.active, nullable=False)
    wear_count = Column(Integer, default=0, nullable=False)
    last_worn = Column(Date, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationship
    user = relationship("User", back_populates="clothing_items")
