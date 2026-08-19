"""Unit tests for Multimodal Decision Fusion Engine"""
import unittest
from backend.ml.fusion.engine import DecisionFusionEngine


class TestDecisionFusionEngine(unittest.TestCase):
    def test_fusion_image_only(self):
        engine = DecisionFusionEngine(image_weight=0.6, text_weight=0.4)
        img_result = {
            "prediction": "Human-Generated",
            "authenticity_probability": 0.85,
            "ai_generated_probability": 0.15,
            "confidence": 0.85,
            "explanation": "Natural gradient profile."
        }
        
        result = engine.fuse_predictions(image_result=img_result, text_result=None)
        self.assertEqual(result["input_type"], "image")
        self.assertEqual(result["final_prediction"], "Human-Generated")
        self.assertEqual(result["authenticity_score_percent"], 85.0)
        self.assertEqual(result["decision_fusion"]["image_weight"], 1.0)

    def test_fusion_text_only(self):
        engine = DecisionFusionEngine(image_weight=0.6, text_weight=0.4)
        txt_result = {
            "prediction": "AI-Generated",
            "authenticity_probability": 0.20,
            "ai_generated_probability": 0.80,
            "confidence": 0.80,
            "explanation": "Uniform sentence length."
        }
        
        result = engine.fuse_predictions(image_result=None, text_result=txt_result)
        self.assertEqual(result["input_type"], "text")
        self.assertEqual(result["final_prediction"], "AI-Generated")
        self.assertEqual(result["authenticity_score_percent"], 20.0)
        self.assertEqual(result["decision_fusion"]["text_weight"], 1.0)

    def test_fusion_moderate_tier(self):
        engine = DecisionFusionEngine(image_weight=0.6, text_weight=0.4)
        img_result = {
            "prediction": "Moderate",
            "authenticity_probability": 0.65,
            "ai_generated_probability": 0.35,
            "confidence": 0.65,
            "explanation": "Ambiguous textures."
        }
        txt_result = {
            "prediction": "Moderate",
            "authenticity_probability": 0.55,
            "ai_generated_probability": 0.45,
            "confidence": 0.55,
            "explanation": "Mixed markers."
        }
        
        result = engine.fuse_predictions(image_result=img_result, text_result=txt_result)
        self.assertEqual(result["input_type"], "multimodal")
        self.assertEqual(result["final_prediction"], "Moderate")
        # 0.6 * 0.65 + 0.4 * 0.55 = 0.39 + 0.22 = 0.61 (61.0%)
        self.assertEqual(result["authenticity_score_percent"], 61.0)

    def test_fusion_multimodal_combination(self):
        engine = DecisionFusionEngine(image_weight=0.6, text_weight=0.4)
        img_result = {
            "prediction": "Human-Generated",
            "authenticity_probability": 0.80,
            "ai_generated_probability": 0.20,
            "confidence": 0.80,
            "explanation": "Natural facial features."
        }
        txt_result = {
            "prediction": "Human-Generated",
            "authenticity_probability": 0.90,
            "ai_generated_probability": 0.10,
            "confidence": 0.90,
            "explanation": "Natural syntactic variation."
        }
        
        result = engine.fuse_predictions(image_result=img_result, text_result=txt_result)
        self.assertEqual(result["input_type"], "multimodal")
        self.assertEqual(result["final_prediction"], "Human-Generated")
        self.assertEqual(result["authenticity_score_percent"], 84.0)
        self.assertIn("both image and text", result["explanation"].lower())

    def test_threshold_boundaries(self):
        engine = DecisionFusionEngine()
        self.assertEqual(engine._classify_verdict(0.70), "Human-Generated")
        self.assertEqual(engine._classify_verdict(0.85), "Human-Generated")
        self.assertEqual(engine._classify_verdict(0.6999), "Moderate")
        self.assertEqual(engine._classify_verdict(0.50), "Moderate")
        self.assertEqual(engine._classify_verdict(0.4999), "AI-Generated")
        self.assertEqual(engine._classify_verdict(0.15), "AI-Generated")


if __name__ == "__main__":
    unittest.main()
