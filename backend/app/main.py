"""Main FastAPI Entry Point for CloneLens Backend Server"""
import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Ensure root workspace is on pythonpath
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.core.config import settings
from backend.app.database.session import Base, engine, init_db
from backend.app.models.analysis import AnalysisRecord  # Ensure model is registered
from backend.app.api.routes import router as api_router

# Initialize tables immediately
try:
    init_db()
except Exception as e:
    print(f"[!] Warning on table creation: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print(f"[*] Starting {settings.APP_NAME}...")
    init_db()
    yield
    # Shutdown
    print(f"[*] Shutting down {settings.APP_NAME}...")


app = FastAPI(
    title="CloneLens API",
    description="Multimodal AI-based Digital Identity Clone Detector REST API with Custom CNN & Decision Fusion Engine.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
origins = settings.ALLOWED_ORIGINS
if isinstance(origins, str):
    origins = [o.strip() for o in origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix="/api")


@app.get("/", tags=["Root"])
async def root():
    return {
        "project": "CloneLens: Digital Identity Clone Detector",
        "version": "1.0.0",
        "documentation": "/docs",
        "health_check": "/api/health",
        "status": "online",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.app.main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=settings.DEBUG,
    )
