"""FastAPI REST API Routes for CloneLens"""
import os
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.app.core.config import settings
from backend.app.database.session import get_db
from backend.app.models.analysis import AnalysisRecord
from backend.app.schemas.analysis import (
    HealthResponse,
    ModelHealthInfo,
    TextAnalysisRequest,
    MultimodalAnalysisResult,
)
from backend.app.services.analysis_service import AnalysisService
from backend.ml.image_model.inference import image_engine
from backend.ml.text_model.detector import text_engine

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["Health & Status"])
async def check_health(db: Session = Depends(get_db)):
    """
    Health check endpoint returning system status, database connectivity,
    and diagnostic information for ML models (Custom CNN, NLP, LLM).
    """
    # 1. Test database connection
    db_connected = False
    try:
        db.execute(text("SELECT 1"))
        db_connected = True
    except Exception as e:
        db_connected = False

    # 2. Check Image CNN Model status
    image_weights_exist = os.path.exists(settings.IMAGE_MODEL_WEIGHTS_PATH)
    image_model_info = ModelHealthInfo(
        name="CloneLens Custom PyTorch CNN (Facial Artifact Detector)",
        type="Convolutional Neural Network",
        status="Ready" if image_weights_exist else "Training required",
        weights_path=settings.IMAGE_MODEL_WEIGHTS_PATH,
        weights_loaded=image_weights_exist,
        details="Architecture initialized in PyTorch; active inference fallback available." if not image_weights_exist else "Loaded weights checkpoint."
    )

    # 3. Check Text NLP / LLM status
    has_api_key = bool(settings.LLM_API_KEY or settings.GEMINI_API_KEY or settings.OPENAI_API_KEY or settings.GROQ_API_KEY)
    provider_status = "Ready (Active API)" if (settings.LLM_PROVIDER != "mock" and has_api_key) else "Ready (Offline Stylometrics)"
    text_model_info = ModelHealthInfo(
        name=f"CloneLens Multi-Provider NLP Forensics ({settings.LLM_PROVIDER.upper()})",
        type="Statistical Stylometrics + LLM Forensics",
        status=provider_status,
        weights_path=None,
        weights_loaded=True,
        details=f"Active Provider: {settings.LLM_PROVIDER} | Model: {settings.LLM_MODEL_NAME} | Key Configured: {has_api_key}"
    )

    # 4. Check Decision Fusion Engine
    fusion_info = ModelHealthInfo(
        name="Multimodal Decision Fusion Engine",
        type="Weighted Decision & Confidence Calibration",
        status="Ready",
        weights_path=None,
        weights_loaded=True,
        details=f"Default weights: Image={int(settings.FUSION_IMAGE_WEIGHT*100)}%, Text={int(settings.FUSION_TEXT_WEIGHT*100)}%"
    )

    return HealthResponse(
        status="healthy",
        app_name=settings.APP_NAME,
        version="1.0.0",
        timestamp=datetime.now(timezone.utc).isoformat(),
        environment=settings.ENVIRONMENT,
        database_connected=db_connected,
        models={
            "image_custom_cnn": image_model_info,
            "text_nlp_llm": text_model_info,
            "decision_fusion": fusion_info,
        }
    )


@router.post("/analyze/image", response_model=MultimodalAnalysisResult, tags=["Analysis"])
async def analyze_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Analyze an uploaded facial image for synthetic / deepfake artifact patterns."""
    # Validate content type
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image type '{file.content_type}'. Allowed types: {', '.join(settings.ALLOWED_IMAGE_TYPES)}"
        )

    # Read bytes & check size limit
    contents = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    try:
        result = AnalysisService.process_image(image_bytes=contents, filename=file.filename, db=db)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to process image: {str(e)}"
        )


@router.post("/analyze/text", response_model=MultimodalAnalysisResult, tags=["Analysis"])
async def analyze_text(
    payload: TextAnalysisRequest,
    db: Session = Depends(get_db)
):
    """Analyze a text snippet for AI generation / synthetic writing indicators using LLM and stylometrics."""
    try:
        result = AnalysisService.process_text(
            text=payload.text,
            provider=payload.provider,
            model_name=payload.model_name,
            db=db
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to analyze text: {str(e)}"
        )


@router.post("/analyze/multimodal", response_model=MultimodalAnalysisResult, tags=["Analysis"])
async def analyze_multimodal(
    file: UploadFile = File(...),
    text: str = Form(...),
    provider: Optional[str] = Form(None),
    model_name: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Analyze both a facial image and associated text using the Decision Fusion Engine."""
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image type '{file.content_type}'. Allowed types: {', '.join(settings.ALLOWED_IMAGE_TYPES)}"
        )

    contents = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    if len(text.strip()) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text snippet must be at least 5 characters long."
        )

    try:
        result = AnalysisService.process_multimodal(
            image_bytes=contents,
            filename=file.filename,
            text=text,
            provider=provider,
            model_name=model_name,
            db=db
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed multimodal processing: {str(e)}"
        )


@router.get("/results/{analysis_id}", tags=["Analysis"])
async def get_result_by_id(analysis_id: str, db: Session = Depends(get_db)):
    """Retrieve saved analysis record by ID from the database."""
    record = db.query(AnalysisRecord).filter(AnalysisRecord.analysis_id == analysis_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis record not found.")
    return record.to_dict()
