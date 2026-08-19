"""Image Preprocessing, Customized CNN Inference & Explainability Pipeline"""
import os
import io
import time
import base64
from typing import Dict, Any, Tuple, Optional
from PIL import Image, ImageStat
import torch
import torch.nn.functional as F
import numpy as np

from backend.app.core.config import settings
from backend.ml.image_model.architecture import get_model, CloneLensCNN
from backend.ml.image_model.dataset import preprocess_image_tensor


def create_heatmap_overlay_base64(
    pil_image: Image.Image,
    cam_mask: np.ndarray,
    alpha: float = 0.45,
    output_size: Tuple[int, int] = (256, 256)
) -> str:
    """
    Renders a Grad-CAM activation heatmap overlay onto the original image
    using a vectorised JET colormap (Blue -> Cyan -> Green -> Yellow -> Red)
    and returns a base64 encoded PNG data URI.
    """
    try:
        img_resized = pil_image.resize(output_size, Image.Resampling.BILINEAR).convert("RGB")
        img_np = np.array(img_resized, dtype=np.float32)  # (H, W, 3) in [0, 255]

        # Resize CAM mask to output size if different
        if cam_mask.shape != output_size:
            cam_pil = Image.fromarray((cam_mask * 255.0).astype(np.uint8))
            cam_pil = cam_pil.resize(output_size, Image.Resampling.BILINEAR)
            cam = np.array(cam_pil, dtype=np.float32) / 255.0
        else:
            cam = np.clip(cam_mask, 0.0, 1.0)

        # JET Colormap calculation
        r = np.clip(1.5 - np.abs(cam * 4.0 - 3.0), 0.0, 1.0)
        g = np.clip(1.5 - np.abs(cam * 4.0 - 2.0), 0.0, 1.0)
        b = np.clip(1.5 - np.abs(cam * 4.0 - 1.0), 0.0, 1.0)
        heatmap = np.stack([r, g, b], axis=-1) * 255.0

        # Alpha blend with original photo
        blended = (1.0 - alpha) * img_np + alpha * heatmap
        blended = np.clip(blended, 0, 255).astype(np.uint8)

        overlay_img = Image.fromarray(blended)
        buf = io.BytesIO()
        overlay_img.save(buf, format="PNG")
        b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{b64}"
    except Exception as e:
        print(f"[!] Warning: Failed to generate heatmap overlay: {e}")
        return ""


