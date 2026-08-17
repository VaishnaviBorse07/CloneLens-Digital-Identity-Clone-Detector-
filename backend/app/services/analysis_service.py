"""Service Layer Orchestrating Analysis, Fusion, and Persistence"""
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from backend.app.models.analysis import AnalysisRecord
from backend.ml.image_model.inference import image_engine
from backend.ml.text_model.detector import text_engine
from backend.ml.fusion.engine import fusion_engine


class AnalysisService:
    @staticmethod
    def process_image(image_bytes: bytes, filename: str, db: Optional[Session] = None) -> Dict[str, Any]:
        """Analyzes an image and generates a unimodal assessment."""
        img_result = image_engine.analyze_image_bytes(image_bytes, filename=filename)
        fusion_out = fusion_engine.fuse_predictions(image_result=img_result, text_result=None)
        
        analysis_id = str(uuid.uuid4())
        timestamp = datetime.now(timezone.utc).isoformat()

        response_data = {
            "analysis_id": analysis_id,
            "timestamp": timestamp,
            "input_type": fusion_out["input_type"],
            "final_prediction": fusion_out["final_prediction"],
            "authenticity_score_percent": fusion_out["authenticity_score_percent"],
            "confidence_percent": fusion_out["confidence_percent"],
            "image_analysis": img_result,
            "text_analysis": None,
            "decision_fusion": fusion_out["decision_fusion"],
            "explanation": fusion_out["explanation"],
            "disclaimer": (
                "This result is an AI-based probabilistic assessment generated for research and prototyping purposes. "
                "It should not be treated as absolute verification."
            )
        }

        # Persist record if DB session is available
        if db:
            try:
                record = AnalysisRecord(
                    analysis_id=analysis_id,
                    input_type="image",
                    image_filename=filename,
                    image_metadata=img_result.get("image_metadata"),
                    image_prediction=img_result.get("prediction"),
                    image_probability=img_result.get("authenticity_probability"),
                    image_confidence=img_result.get("confidence"),
                    fusion_score=fusion_out["fusion_score"],
                    final_prediction=fusion_out["final_prediction"],
                    confidence=fusion_out["confidence_percent"] / 100.0,
                    fusion_method=fusion_out["decision_fusion"]["fusion_method"],
                    explanation=fusion_out["explanation"],
                    model_version=img_result.get("model_version", "1.0.0"),
                )
                db.add(record)
                db.commit()
            except Exception as e:
                db.rollback()
                print(f"[!] Warning: Failed to persist image analysis record to DB: {e}")

        return response_data

    @staticmethod
    def process_text(
        text: str,
        provider: Optional[str] = None,
        model_name: Optional[str] = None,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """Analyzes text and generates a unimodal assessment."""
        txt_result = text_engine.analyze_text(
            text=text,
            provider_override=provider,
            model_override=model_name
        )
        fusion_out = fusion_engine.fuse_predictions(image_result=None, text_result=txt_result)
        
        analysis_id = str(uuid.uuid4())
        timestamp = datetime.now(timezone.utc).isoformat()

        response_data = {
            "analysis_id": analysis_id,
            "timestamp": timestamp,
            "input_type": fusion_out["input_type"],
            "final_prediction": fusion_out["final_prediction"],
            "authenticity_score_percent": fusion_out["authenticity_score_percent"],
            "confidence_percent": fusion_out["confidence_percent"],
            "image_analysis": None,
            "text_analysis": txt_result,
            "decision_fusion": fusion_out["decision_fusion"],
            "explanation": fusion_out["explanation"],
            "disclaimer": (
                "This result is an AI-based probabilistic assessment generated for research and prototyping purposes. "
                "It should not be treated as absolute verification."
            )
        }

        if db:
            try:
                record = AnalysisRecord(
                    analysis_id=analysis_id,
                    input_type="text",
                    text_metadata=txt_result.get("linguistic_features"),
                    text_prediction=txt_result.get("prediction"),
                    text_probability=txt_result.get("authenticity_probability"),
                    text_confidence=txt_result.get("confidence"),
                    fusion_score=fusion_out["fusion_score"],
                    final_prediction=fusion_out["final_prediction"],
                    confidence=fusion_out["confidence_percent"] / 100.0,
                    fusion_method=fusion_out["decision_fusion"]["fusion_method"],
                    explanation=fusion_out["explanation"],
                    model_version="1.0.0",
                )
                db.add(record)
                db.commit()
            except Exception as e:
                db.rollback()
                print(f"[!] Warning: Failed to persist text analysis record to DB: {e}")

        return response_data

    @staticmethod
    def process_multimodal(
        image_bytes: bytes,
        filename: str,
        text: str,
        provider: Optional[str] = None,
        model_name: Optional[str] = None,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """Analyzes both facial image and text, fusing them with the Decision Fusion Engine."""
        img_result = image_engine.analyze_image_bytes(image_bytes, filename=filename)
        txt_result = text_engine.analyze_text(
            text=text,
            provider_override=provider,
            model_override=model_name
        )
        fusion_out = fusion_engine.fuse_predictions(image_result=img_result, text_result=txt_result)

        analysis_id = str(uuid.uuid4())
        timestamp = datetime.now(timezone.utc).isoformat()

        response_data = {
            "analysis_id": analysis_id,
            "timestamp": timestamp,
            "input_type": "multimodal",
            "final_prediction": fusion_out["final_prediction"],
            "authenticity_score_percent": fusion_out["authenticity_score_percent"],
            "confidence_percent": fusion_out["confidence_percent"],
            "image_analysis": img_result,
            "text_analysis": txt_result,
            "decision_fusion": fusion_out["decision_fusion"],
            "explanation": fusion_out["explanation"],
            "disclaimer": (
                "This result is an AI-based probabilistic assessment generated for research and prototyping purposes. "
                "It should not be treated as absolute verification."
            )
        }

        if db:
            try:
                record = AnalysisRecord(
                    analysis_id=analysis_id,
                    input_type="multimodal",
                    image_filename=filename,
                    image_metadata=img_result.get("image_metadata"),
                    image_prediction=img_result.get("prediction"),
                    image_probability=img_result.get("authenticity_probability"),
                    image_confidence=img_result.get("confidence"),
                    text_metadata=txt_result.get("linguistic_features"),
                    text_prediction=txt_result.get("prediction"),
                    text_probability=txt_result.get("authenticity_probability"),
                    text_confidence=txt_result.get("confidence"),
                    fusion_score=fusion_out["fusion_score"],
                    final_prediction=fusion_out["final_prediction"],
                    confidence=fusion_out["confidence_percent"] / 100.0,
                    fusion_method=fusion_out["decision_fusion"]["fusion_method"],
                    explanation=fusion_out["explanation"],
                    model_version="1.0.0",
                )
                db.add(record)
                db.commit()
            except Exception as e:
                db.rollback()
                print(f"[!] Warning: Failed to persist multimodal analysis record to DB: {e}")

        return response_data
