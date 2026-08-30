from fastapi import APIRouter
from app.api.v1.routes import auth, wardrobe, outfits, planner, body_profile

router = APIRouter()

router.include_router(auth.router)
router.include_router(wardrobe.router)
router.include_router(outfits.router)
router.include_router(planner.router)
router.include_router(body_profile.router, prefix="/body-profile", tags=["body-profile"])
