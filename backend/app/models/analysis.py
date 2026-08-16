"""Database ORM Models for CloneLens"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, Text, JSON, Integer
from backend.app.database.session import Base


class AnalysisRecord(Base):
    __tablename__ = "analysis_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    analysis_id = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    input_type = Column(String(20), nullable=False, index=True)  # 'image', 'text', 'multimodal'
    
    # Image Analysis Metadata & Results
    image_filename = Column(String(255), nullable=True)
    image_metadata = Column(JSON, nullable=True)
    image_prediction = Column(String(50), nullable=True)
    image_probability = Column(Float, nullable=True)
    image_confidence = Column(Float, nullable=True)
    
    # Text Analysis Metadata & Results
    text_metadata = Column(JSON, nullable=True)
    text_prediction = Column(String(50), nullable=True)
    text_probability = Column(Float, nullable=True)
    text_confidence = Column(Float, nullable=True)
    
    # Decision Fusion & Final Verdict
    fusion_score = Column(Float, nullable=False)
    final_prediction = Column(String(50), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    fusion_method = Column(String(100), default="weighted_decision_fusion")
    explanation = Column(Text, nullable=False)
    
    # System & Audit
    model_version = Column(String(50), default="1.0.0")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    def to_dict(self):
        return {
            "analysis_id": self.analysis_id,
            "input_type": self.input_type,
            "image_prediction": self.image_prediction,
            "image_probability": self.image_probability,
            "image_confidence": self.image_confidence,
            "text_prediction": self.text_prediction,
            "text_probability": self.text_probability,
            "text_confidence": self.text_confidence,
            "fusion_score": self.fusion_score,
            "final_prediction": self.final_prediction,
            "confidence": self.confidence,
            "fusion_method": self.fusion_method,
            "explanation": self.explanation,
            "model_version": self.model_version,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
