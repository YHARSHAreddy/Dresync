from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.schemas.planner import WeeklyPlanOut, PlannerGenerateRequest, DayOutfitUpdate
from app.services import planner_service

router = APIRouter(prefix="/planner", tags=["Planner"])


@router.get("/week", response_model=Optional[WeeklyPlanOut])
def get_current_week(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return planner_service.get_current_week_plan(db, current_user.id)


@router.post("/generate", response_model=WeeklyPlanOut)
def generate_week(
    req: PlannerGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return planner_service.generate_weekly_plan(db, current_user.id, req)


@router.post("/regenerate/{day}", response_model=WeeklyPlanOut)
def regenerate_day(
    day: str,
    req: PlannerGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return planner_service.regenerate_day(db, current_user.id, day, req)
