"""Unit tests for Multimodal Decision Fusion Engine"""
import unittest
from backend.ml.fusion.engine import DecisionFusionEngine


class TestDecisionFusionEngine(unittest.TestCase):
    def test_fusion_image_only(self):
        engine = DecisionFusionEngine(image_weight=0.6, text_weight=0.4)
        img_result = {
            "prediction": "Authentic",
            "authenticity_probability": 0.85,
            "ai_generated_probability": 0.15,
            "confidence": 0.85,
            "explanation": "Natural gradient profile."
        }
        
        result = engine.fuse_predictions(image_result=img_result, text_result=None)
        self.assertEqual(result["input_type"], "image")
        self.assertEqual(result["final_prediction"], "Authentic")
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
        self.assertEqual(result["final_prediction"], "AI-Generated Content")
        self.assertEqual(result["authenticity_score_percent"], 20.0)
        self.assertEqual(result["decision_fusion"]["text_weight"], 1.0)

    def test_fusion_multimodal_combination(self):
        engine = DecisionFusionEngine(image_weight=0.6, text_weight=0.4)
        img_result = {
            "prediction": "Authentic",
            "authenticity_probability": 0.80,
            "ai_generated_probability": 0.20,
            "confidence": 0.80,
            "explanation": "Natural facial features."
        }
        txt_result = {
            "prediction": "Authentic",
            "authenticity_probability": 0.90,
            "ai_generated_probability": 0.10,
            "confidence": 0.90,
            "explanation": "Natural syntactic variation."
        }
        
        result = engine.fuse_predictions(image_result=img_result, text_result=txt_result)
        self.assertEqual(result["input_type"], "multimodal")
        self.assertEqual(result["final_prediction"], "Authentic")
        self.assertEqual(result["authenticity_score_percent"], 84.0)
        self.assertIn("both image and text", result["explanation"].lower())


if __name__ == "__main__":
    unittest.main()
