# Import all models here so SQLAlchemy metadata knows about them
# and Base.metadata.create_all() picks them all up.
from app.models.user import User  # noqa: F401
from app.models.clothing import ClothingItem, ClothingCategory, ClothingPattern, UsageStatus  # noqa: F401
from app.models.outfit import Outfit, OutfitHistory  # noqa: F401
from app.models.planner import WeeklyPlan  # noqa: F401
from app.models.vto_job import VTOJob, JobStatus  # noqa: F401
