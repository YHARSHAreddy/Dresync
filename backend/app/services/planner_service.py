from typing import Optional, List, Set
from datetime import date, timedelta
import uuid
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from app.models.planner import WeeklyPlan
from app.models.outfit import Outfit, OutfitHistory
from app.models.clothing import ClothingItem
from app.ai.rule_based import recommend_outfits
from app.schemas.planner import PlannerGenerateRequest

DAYS = [
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
]

DAY_OUTFIT_COLS = {
    "monday":    "monday_outfit_id",
    "tuesday":   "tuesday_outfit_id",
    "wednesday": "wednesday_outfit_id",
    "thursday":  "thursday_outfit_id",
    "friday":    "friday_outfit_id",
    "saturday":  "saturday_outfit_id",
    "sunday":    "sunday_outfit_id",
}

DAY_OUTFIT_RELS = {
    "monday":    "monday_outfit",
    "tuesday":   "tuesday_outfit",
    "wednesday": "wednesday_outfit",
    "thursday":  "thursday_outfit",
    "friday":    "friday_outfit",
    "saturday":  "saturday_outfit",
    "sunday":    "sunday_outfit",
}


def _current_week_start() -> date:
    today = date.today()
    return today - timedelta(days=today.weekday())


def _eager_load_plan(db: Session, plan: WeeklyPlan) -> WeeklyPlan:
    """Reload plan with all outfit relationships eager-loaded."""
    return (
        db.query(WeeklyPlan)
        .options(
            joinedload(WeeklyPlan.monday_outfit).options(
                joinedload(Outfit.top), joinedload(Outfit.bottom),
                joinedload(Outfit.outerwear), joinedload(Outfit.shoes)
            ),
            joinedload(WeeklyPlan.tuesday_outfit).options(
                joinedload(Outfit.top), joinedload(Outfit.bottom),
                joinedload(Outfit.outerwear), joinedload(Outfit.shoes)
            ),
            joinedload(WeeklyPlan.wednesday_outfit).options(
                joinedload(Outfit.top), joinedload(Outfit.bottom),
                joinedload(Outfit.outerwear), joinedload(Outfit.shoes)
            ),
            joinedload(WeeklyPlan.thursday_outfit).options(
                joinedload(Outfit.top), joinedload(Outfit.bottom),
                joinedload(Outfit.outerwear), joinedload(Outfit.shoes)
            ),
            joinedload(WeeklyPlan.friday_outfit).options(
                joinedload(Outfit.top), joinedload(Outfit.bottom),
                joinedload(Outfit.outerwear), joinedload(Outfit.shoes)
            ),
            joinedload(WeeklyPlan.saturday_outfit).options(
                joinedload(Outfit.top), joinedload(Outfit.bottom),
                joinedload(Outfit.outerwear), joinedload(Outfit.shoes)
            ),
            joinedload(WeeklyPlan.sunday_outfit).options(
                joinedload(Outfit.top), joinedload(Outfit.bottom),
                joinedload(Outfit.outerwear), joinedload(Outfit.shoes)
            ),
        )
        .filter(WeeklyPlan.id == plan.id)
        .first()
    )


import json

def _save_outfit(db: Session, user_id: str, rec: dict) -> Outfit:
    outfit = Outfit(
        user_id=str(user_id),
        top_id=rec["top"].id if rec["top"] else None,
        bottom_id=rec["bottom"].id if rec["bottom"] else None,
        outerwear_id=rec["outerwear"].id if rec["outerwear"] else None,
        shoes_id=rec["shoes"].id if rec["shoes"] else None,
        accessory_ids=json.dumps([str(a.id) for a in rec.get("accessories", [])]),
        compatibility_score=rec["score"],
        recommendation_reasons=json.dumps(rec["reasons"]),
        is_ai_generated=True,
    )
    db.add(outfit)
    db.flush()
    return outfit


def get_current_week_plan(db: Session, user_id: uuid.UUID) -> Optional[WeeklyPlan]:
    week_start = _current_week_start()
    user_id_str = str(user_id)
    plan = (
        db.query(WeeklyPlan)
        .filter(WeeklyPlan.user_id == user_id_str, WeeklyPlan.week_start == week_start)
        .first()
    )
    if plan:
        return _eager_load_plan(db, plan)
    return None