class ImageInferenceEngine:
    """Inference engine managing model weight loading, custom CNN execution, and Grad-CAM generation."""

    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model: Optional[CloneLensCNN] = None
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
                try:
                    checkpoint = torch.load(weights_path, map_location=self.device, weights_only=False)
                except TypeError:
                    checkpoint = torch.load(weights_path, map_location=self.device)
                state_dict = checkpoint["model_state_dict"] if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint else checkpoint
                self.model.load_state_dict(state_dict)
                self.weights_loaded = True
                self.model_status = "Trained"
                val_acc = checkpoint.get("val_acc", "N/A") if isinstance(checkpoint, dict) else "N/A"
                print(f"[+] Successfully loaded Customized CloneLensCNN weights from {weights_path} (Val Acc: {val_acc})")
            else:
                self.weights_loaded = False
                self.model_status = "Training required"
                print(f"[*] Custom CNN weights not found at {weights_path}. Initialized untrained architecture.")
        except Exception as e:
            self.weights_loaded = False
            self.model_status = f"Error loading weights: {str(e)}"
            print(f"[!] Error in _load_model: {e}")

    def reload_weights(self):
        """Re-initializes and loads weights if newly trained."""
        self._load_model()

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

        # Gradient sharpness metric (Laplacian gradient magnitude)
        img_np = np.array(pil_image)
        gray = np.dot(img_np[..., :3], [0.2989, 0.5870, 0.1140])
        gy, gx = np.gradient(gray)
        gnorm = np.sqrt(gx**2 + gy**2)
        sharpness_score = float(np.mean(gnorm))

        # High-frequency spectral noise estimation (residuals from local smoothing)
        blurred_gray = np.zeros_like(gray)
        blurred_gray[1:-1, 1:-1] = (
            gray[:-2, :-2] + gray[:-2, 1:-1] + gray[:-2, 2:] +
            gray[1:-1, :-2] + gray[1:-1, 1:-1] + gray[1:-1, 2:] +
            gray[2:, :-2] + gray[2:, 1:-1] + gray[2:, 2:]
        ) / 9.0
        high_freq_noise = float(np.std(gray[1:-1, 1:-1] - blurred_gray[1:-1, 1:-1]))

        # Color channel discrepancy (checking subtle GAN chromatic aberration)
        r_mean, g_mean, b_mean = stat.mean[0], stat.mean[1], stat.mean[2]
        r_std, g_std, b_std = stat.stddev[0], stat.stddev[1], stat.stddev[2]
        color_variance_discrepancy = float(np.std([r_std, g_std, b_std]))

        gradcam_b64: Optional[str] = None

        # 3. Model Inference or Heuristic Visual Inspection
        if self.weights_loaded and self.model is not None:
            tensor_img = preprocess_image_tensor(pil_image, image_size=settings.IMAGE_INPUT_SIZE, is_train=False)
            tensor_img = tensor_img.unsqueeze(0).to(self.device)

            with torch.no_grad():
                logits = self.model(tensor_img)
                probs = F.softmax(logits, dim=1).cpu().numpy()[0]
                auth_prob = float(probs[0])
                ai_gen_prob = float(probs[1])

            # Generate Grad-CAM explainability heatmap
            try:
                target_cls = 1 if ai_gen_prob >= 0.5 else 0
                cam_map = self.model.generate_gradcam(tensor_img, target_class=target_cls)
                gradcam_b64 = create_heatmap_overlay_base64(pil_image, cam_map)
            except Exception as cam_err:
                print(f"[!] Grad-CAM generation warning: {cam_err}")
                gradcam_b64 = None
        else:
            # Baseline forensic heuristic calculation if weights not yet trained
            artifact_factor = 0.50
            if sharpness_score < 3.5 or sharpness_score > 35.0:
                artifact_factor += 0.15  # Unnatural over-smoothing or high-frequency GAN noise
            if contrast_std < 25.0:
                artifact_factor += 0.10  # Synthetic flat lighting
            if high_freq_noise > 12.0:
                artifact_factor += 0.10  # High frequency noise grid

            ai_gen_prob = min(max(artifact_factor, 0.15), 0.85)
            auth_prob = 1.0 - ai_gen_prob

            # Simple fallback gradient visualization
            try:
                norm_gnorm = gnorm / max(np.max(gnorm), 1e-5)
                gradcam_b64 = create_heatmap_overlay_base64(pil_image, norm_gnorm)
            except Exception:
                gradcam_b64 = None

        # 4. Formulate prediction label & confidence based on 3-tier thresholds
        if auth_prob >= 0.70:
            prediction = "Human-Generated"
            confidence = auth_prob
            explanation = (
                "Facial texture micro-gradients, natural chromatic dispersion, and spatial edge consistency "
                "are consistent with authentic photographic captures."
            )
        elif auth_prob >= 0.50:
            prediction = "Moderate"
            confidence = max(auth_prob, ai_gen_prob)
            explanation = (
                "Visual indicators show moderate natural and synthetic traits; subtle facial smoothing or "
                "compression noise detected."
            )
        else:
            prediction = "AI-Generated"
            confidence = ai_gen_prob
            explanation = (
                "Detected synthetic frequency anomalies, boundary smoothing artifacts, and channel "
                "spectral distributions characteristic of generative synthesis models (GAN / Diffusion)."
            )

        elapsed_ms = (time.time() - start_time) * 1000.0

        return {
            "prediction": prediction,
            "authenticity_probability": round(auth_prob, 4),
            "ai_generated_probability": round(ai_gen_prob, 4),
            "confidence": round(confidence, 4),
            "model_name": "CloneLens Custom Residual CNN (4-Stage ConvNet with SE Attention & Grad-CAM)",
            "model_version": "1.0.0",
            "model_status": self.model_status,
            "processing_time_ms": round(elapsed_ms, 2),
            "gradcam_heatmap": gradcam_b64,
            "image_metadata": {
                "filename": filename,
                "dimensions": f"{width}x{height}",
                "mean_brightness": round(mean_brightness, 2),
                "contrast_std": round(contrast_std, 2),
                "sharpness_gradient_metric": round(sharpness_score, 2),
                "high_freq_noise_metric": round(high_freq_noise, 2),
                "color_channel_discrepancy": round(color_variance_discrepancy, 2),
                "device": str(self.device),
            },
            "forensic_indicators": {
                "frequency_artifact_score": round(high_freq_noise, 2),
                "gradient_sharpness": round(sharpness_score, 2),
                "lighting_contrast_variance": round(contrast_std, 2),
                "se_attention_activated": self.weights_loaded
            },
            "explanation": explanation,
        }


# Singleton inference engine instance
image_engine = ImageInferenceEngine()
