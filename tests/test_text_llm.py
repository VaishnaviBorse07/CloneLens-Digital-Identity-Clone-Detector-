"""Unit and Integration Tests for CloneLens Gemini LLM Forensics Module"""
import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.ml.text_model.preprocessor import TextFeatureExtractor
from backend.ml.text_model.llm_provider import (
    BaseLLMProvider,
    MockLLMProvider,
    GeminiLLMProvider,
    get_llm_provider,
)
from backend.ml.text_model.detector import TextInferenceEngine, text_engine


class TestTextFeatureExtractor(unittest.TestCase):
    def test_extract_features_normal_text(self):
        sample = (
            "Furthermore, in summary, it is important to remember the rich tapestry of digital forensics. "
            "Delve into the multifaceted mechanisms of modern AI clones. "
            "We must navigate the complexities with utmost care."
        )
        features = TextFeatureExtractor.extract_features(sample)
        
        self.assertGreater(features["word_count"], 15)
        self.assertGreater(features["sentence_count"], 1)
        self.assertGreater(features["shannon_entropy"], 0.0)
        self.assertGreater(features["type_token_ratio"], 0.0)
        self.assertGreater(features["ai_phrase_count"], 0)
        self.assertIn("in summary", [p.lower() for p in features["ai_phrases_detected"]])
        self.assertGreater(features["stylometric_ai_score"], 0.5)

    def test_extract_features_empty_text(self):
        features = TextFeatureExtractor.extract_features("")
        self.assertEqual(features["word_count"], 0)
        self.assertEqual(features["sentence_count"], 0)
        self.assertEqual(features["ai_phrase_count"], 0)
        self.assertEqual(features["stylometric_ai_score"], 0.50)

    def test_human_style_text_scoring(self):
        human_text = (
            "Hey there! Just wanted to check if we're still meeting for coffee tomorrow afternoon? "
            "Let me know! Super excited to catch up on everything."
        )
        features = TextFeatureExtractor.extract_features(human_text)
        self.assertEqual(features["ai_phrase_count"], 0)
        self.assertLessEqual(features["stylometric_ai_score"], 0.55)


class TestGeminiLLMProvider(unittest.TestCase):
    def setUp(self):
        self.sample_text = (
            "In summary, it is crucial to note that the tapestry of technology has evolved significantly. "
            "Furthermore, we must delve into the multifaceted challenges."
        )
        self.features = TextFeatureExtractor.extract_features(self.sample_text)

    def test_mock_llm_provider(self):
        provider = MockLLMProvider()
        auth, ai, exp, details = provider.analyze(self.sample_text, self.features)
        
        self.assertIsInstance(auth, float)
        self.assertIsInstance(ai, float)
        self.assertAlmostEqual(auth + ai, 1.0, places=2)
        self.assertGreaterEqual(ai, 0.55)
        self.assertIn("Offline / Deterministic", details.get("provider_status", ""))

    def test_gemini_fallback_when_no_key(self):
        provider = GeminiLLMProvider(api_key="")
        auth, ai, exp, details = provider.analyze(self.sample_text, self.features)
        
        self.assertIn("Fallback", exp)
        self.assertIn("fallback_reason", details)

    @patch("httpx.Client.post")
    def test_gemini_provider_mocked_api_success(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "candidates": [
                {
                    "content": {
                        "parts": [
                            {
                                "text": '{"authenticity_probability": 0.15, "ai_generated_probability": 0.85, "forensic_rationale": "High occurrence of synthetic transition markers", "synthetic_markers": ["in summary", "tapestry"]}'
                            }
                        ]
                    }
                }
            ]
        }
        mock_post.return_value = mock_resp

        provider = GeminiLLMProvider(api_key="AIzaSyDummyKeyForTest1234567890")
        auth, ai, exp, details = provider.analyze(self.sample_text, self.features)
        
        self.assertAlmostEqual(auth, 0.15, places=2)
        self.assertAlmostEqual(ai, 0.85, places=2)
        self.assertEqual(details["provider_status"], "Online / API Verified")
        self.assertIn("synthetic_markers", details)

    def test_provider_factory(self):
        p_gemini = get_llm_provider("gemini", api_key="dummy_key_val")
        self.assertIsInstance(p_gemini, GeminiLLMProvider)

        p_default = get_llm_provider()
        self.assertIsInstance(p_default, GeminiLLMProvider)

        p_mock = get_llm_provider("mock")
        self.assertIsInstance(p_mock, MockLLMProvider)


class TestTextInferenceEngineAndAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_text_inference_engine_execution(self):
        engine = TextInferenceEngine()
        result = engine.analyze_text("This is an honest human conversation about our weekend project.")
        
        self.assertIn("prediction", result)
        self.assertIn("authenticity_probability", result)
        self.assertIn("ai_generated_probability", result)
        self.assertIn("linguistic_features", result)
        self.assertIn("forensic_details", result)

    def test_api_analyze_text_with_provider_override(self):
        payload = {
            "text": "Furthermore, in summary, delve into the rich tapestry of modern digital security.",
            "provider": "mock"
        }
        response = self.client.post("/api/analyze/text", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertIn("analysis_id", data)
        self.assertEqual(data["input_type"], "text")
        self.assertIn("text_analysis", data)
        self.assertEqual(data["text_analysis"]["provider"], "mock")
        self.assertIn("forensic_details", data["text_analysis"])

    def test_api_health_shows_llm_diagnostics(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertIn("text_nlp_llm", data["models"])
        model_info = data["models"]["text_nlp_llm"]
        self.assertIn("Active Provider", model_info["details"])


if __name__ == "__main__":
    unittest.main()
