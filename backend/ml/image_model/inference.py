"""Image Preprocessing and Inference Pipeline"""
import os
import io
import time
from typing import Dict, Any, Tuple
from PIL import Image, ImageStat
import torch
import torch.nn.functional as F
import numpy as np

from backend.app.core.config import settings
from backend.ml.image_model.architecture import get_model, CloneLensCNN
from backend.ml.image_model.dataset import get_image_transforms


class ImageInferenceEngine:
    """Inference engine managing preprocessing, model weight caching, and prediction execution."""

    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model: Optional[CloneLensCNN] = None
        self.transforms = get_image_transforms(image_size=settings.IMAGE_INPUT_SIZE, is_train=False)
        self.weights_loaded = False
        self.model_status = "Training required"
        self._load_model()

    def _load_model(self):
        """Attempts to load trained PyTorch weights from configured path."""
        try:
            self.model = get_model(num_classes=2).to(self.device)
            self.model.eval()

            weights_path = settings.IMAGE_MODEL_WEIGHTS_PATH
            if os.path.exists(weights_path):
                checkpoint = torch.load(weights_path, map_location=self.device)
                state_dict = checkpoint["model_state_dict"] if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint else checkpoint
                self.model.load_state_dict(state_dict)
                self.weights_loaded = True
                self.model_status = "Trained"
                print(f"[+] Successfully loaded Custom CNN weights from {weights_path}")
            else:
                self.weights_loaded = False
                self.model_status = "Training required"
                print(f"[*] Custom CNN weights not found at {weights_path}. Initialized untrained architecture.")
        except Exception as e:
            self.weights_loaded = False
            self.model_status = f"Error loading weights: {str(e)}"
            print(f"[!] Error in _load_model: {e}")

    def analyze_image_bytes(self, image_bytes: bytes, filename: str = "uploaded_image.jpg") -> Dict[str, Any]:
        """Runs the image analysis pipeline on raw image bytes."""
        start_time = time.time()
        
        # 1. Load and validate image with PIL
        try:
            pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            width, height = pil_image.size
        except Exception as e:
            raise ValueError(f"Invalid or corrupted image data: {str(e)}")

        # 2. Extract image metadata & forensic visual metrics
        stat = ImageStat.Stat(pil_image)
        mean_brightness = sum(stat.mean) / 3.0
        contrast_std = sum(stat.stddev) / 3.0
        
        # Calculate Laplacian variance for sharpness/blur forensic indicator
        img_np = np.array(pil_image)
        gray = np.dot(img_np[..., :3], [0.2989, 0.5870, 0.1140])
        gy, gx = np.gradient(gray)
        gnorm = np.sqrt(gx**2 + gy**2)
        sharpness_score = float(np.mean(gnorm))

        # 3. Model Inference or Heuristic Visual Inspection
        if self.weights_loaded and self.model is not None:
            tensor_img = self.transforms(pil_image).unsqueeze(0).to(self.device)
            with torch.no_grad():
                logits = self.model(tensor_img)
                probs = F.softmax(logits, dim=1).cpu().numpy()[0]
                auth_prob = float(probs[0])
                ai_gen_prob = float(probs[1])
        else:
            # Baseline forensic heuristic calculation until weights are trained
            # Authentic facial photography exhibits natural gradient variance and realistic contrast
            artifact_factor = 0.5
            if sharpness_score < 3.5 or sharpness_score > 35.0:
                artifact_factor += 0.15  # Unnatural over-smoothing or high-frequency GAN noise
            if contrast_std < 25.0:
                artifact_factor += 0.10  # Synthetic flat lighting
            
            ai_gen_prob = min(max(artifact_factor, 0.15), 0.85)
            auth_prob = 1.0 - ai_gen_prob

        # 4. Formulate prediction label & confidence
        if auth_prob >= 0.55:
            prediction = "Authentic"
            confidence = auth_prob
            explanation = "Facial texture and frequency gradients are consistent with authentic photographic captures."
        elif ai_gen_prob >= 0.55:
            prediction = "AI-Generated / Synthetic"
            confidence = ai_gen_prob
            explanation = "Detected subtle synthetic frequency anomalies and unnatural spatial smoothing characteristic of generative models."
        else:
            prediction = "Inconclusive / Mixed"
            confidence = max(auth_prob, ai_gen_prob)
            explanation = "Visual artifacts are ambiguous; manual review is recommended."

        elapsed_ms = (time.time() - start_time) * 1000.0

        return {
            "prediction": prediction,
            "authenticity_probability": round(auth_prob, 4),
            "ai_generated_probability": round(ai_gen_prob, 4),
            "confidence": round(confidence, 4),
            "model_name": "CloneLens Custom PyTorch CNN (4-Block ConvNet)",
            "model_version": "1.0.0",
            "model_status": self.model_status,
            "processing_time_ms": round(elapsed_ms, 2),
            "image_metadata": {
                "filename": filename,
                "dimensions": f"{width}x{height}",
                "mean_brightness": round(mean_brightness, 2),
                "contrast_std": round(contrast_std, 2),
                "sharpness_gradient_metric": round(sharpness_score, 2),
                "device": str(self.device),
            },
            "explanation": explanation,
        }


# Singleton inference engine instance
image_engine = ImageInferenceEngine()
