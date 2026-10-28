from typing import List, Optional
from datetime import datetime
import uuid
import json
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile
from app.models.clothing import ClothingItem, ClothingCategory
from app.models.outfit import Outfit
from app.models.user import User
from app.schemas.clothing import ClothingItemCreate, ClothingItemUpdate, WardrobeStats
from app.storage.local import storage
from app.core.config import settings


def _check_ownership(item: Optional[ClothingItem], user_id: str):
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorised")


def _deserialize_item(item: ClothingItem) -> ClothingItem:
    """Convert JSON-text columns back to Python lists for schema serialisation."""
    for field in ("secondary_colors", "styles", "seasons", "occasions"):
        raw = getattr(item, field)
        if isinstance(raw, str):
            try:
                setattr(item, field, json.loads(raw))
            except (json.JSONDecodeError, TypeError):
                setattr(item, field, [])
    return item


def get_items(
    db: Session,
    user_id: str,
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
    items = query.order_by(ClothingItem.created_at.desc()).offset(skip).limit(limit).all()
    return [_deserialize_item(i) for i in items]


def get_item(db: Session, item_id: str, user_id: str) -> ClothingItem:
    item = db.query(ClothingItem).filter(ClothingItem.id == str(item_id)).first()
    _check_ownership(item, str(user_id))
    return _deserialize_item(item)


def create_item(db: Session, user_id: str, data: ClothingItemCreate) -> ClothingItem:
    dump = data.model_dump()
    # Serialise list fields to JSON strings for storage
    for field in ("secondary_colors", "styles", "seasons", "occasions"):
        dump[field] = json.dumps(dump.get(field, []))
    item = ClothingItem(user_id=str(user_id), **dump)
    db.add(item)
    db.commit()
    db.refresh(item)
    return _deserialize_item(item)


def update_item(
    db: Session, item_id: str, user_id: str, data: ClothingItemUpdate
) -> ClothingItem:
    item = get_item(db, item_id, user_id)
    updates = data.model_dump(exclude_none=True)
    for field in ("secondary_colors", "styles", "seasons", "occasions"):
        if field in updates:
            updates[field] = json.dumps(updates[field])
    for field, value in updates.items():
        setattr(item, field, value)
    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return _deserialize_item(item)


def delete_item(db: Session, item_id: str, user_id: str) -> None:
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
    item_id: str,
    user_id: str,
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
    return _deserialize_item(item)


def get_wardrobe_stats(db: Session, user_id: str) -> WardrobeStats:
    items = db.query(ClothingItem).filter(ClothingItem.user_id == str(user_id)).all()
    total = len(items)

    by_cat: dict = {}
    for item in items:
        cat = item.category.value if hasattr(item.category, 'value') else str(item.category)
        by_cat[cat] = by_cat.get(cat, 0) + 1

    total_outfits = db.query(Outfit).filter(Outfit.user_id == str(user_id)).count()
    total_worn = sum(i.wear_count for i in items)

    return WardrobeStats(
        total_items=total,
        by_category=by_cat,
        total_outfits=total_outfits,
        total_worn=total_worn,
    )
