from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import router as api_router

# Ensure all models are imported so SQLAlchemy registers their metadata
import app.models  # noqa: F401


def create_app() -> FastAPI:
    app = FastAPI(
        title="Dresync API",
        description="AI Personal Wardrobe Stylist",
        version="1.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
    )

    # CORS — allow the React dev server and production origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Auto-create all tables on startup (suitable for personal/dev use)
    @app.on_event("startup")
    def on_startup():
        Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
        Base.metadata.create_all(bind=engine)

    # Serve uploaded images as static files at /uploads/...
    upload_path = Path(settings.UPLOAD_DIR)
    upload_path.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(upload_path)), name="uploads")

    # API routes
    app.include_router(api_router, prefix="/api/v1")

    @app.get("/health")
    def health_check():
        return {"status": "ok", "service": "dresync-api", "version": "1.0.0"}

    return app


app = create_app()
