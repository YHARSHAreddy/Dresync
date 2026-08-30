from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Query
from sqlalchemy.orm import Session
import uuid
from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.schemas.clothing import ClothingItemCreate, ClothingItemUpdate, ClothingItemOut, WardrobeStats
from app.services import wardrobe_service

router = APIRouter(prefix="/wardrobe", tags=["Wardrobe"])


@router.get("/stats", response_model=WardrobeStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return wardrobe_service.get_wardrobe_stats(db, current_user.id)


@router.get("/items", response_model=List[ClothingItemOut])
def list_items(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return wardrobe_service.get_items(db, current_user.id, category, search, skip, limit)


@router.post("/items", response_model=ClothingItemOut, status_code=201)
def add_item(
    data: ClothingItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return wardrobe_service.create_item(db, current_user.id, data)


@router.get("/items/{item_id}", response_model=ClothingItemOut)
def get_item(
    item_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return wardrobe_service.get_item(db, item_id, current_user.id)


@router.put("/items/{item_id}", response_model=ClothingItemOut)
def update_item(
    item_id: uuid.UUID,
    data: ClothingItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return wardrobe_service.update_item(db, item_id, current_user.id, data)


@router.delete("/items/{item_id}", status_code=204)
def delete_item(
    item_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    wardrobe_service.delete_item(db, item_id, current_user.id)


@router.post("/items/{item_id}/image", response_model=ClothingItemOut)
def upload_image(
    item_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return wardrobe_service.upload_image(db, item_id, current_user.id, file)
