"""Unit Tests for Customized CloneLens CNN Architecture, Grad-CAM, and API Endpoints"""
import os
import unittest
import torch
from PIL import Image
import io
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.ml.image_model.architecture import get_model, CloneLensCNN, SEBlock, ResidualConvBlock
from backend.ml.image_model.dataset import preprocess_image_tensor, FaceCloneDataset
from backend.ml.image_model.inference import image_engine, create_heatmap_overlay_base64


class TestCustomizedCNN(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        # Create a sample synthetic test image in memory
        img = Image.new("RGB", (256, 256), color=(120, 150, 180))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        self.sample_image_bytes = buf.getvalue()

    def test_se_block_forward(self):
        """Validates Squeeze-and-Excitation channel attention."""
        se = SEBlock(channels=64, reduction=16)
        x = torch.randn(2, 64, 28, 28)
        out = se(x)
        self.assertEqual(out.shape, (2, 64, 28, 28))

    def test_residual_conv_block_forward(self):
        """Validates progressive residual conv block."""
        block = ResidualConvBlock(in_channels=32, out_channels=64, use_se=True)
        x = torch.randn(2, 32, 56, 56)
        out = block(x)
        self.assertEqual(out.shape, (2, 64, 28, 28))

    def test_full_model_architecture(self):
        """Validates full CloneLensCNN forward and feature extraction."""
        model = get_model(num_classes=2)
        x = torch.randn(2, 3, 224, 224)
        logits = model(x)
        self.assertEqual(logits.shape, (2, 2))

        features = model.extract_features(x)
        self.assertEqual(features.shape, (2, 512))

    def test_gradcam_generation(self):
        """Validates Grad-CAM activation heatmap generation."""
        model = get_model(num_classes=2)
        x = torch.randn(1, 3, 224, 224)
        cam = model.generate_gradcam(x, target_class=1)
        self.assertEqual(cam.shape, (224, 224))
        self.assertGreaterEqual(float(cam.min()), 0.0)
        self.assertLessEqual(float(cam.max()), 1.0)

    def test_heatmap_overlay_base64(self):
        """Validates base64 JET colormap heatmap renderer."""
        pil_img = Image.new("RGB", (100, 100), color=(200, 200, 200))
        cam_mask = np_zeros = torch.rand((224, 224)).numpy()
        b64 = create_heatmap_overlay_base64(pil_img, cam_mask)
        self.assertTrue(b64.startswith("data:image/png;base64,"))

    def test_inference_engine_analyze(self):
        """Validates ImageInferenceEngine processing and metadata."""
        result = image_engine.analyze_image_bytes(self.sample_image_bytes, "test_sample.jpg")
        self.assertIn("prediction", result)
        self.assertIn("authenticity_probability", result)
        self.assertIn("ai_generated_probability", result)
        self.assertIn("confidence", result)
        self.assertIn("gradcam_heatmap", result)
        self.assertIn("forensic_indicators", result)
        self.assertEqual(result["model_status"], "Trained")

    def test_api_model_info_endpoint(self):
        """Validates /api/model/info/image endpoint."""
        response = self.client.get("/api/model/info/image")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["weights_loaded"], True)
        self.assertEqual(data["status"], "Trained")
        self.assertGreater(data["total_parameters"], 0)

    def test_api_image_analysis_endpoint(self):
        """Validates /api/analyze/image endpoint returning rich CNN forensics."""
        response = self.client.post(
            "/api/analyze/image",
            files={"file": ("test_sample.jpg", self.sample_image_bytes, "image/jpeg")}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["input_type"], "image")
        self.assertIn("final_prediction", data)
        self.assertIn("authenticity_score_percent", data)
        self.assertIsNotNone(data["image_analysis"])
        self.assertIn("gradcam_heatmap", data["image_analysis"])


if __name__ == "__main__":
    unittest.main()
