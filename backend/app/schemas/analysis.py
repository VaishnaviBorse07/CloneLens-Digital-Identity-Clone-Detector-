"""Pydantic Schemas for API Requests & Responses"""
from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field


# -----------------------------------------------------------------------------
# Health Status Schemas
# -----------------------------------------------------------------------------
class ModelHealthInfo(BaseModel):
    name: str
    type: str
    status: str  # "Ready", "Training required", "Configured"
    weights_path: Optional[str] = None
    weights_loaded: bool = False
    details: Optional[str] = None


class HealthResponse(BaseModel):
    status: str = "healthy"
    app_name: str
    version: str
    timestamp: str
    environment: str
    database_connected: bool
    models: Dict[str, ModelHealthInfo]


# -----------------------------------------------------------------------------
# Image Analysis Schemas
# -----------------------------------------------------------------------------
class ImageAnalysisResult(BaseModel):
    prediction: str = Field(..., description="'Authentic' or 'AI-Generated / Synthetic'")
    authenticity_probability: float = Field(..., ge=0.0, le=1.0)
    ai_generated_probability: float = Field(..., ge=0.0, le=1.0)
    confidence: float = Field(..., ge=0.0, le=1.0)
    model_name: str = "Custom PyTorch CNN"
    model_version: str = "1.0.0"
    model_status: str = Field(..., description="'Trained' or 'Training required'")
    processing_time_ms: float
    image_metadata: Optional[Dict[str, Any]] = None
    explanation: str


# -----------------------------------------------------------------------------
# Text Analysis Schemas
# -----------------------------------------------------------------------------
class TextAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=5, max_length=15000, description="Text snippet to analyze")
    provider: Optional[str] = Field(None, description="Optional provider override: 'gemini', 'openai', 'groq', 'huggingface', 'ollama', 'mock'")
    model_name: Optional[str] = Field(None, description="Optional model override (e.g. 'gemini-1.5-flash', 'gpt-4o-mini')")


class TextAnalysisResult(BaseModel):
    prediction: str = Field(..., description="'Human-written' or 'AI-Generated'")
    authenticity_probability: float = Field(..., ge=0.0, le=1.0)
    ai_generated_probability: float = Field(..., ge=0.0, le=1.0)
    confidence: float = Field(..., ge=0.0, le=1.0)
    model_name: str = "NLP Linguistic Analyzer & LLM Provider"
    provider: str
    processing_time_ms: float
    linguistic_features: Optional[Dict[str, Any]] = None
    forensic_details: Optional[Dict[str, Any]] = None
    explanation: str


# -----------------------------------------------------------------------------
# Multimodal Decision Fusion Schemas
# -----------------------------------------------------------------------------
class FusionDetails(BaseModel):
    image_weight: float
    text_weight: float
    image_score: Optional[float] = None
    text_score: Optional[float] = None
    fusion_method: str = "Weighted Linear Interpolation & Confidence Calibration"
    fusion_score: float = Field(..., ge=0.0, le=1.0)


class MultimodalAnalysisResult(BaseModel):
    analysis_id: str
    timestamp: str
    input_type: str  # "image", "text", "multimodal"
    final_prediction: str  # "Authentic", "Potential Clone/Fake", "AI-Generated Content"
    authenticity_score_percent: float = Field(..., ge=0.0, le=100.0)
    confidence_percent: float = Field(..., ge=0.0, le=100.0)
    image_analysis: Optional[ImageAnalysisResult] = None
    text_analysis: Optional[TextAnalysisResult] = None
    decision_fusion: FusionDetails
    explanation: str
    disclaimer: str = (
        "This result is an AI-based probabilistic assessment generated for research and prototyping purposes. "
        "It should not be treated as absolute verification."
    )
