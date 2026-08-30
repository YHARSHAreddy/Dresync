from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
import uuid
from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.schemas.outfit import OutfitGenerateRequest, OutfitOut, OutfitFavoriteResponse, HistoryOut
from app.services import outfit_service

router = APIRouter(prefix="/outfits", tags=["Outfits"])


@router.post("/generate", response_model=List[OutfitOut])
def generate_outfits(
    req: OutfitGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return outfit_service.generate_outfits(db, current_user.id, req)


@router.get("/", response_model=List[OutfitOut])
def list_outfits(
    favorites_only: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return outfit_service.get_outfits(db, current_user.id, favorites_only, skip, limit)


@router.get("/{outfit_id}", response_model=OutfitOut)
def get_outfit(
    outfit_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return outfit_service.get_outfit(db, outfit_id, current_user.id)


@router.post("/{outfit_id}/favorite", response_model=OutfitFavoriteResponse)
def toggle_favorite(
    outfit_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    outfit = outfit_service.toggle_favorite(db, outfit_id, current_user.id)
    return OutfitFavoriteResponse(id=outfit.id, is_favorite=outfit.is_favorite)


@router.post("/{outfit_id}/wear", response_model=HistoryOut)
def mark_worn(
    outfit_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return outfit_service.mark_worn(db, outfit_id, current_user.id)


@router.delete("/{outfit_id}", status_code=204)
def delete_outfit(
    outfit_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    outfit_service.delete_outfit(db, outfit_id, current_user.id)


@router.get("/history/all", response_model=List[HistoryOut])
def get_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return outfit_service.get_history(db, current_user.id, skip, limit)