def generate_weekly_plan(
    db: Session, user_id: uuid.UUID, req: PlannerGenerateRequest
) -> WeeklyPlan:
    week_start = _current_week_start()
    user_id_str = str(user_id)

    items = (
        db.query(ClothingItem)
        .filter(ClothingItem.user_id == user_id_str, ClothingItem.usage_status == "active")
        .all()
    )

    tops    = [i for i in items if i.category.value == "top"]
    bottoms = [i for i in items if i.category.value == "bottom"]

    if not tops and not bottoms:
        raise HTTPException(
            status_code=400,
            detail="Add at least one top and one bottom to generate a weekly plan.",
        )
    elif not tops:
        raise HTTPException(
            status_code=400,
            detail="Add at least one top to generate a weekly plan.",
        )
    elif not bottoms:
        raise HTTPException(
            status_code=400,
            detail="Add at least one bottom to generate a weekly plan.",
        )

    # Get all potential outfits (without dedup) to know our baseline pool
    pool = recommend_outfits(
        items,
        n=20,
        occasion=req.occasion,
        season=req.season,
    )
    if not pool:
        # Fallback to no occasion/season filters if strict filters produced 0 combos
        pool = recommend_outfits(items, n=20)

    if not pool:
        raise HTTPException(
            status_code=400,
            detail="Add at least one top and one bottom to generate a weekly plan.",
        )

    # Generate 7 outfits, attempting distinct outfits first then reusing from pool
    used_item_sets: List[Set[str]] = []
    day_outfits: dict = {}
    pool_index = 0

    for day in DAYS:
        recs = recommend_outfits(
            items,
            n=3,
            occasion=req.occasion,
            season=req.season,
            exclude_outfit_item_sets=used_item_sets,
        )

        if recs:
            outfit_rec = recs[0]
            outfit = _save_outfit(db, user_id_str, outfit_rec)
            used_item_sets.append(outfit_rec.get("item_ids", set()))
            day_outfits[day] = outfit
        else:
            # All unique combinations used; reuse from pool so user gets all 7 days
            fallback_rec = pool[pool_index % len(pool)]
            pool_index += 1
            outfit = _save_outfit(db, user_id_str, fallback_rec)
            day_outfits[day] = outfit

    db.flush()

    # Upsert weekly plan
    plan = (
        db.query(WeeklyPlan)
        .filter(WeeklyPlan.user_id == user_id_str, WeeklyPlan.week_start == week_start)
        .first()
    )
    if not plan:
        plan = WeeklyPlan(user_id=user_id_str, week_start=week_start)
        db.add(plan)

    for day in DAYS:
        outfit = day_outfits.get(day)
        setattr(plan, DAY_OUTFIT_COLS[day], outfit.id if outfit else None)

    db.commit()
    return _eager_load_plan(db, plan)


def regenerate_day(
    db: Session,
    user_id: uuid.UUID,
    day: str,
    req: PlannerGenerateRequest,
    ) -> WeeklyPlan:
    if day not in DAYS:
        raise HTTPException(status_code=400, detail=f"Invalid day: {day}")

    week_start = _current_week_start()
    user_id_str = str(user_id)
    plan = (
        db.query(WeeklyPlan)
        .filter(WeeklyPlan.user_id == user_id_str, WeeklyPlan.week_start == week_start)
        .first()
    )
    if not plan:
        raise HTTPException(status_code=404, detail="No plan for this week. Generate one first.")

    items = (
        db.query(ClothingItem)
        .filter(ClothingItem.user_id == user_id_str, ClothingItem.usage_status == "active")
        .all()
    )

    # Collect item sets already used in other days to avoid repetition
    full_plan = _eager_load_plan(db, plan)
    used_item_sets: List[Set[str]] = []
    for d in DAYS:
        if d == day:
            continue
        outfit = getattr(full_plan, DAY_OUTFIT_RELS[d])
        if outfit:
            ids: Set[str] = set()
            for slot in [outfit.top, outfit.bottom, outfit.shoes, outfit.outerwear]:
                if slot:
                    ids.add(str(slot.id))
            if ids:
                used_item_sets.append(ids)

    recs = recommend_outfits(
        items,
        n=3,
        occasion=req.occasion,
        season=req.season,
        exclude_outfit_item_sets=used_item_sets,
    )
    if not recs:
        # Fall back to any recommendation from pool
        recs = recommend_outfits(items, n=1, occasion=req.occasion, season=req.season)
    if not recs:
        recs = recommend_outfits(items, n=1)

    if recs:
        outfit = _save_outfit(db, user_id_str, recs[0])
        db.flush()
        setattr(plan, DAY_OUTFIT_COLS[day], outfit.id)
    else:
        setattr(plan, DAY_OUTFIT_COLS[day], None)

    db.commit()
    return _eager_load_plan(db, plan)

