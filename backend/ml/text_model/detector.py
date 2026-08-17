"""Text Forensics & Clone Detection Orchestrator for CloneLens"""
import time
from typing import Dict, Any, Optional
from backend.app.core.config import settings
from backend.ml.text_model.preprocessor import TextFeatureExtractor
from backend.ml.text_model.llm_provider import get_llm_provider, BaseLLMProvider


class TextInferenceEngine:
    """
    Orchestrates text stylometric preprocessing, multi-provider LLM inference,
    and calibrated probability calculation.
    """

    def __init__(self):
        self.provider_name = settings.LLM_PROVIDER
        self.provider: BaseLLMProvider = get_llm_provider(
            provider_name=settings.LLM_PROVIDER,
            api_key=settings.LLM_API_KEY or settings.GEMINI_API_KEY or settings.OPENAI_API_KEY,
            model_name=settings.LLM_MODEL_NAME,
            base_url=settings.LLM_BASE_URL,
        )

    def reload_provider(
        self,
        provider_name: Optional[str] = None,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        base_url: Optional[str] = None
    ) -> None:
        """Dynamically reconfigures or reloads the active LLM provider."""
        self.provider_name = provider_name or settings.LLM_PROVIDER
        self.provider = get_llm_provider(
            provider_name=self.provider_name,
            api_key=api_key or settings.LLM_API_KEY,
            model_name=model_name or settings.LLM_MODEL_NAME,
            base_url=base_url or settings.LLM_BASE_URL,
        )

    def analyze_text(
        self,
        text: str,
        provider_override: Optional[str] = None,
        model_override: Optional[str] = None,
        api_key_override: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes text stylometric analysis and LLM forensics.

        Args:
            text: Raw input string to analyze
            provider_override: Optional per-request provider override (e.g. 'gemini', 'openai')
            model_override: Optional specific model name override
            api_key_override: Optional specific API key override

        Returns:
            Structured text analysis result dictionary
        """
        start_time = time.time()

        # 1. Linguistic & Stylometric Feature Extraction
        features = TextFeatureExtractor.extract_features(text)

        # 2. Select Provider
        if provider_override:
            active_provider = get_llm_provider(
                provider_name=provider_override,
                api_key=api_key_override or settings.LLM_API_KEY,
                model_name=model_override or settings.LLM_MODEL_NAME,
                base_url=settings.LLM_BASE_URL
            )
            active_provider_name = provider_override
        else:
            active_provider = self.provider
            active_provider_name = self.provider_name

        # 3. LLM / Stylometric Forensic Analysis
        provider_result = active_provider.analyze(text, features)
        if len(provider_result) == 4:
            auth_prob, ai_prob, reason, forensic_details = provider_result
        else:
            auth_prob, ai_prob, reason = provider_result[:3]
            forensic_details = {}

        # 4. Calibration & Prediction Derivation
        if auth_prob >= 0.55:
            prediction = "Human-written"
            confidence = auth_prob
        elif ai_prob >= 0.55:
            prediction = "AI-Generated"
            confidence = ai_prob
        else:
            prediction = "Inconclusive / Mixed"
            confidence = max(auth_prob, ai_prob)

        elapsed_ms = (time.time() - start_time) * 1000.0

        return {
            "prediction": prediction,
            "authenticity_probability": round(auth_prob, 4),
            "ai_generated_probability": round(ai_prob, 4),
            "confidence": round(confidence, 4),
            "model_name": f"CloneLens NLP Suite + {active_provider_name.upper()} Provider",
            "provider": active_provider_name,
            "processing_time_ms": round(elapsed_ms, 2),
            "linguistic_features": features,
            "forensic_details": forensic_details,
            "explanation": f"Text analysis indicates {prediction.lower()} characteristics. {reason}",
        }


# Global singleton instance
text_engine = TextInferenceEngine()
