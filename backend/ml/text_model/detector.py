"""Text Analysis & Detection Orchestrator"""
import time
from typing import Dict, Any
from backend.app.core.config import settings
from backend.ml.text_model.preprocessor import TextFeatureExtractor
from backend.ml.text_model.llm_provider import get_llm_provider, BaseLLMProvider


class TextInferenceEngine:
    def __init__(self):
        self.provider_name = settings.LLM_PROVIDER
        self.provider: BaseLLMProvider = get_llm_provider(
            provider_name=settings.LLM_PROVIDER,
            api_key=settings.LLM_API_KEY,
            model_name=settings.LLM_MODEL_NAME,
        )

    def analyze_text(self, text: str) -> Dict[str, Any]:
        start_time = time.time()
        
        # 1. Feature extraction
        features = TextFeatureExtractor.extract_features(text)
        
        # 2. Provider analysis
        auth_prob, ai_prob, reason = self.provider.analyze(text, features)
        
        # 3. Label & confidence derivation
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
            "authenticity_probability": auth_prob,
            "ai_generated_probability": ai_prob,
            "confidence": round(confidence, 4),
            "model_name": f"CloneLens NLP Stylometric Suite + {self.provider_name.upper()} Provider",
            "provider": self.provider_name,
            "processing_time_ms": round(elapsed_ms, 2),
            "linguistic_features": features,
            "explanation": f"Text analysis indicates {prediction.lower()} characteristics. {reason}",
        }


text_engine = TextInferenceEngine()
