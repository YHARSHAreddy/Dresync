from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid
import os

from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.models.clothing import ClothingItem
from app.models.outfit import Outfit
from app.services.vto.fashn import FashnAIProvider
from app.services.vto.provider import VTORequest

router = APIRouter(prefix="/vto", tags=["Virtual Try-On"])

class VTOResponse(BaseModel):
    success: bool
    result_image_url: str | None = None
    error_message: str | None = None
    is_mock: bool = False
    status: str = "completed"

@router.post("/item/{item_id}", response_model=VTOResponse)
def try_on_item(
    item_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Ensure user has a body profile
    if not current_user.body_profile or not current_user.body_profile.front_photo_url:
        raise HTTPException(status_code=400, detail="Please upload a front photo in your Body Profile first.")
        
    item = db.query(ClothingItem).filter(ClothingItem.id == item_id, ClothingItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Clothing item not found")
        
    if not item.image_url:
        raise HTTPException(status_code=400, detail="Clothing item must have an image.")
        
    provider = FashnAIProvider()
    
    # Map internal category to provider category
    provider_category = ""
    if item.category.value in ["top", "outerwear"]:
        provider_category = "tops"
    elif item.category.value == "bottom":
        provider_category = "bottoms"
    elif item.category.value == "dress":
        provider_category = "one-pieces"
    else:
        provider_category = "unsupported"

    capabilities = provider.get_capabilities()
    if provider_category not in capabilities.get("supported_categories", []):
        raise HTTPException(status_code=400, detail=f"Category '{item.category}' is not supported by the current VTO provider.")
    
    req = VTORequest(
        user_image_path=current_user.body_profile.front_photo_url,
        garment_image_path=item.image_url,
        category=provider_category
    )
    
    result = provider.generate_try_on(req)
    if not result.success:
        raise HTTPException(status_code=500, detail=result.error_message or "VTO failed")
        
    return VTOResponse(
        success=result.success,
        result_image_url=result.result_image_url,
        error_message=result.error_message,
        is_mock=result.is_mock,
        status=result.status
    )

@router.post("/outfit/{outfit_id}", response_model=VTOResponse)
def try_on_outfit(
    outfit_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.body_profile or not current_user.body_profile.front_photo_url:
        raise HTTPException(status_code=400, detail="Please upload a front photo in your Body Profile first.")
        
    outfit = db.query(Outfit).filter(Outfit.id == outfit_id, Outfit.user_id == current_user.id).first()
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
        
    provider = FashnAIProvider()
    
    if not provider.get_capabilities().get("supports_multi_garment"):
        raise HTTPException(status_code=400, detail="Multi-garment outfit VTO is not currently supported by the active provider.")
        
    # Future multi-garment implementation would go here.
    # For now, this endpoint safely errors out instead of faking it.
    
    return VTOResponse(
        success=False,
        error_message="Not implemented"
    )
