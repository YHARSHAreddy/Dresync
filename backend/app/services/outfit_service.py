from typing import List, Optional
from datetime import date, datetime
import uuid
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from app.models.outfit import Outfit, OutfitHistory
from app.models.clothing import ClothingItem
from app.schemas.outfit import OutfitGenerateRequest, HistoryCreate
from app.ai.rule_based import recommend_outfits


def _load_outfit(db: Session, outfit_id: uuid.UUID, user_id: uuid.UUID) -> Outfit:
    outfit = (
        db.query(Outfit)
        .options(
            joinedload(Outfit.top),
            joinedload(Outfit.bottom),
            joinedload(Outfit.outerwear),
            joinedload(Outfit.shoes),
        )
        .filter(Outfit.id == outfit_id)
        .first()
    )
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    if outfit.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorised")
    return outfit


def generate_outfits(
    db: Session, user_id: uuid.UUID, req: OutfitGenerateRequest
) -> List[Outfit]:
    # Get all active clothing items for this user
    items = (
        db.query(ClothingItem)
        .filter(ClothingItem.user_id == user_id, ClothingItem.usage_status == "active")
        .all()
    )

    if not items:
        raise HTTPException(
            status_code=400,
            detail="Your wardrobe is empty. Add clothing items first.",
        )

    tops    = [i for i in items if i.category.value == "top"]
    bottoms = [i for i in items if i.category.value == "bottom"]

    if not tops or not bottoms:
        raise HTTPException(
            status_code=400,
            detail="You need at least one top and one bottom in your wardrobe to generate outfits.",
        )

    count = min(req.count, 10)  # cap at 10
    recommendations = recommend_outfits(
        items,
        n=count,
        occasion=req.occasion,
        season=req.season,
    )

    if not recommendations:
        raise HTTPException(
            status_code=400,
            detail="Could not generate outfits with your current wardrobe. Try adding more items.",
        )

    # Persist each generated outfit
    saved: List[Outfit] = []
    for rec in recommendations:
        outfit = Outfit(
            user_id=user_id,
            top_id=rec["top"].id if rec["top"] else None,
            bottom_id=rec["bottom"].id if rec["bottom"] else None,
            outerwear_id=rec["outerwear"].id if rec["outerwear"] else None,
            shoes_id=rec["shoes"].id if rec["shoes"] else None,
            accessory_ids=[str(a.id) for a in rec.get("accessories", [])],
            compatibility_score=rec["score"],
            recommendation_reasons=rec["reasons"],
            occasion=req.occasion,
            season=req.season,
            is_ai_generated=True,
        )
        db.add(outfit)

    db.commit()

    # Return with eager-loaded relationships
    return get_outfits(db, user_id, limit=count)


def get_outfits(
    db: Session,
    user_id: uuid.UUID,
    favorites_only: bool = False,
    skip: int = 0,
    limit: int = 50,
) -> List[Outfit]:
    query = (
        db.query(Outfit)
        .options(
            joinedload(Outfit.top),
            joinedload(Outfit.bottom),
            joinedload(Outfit.outerwear),
            joinedload(Outfit.shoes),
        )
        .filter(Outfit.user_id == user_id)
    )
    if favorites_only:
        query = query.filter(Outfit.is_favorite == True)
    return query.order_by(Outfit.created_at.desc()).offset(skip).limit(limit).all()


def get_outfit(db: Session, outfit_id: uuid.UUID, user_id: uuid.UUID) -> Outfit:
    return _load_outfit(db, outfit_id, user_id)


def toggle_favorite(db: Session, outfit_id: uuid.UUID, user_id: uuid.UUID) -> Outfit:
    outfit = _load_outfit(db, outfit_id, user_id)
    outfit.is_favorite = not outfit.is_favorite
    db.commit()
    db.refresh(outfit)
    return outfit


def delete_outfit(db: Session, outfit_id: uuid.UUID, user_id: uuid.UUID) -> None:
    outfit = _load_outfit(db, outfit_id, user_id)
    db.delete(outfit)
    db.commit()


def mark_worn(db: Session, outfit_id: uuid.UUID, user_id: uuid.UUID) -> OutfitHistory:
    outfit = _load_outfit(db, outfit_id, user_id)

    # Increment wear count on all items
    for item in [outfit.top, outfit.bottom, outfit.outerwear, outfit.shoes]:
        if item:
            item.wear_count = (item.wear_count or 0) + 1
            item.last_worn = date.today()

    history = OutfitHistory(
        user_id=user_id,
        outfit_id=outfit_id,
        worn_date=date.today(),
    )
    db.add(history)
    db.commit()
    db.refresh(history)
    return history


def get_history(
    db: Session,
    user_id: uuid.UUID,
    skip: int = 0,
    limit: int = 50,
) -> List[OutfitHistory]:
    return (
        db.query(OutfitHistory)
        .options(
            joinedload(OutfitHistory.outfit).options(
                joinedload(Outfit.top),
                joinedload(Outfit.bottom),
                joinedload(Outfit.outerwear),
                joinedload(Outfit.shoes),
            )
        )
        .filter(OutfitHistory.user_id == user_id)
        .order_by(OutfitHistory.worn_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
