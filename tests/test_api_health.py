"""Unit tests for FastAPI Health and Core Routes"""
import unittest
from fastapi.testclient import TestClient
from backend.app.main import app


class TestApiHealth(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_root_endpoint(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("project", data)
        self.assertEqual(data["status"], "online")

    def test_health_endpoint(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data["status"], "healthy")
        self.assertIn("app_name", data)
        self.assertIn("database_connected", data)
        self.assertIn("models", data)
        
        # Check that model diagnostics are reported honestly without fabricated numbers
        models = data["models"]
        self.assertIn("image_custom_cnn", models)
        self.assertIn("text_nlp_llm", models)
        self.assertIn("decision_fusion", models)
        self.assertIn(models["image_custom_cnn"]["status"], ["Ready", "Training required"])

    def test_text_analysis_endpoint(self):
        payload = {"text": "Furthermore, in summary, it is important to remember the multifaceted tapestry of modern technology."}
        response = self.client.post("/api/analyze/text", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertIn("analysis_id", data)
        self.assertEqual(data["input_type"], "text")
        self.assertIn("authenticity_score_percent", data)
        self.assertIn("confidence_percent", data)
        self.assertIsNotNone(data["text_analysis"])
        self.assertIn("linguistic_features", data["text_analysis"])


if __name__ == "__main__":
    unittest.main()
