import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


def _new_uuid() -> str:
    return str(uuid.uuid4())


class JobStatus(str, enum.Enum):
    queued = "queued"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class VTOJob(Base):
    __tablename__ = "vto_jobs"

    id = Column(String(36), primary_key=True, default=_new_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    status = Column(Enum(JobStatus), default=JobStatus.queued, nullable=False, index=True)

    result_image_url = Column(String, nullable=True)
    error_message = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationship
    user = relationship("User")
