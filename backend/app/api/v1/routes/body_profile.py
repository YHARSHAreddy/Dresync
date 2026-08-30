from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, BodyProfile
from app.schemas.body_profile import BodyProfileCreate, BodyProfileUpdate, BodyProfileResponse

router = APIRouter()

@router.get("/me", response_model=BodyProfileResponse)
def get_my_body_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(BodyProfile).filter(BodyProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Body profile not found")
    return profile

@router.post("/me", response_model=BodyProfileResponse, status_code=status.HTTP_201_CREATED)
def create_body_profile(
    profile_in: BodyProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(BodyProfile).filter(BodyProfile.user_id == current_user.id).first()
    if profile:
        raise HTTPException(status_code=400, detail="Body profile already exists. Use PUT/PATCH to update.")
    
    new_profile = BodyProfile(
        user_id=current_user.id,
        height_cm=profile_in.height_cm,
        front_photo_url=profile_in.front_photo_url,
        side_photo_url=profile_in.side_photo_url
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile

@router.put("/me", response_model=BodyProfileResponse)
def update_body_profile(
    profile_in: BodyProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(BodyProfile).filter(BodyProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Body profile not found")
    
    if profile_in.height_cm != None:
        profile.height_cm = profile_in.height_cm
    if profile_in.front_photo_url != None:
        profile.front_photo_url = profile_in.front_photo_url
    if profile_in.side_photo_url != None:
        profile.side_photo_url = profile_in.side_photo_url

    db.commit()
    db.refresh(profile)
    return profile
