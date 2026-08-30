from typing import List, Optional
from datetime import datetime
import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile
from app.models.clothing import ClothingItem, ClothingCategory
from app.models.outfit import Outfit
from app.models.user import User
from app.schemas.clothing import ClothingItemCreate, ClothingItemUpdate, WardrobeStats
from app.storage.local import storage
from app.core.config import settings


def _check_ownership(item: Optional[ClothingItem], user_id: uuid.UUID):
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorised")


def get_items(
    db: Session,
    user_id: uuid.UUID,
    category: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[ClothingItem]:
    query = db.query(ClothingItem).filter(ClothingItem.user_id == user_id)
    if category:
        query = query.filter(ClothingItem.category == category)
    if search:
        query = query.filter(ClothingItem.name.ilike(f"%{search}%"))
    return query.order_by(ClothingItem.created_at.desc()).offset(skip).limit(limit).all()


def get_item(db: Session, item_id: uuid.UUID, user_id: uuid.UUID) -> ClothingItem:
    item = db.query(ClothingItem).filter(ClothingItem.id == item_id).first()
    _check_ownership(item, user_id)
    return item


def create_item(db: Session, user_id: uuid.UUID, data: ClothingItemCreate) -> ClothingItem:
    item = ClothingItem(user_id=user_id, **data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_item(
    db: Session, item_id: uuid.UUID, user_id: uuid.UUID, data: ClothingItemUpdate
) -> ClothingItem:
    item = get_item(db, item_id, user_id)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(item, field, value)
    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return item


def delete_item(db: Session, item_id: uuid.UUID, user_id: uuid.UUID) -> None:
    item = get_item(db, item_id, user_id)
    # Delete image file if exists
    if item.image_url:
        try:
            storage.delete(item.image_url)
        except Exception:
            pass
    db.delete(item)
    db.commit()


def upload_image(
    db: Session,
    item_id: uuid.UUID,
    user_id: uuid.UUID,
    file: UploadFile,
) -> ClothingItem:
    item = get_item(db, item_id, user_id)

    # Validate file type
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Use: {', '.join(settings.ALLOWED_IMAGE_TYPES)}",
        )

    # Read and validate size
    file_bytes = file.file.read()
    if len(file_bytes) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {settings.MAX_FILE_SIZE // (1024*1024)} MB",
        )

    # Delete old image
    if item.image_url:
        try:
            storage.delete(item.image_url)
        except Exception:
            pass

    # Save new image
    url = storage.save(file_bytes, file.filename, subfolder=str(user_id))
    item.image_url = url
    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return item


def get_wardrobe_stats(db: Session, user_id: uuid.UUID) -> WardrobeStats:
    items = db.query(ClothingItem).filter(ClothingItem.user_id == user_id).all()
    total = len(items)

    by_cat: dict = {}
    for item in items:
        cat = item.category.value
        by_cat[cat] = by_cat.get(cat, 0) + 1

    total_outfits = db.query(Outfit).filter(Outfit.user_id == user_id).count()
    total_worn = sum(i.wear_count for i in items)

    return WardrobeStats(
        total_items=total,
        by_category=by_cat,
        total_outfits=total_outfits,
        total_worn=total_worn,
    )
