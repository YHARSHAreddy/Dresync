"""
Local filesystem storage implementation.
Files are stored under UPLOAD_DIR/{subfolder}/{filename}.
URLs are served by FastAPI's StaticFiles mount at /uploads/...
"""

import os
import uuid
from pathlib import Path
from app.storage.base import StorageBackend
from app.core.config import settings


class LocalFileStorage(StorageBackend):
    def __init__(self, base_dir: str = None):
        self.base_dir = Path(base_dir or settings.UPLOAD_DIR)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def save(self, file_bytes: bytes, filename: str, subfolder: str = "") -> str:
        """
        Save bytes to disk. Returns relative URL path like /uploads/abc/file.jpg
        """
        # Build directory
        target_dir = self.base_dir / subfolder
        target_dir.mkdir(parents=True, exist_ok=True)

        # Generate unique filename to avoid collisions
        ext = Path(filename).suffix.lower()
        unique_name = f"{uuid.uuid4().hex}{ext}"
        file_path = target_dir / unique_name

        file_path.write_bytes(file_bytes)

        # Return URL path
        rel = f"/uploads/{subfolder}/{unique_name}" if subfolder else f"/uploads/{unique_name}"
        return rel

    def delete(self, path: str) -> None:
        """Delete file at /uploads/... path."""
        if not path:
            return
        # Convert URL path to filesystem path
        rel = path.lstrip("/")  # "uploads/user_id/file.jpg"
        full_path = Path(settings.UPLOAD_DIR).parent / rel
        if full_path.exists():
            full_path.unlink()

    def get_url(self, path: str) -> str:
        return path  # URL path is already usable by the frontend


# Singleton instance used throughout the app
storage = LocalFileStorage()
