from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

class BodyProfileBase(BaseModel):
    height_cm: Optional[float] = None
    front_photo_url: Optional[str] = None
    side_photo_url: Optional[str] = None

class BodyProfileCreate(BodyProfileBase):
    pass

class BodyProfileUpdate(BodyProfileBase):
    pass

class BodyProfileResponse(BodyProfileBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
