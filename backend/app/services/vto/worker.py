import logging
import requests
from app.core.database import SessionLocal
from app.models.vto_job import VTOJob, JobStatus
from app.services.vto.fashn import FashnAIProvider
from app.services.vto.provider import VTORequest
from app.storage.local import storage

logger = logging.getLogger(__name__)


def process_vto_job(job_id: str, user_image_url: str, garment_image_url: str, category: str):
    """
    Background worker function for Virtual Try-On.
    Executes synchronously in a background thread provided by FastAPI BackgroundTasks.
    """
    db = SessionLocal()
    try:
        job = db.query(VTOJob).filter(VTOJob.id == job_id).first()
        if not job:
            logger.error(f"VTOJob {job_id} not found in worker.")
            return

        # Mark as processing
        job.status = JobStatus.processing
        db.commit()

        # Generate Try-On
        provider = FashnAIProvider()
        req = VTORequest(
            user_image_path=user_image_url,
            garment_image_path=garment_image_url,
            category=category
        )
        
        result = provider.generate_try_on(req)
        
        if result.success and result.result_image_url:
            # We have an image URL. For the POC, we download it and save it locally to secure it.
            # If it's a mock result, result_image_url might be a relative path from our own uploads,
            # or it might be an external URL. 
            
            # Helper to download and save locally
            if result.result_image_url.startswith("http"):
                try:
                    resp = requests.get(result.result_image_url, timeout=30)
                    resp.raise_for_status()
                    image_bytes = resp.content
                    # Save to local storage
                    internal_url = storage.save(image_bytes, "vto_result.jpg", subfolder="vto")
                    job.result_image_url = internal_url
                except Exception as e:
                    logger.error(f"Failed to download image for job {job_id}: {str(e)}")
                    job.status = JobStatus.failed
                    job.error_message = f"Failed to fetch generated image: {str(e)}"
                    db.commit()
                    return
            else:
                # It's already an internal URL (e.g., from mock mode)
                job.result_image_url = result.result_image_url
                
            job.status = JobStatus.completed
        else:
            job.status = JobStatus.failed
            job.error_message = result.error_message or "Unknown provider error"
            
        db.commit()

    except Exception as e:
        logger.error(f"Error processing VTOJob {job_id}: {str(e)}")
        job = db.query(VTOJob).filter(VTOJob.id == job_id).first()
        if job:
            job.status = JobStatus.failed
            job.error_message = str(e)
            db.commit()
    finally:
        db.close()
