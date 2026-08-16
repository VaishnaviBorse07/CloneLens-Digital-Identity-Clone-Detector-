"""Multimodal Decision Fusion Engine for CloneLens"""
from typing import Optional, Dict, Any
from backend.app.core.config import settings


class DecisionFusionEngine:
    """
    Combines independent unimodal prediction probabilities (Image & Text)
    into a unified authenticity verdict using configurable weighted decision fusion.
    """

    def __init__(
        self,
        image_weight: float = settings.FUSION_IMAGE_WEIGHT,
        text_weight: float = settings.FUSION_TEXT_WEIGHT,
        threshold_authentic: float = settings.FUSION_THRESHOLD_AUTHENTIC,
        threshold_fake: float = settings.FUSION_THRESHOLD_FAKE,
    ):
        self.image_weight = image_weight
        self.text_weight = text_weight
        self.threshold_authentic = threshold_authentic
        self.threshold_fake = threshold_fake

    def fuse_predictions(
        self,
        image_result: Optional[Dict[str, Any]] = None,
        text_result: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Executes decision fusion across available modalities.
        
        Modality handling:
          - Image Only: 100% weight to image score.
          - Text Only: 100% weight to text score.
          - Multimodal (Both): Configurable linear weighted fusion.
        """
        if not image_result and not text_result:
            raise ValueError("DecisionFusionEngine requires at least one modality (image or text).")

        # Determine active mode
        if image_result and not text_result:
            input_type = "image"
            eff_img_weight = 1.0
            eff_txt_weight = 0.0
            img_auth_score = image_result["authenticity_probability"]
            txt_auth_score = None
            final_auth_score = img_auth_score
            confidence = image_result["confidence"]
            fusion_method = "Unimodal (Image Analysis Only)"
            explanation = (
                f"Image analysis indicates a {round(img_auth_score * 100, 1)}% probability of authenticity. "
                f"{image_result['explanation']}"
            )

        elif text_result and not image_result:
            input_type = "text"
            eff_img_weight = 0.0
            eff_txt_weight = 1.0
            img_auth_score = None
            txt_auth_score = text_result["authenticity_probability"]
            final_auth_score = txt_auth_score
            confidence = text_result["confidence"]
            fusion_method = "Unimodal (Text Analysis Only)"
            explanation = (
                f"Text analysis indicates a {round(txt_auth_score * 100, 1)}% probability of human authorship. "
                f"{text_result['explanation']}"
            )

        else:
            # Multimodal Fusion
            input_type = "multimodal"
            total_weight = self.image_weight + self.text_weight
            eff_img_weight = round(self.image_weight / total_weight, 2)
            eff_txt_weight = round(self.text_weight / total_weight, 2)
            
            img_auth_score = image_result["authenticity_probability"]
            txt_auth_score = text_result["authenticity_probability"]
            
            final_auth_score = (eff_img_weight * img_auth_score) + (eff_txt_weight * txt_auth_score)
            
            # Confidence aggregation: weighted average plus agreement bonus/penalty
            img_conf = image_result["confidence"]
            txt_conf = text_result["confidence"]
            base_conf = (eff_img_weight * img_conf) + (eff_txt_weight * txt_conf)
            
            # If both modalities agree (e.g. both >= 0.5 or both < 0.5), boost confidence slightly
            img_is_real = img_auth_score >= 0.5
            txt_is_real = txt_auth_score >= 0.5
            if img_is_real == txt_is_real:
                confidence = min(base_conf * 1.05, 0.99)
                agreement_str = "Both image and text analyses consistently corroborate the assessment."
            else:
                confidence = max(base_conf * 0.88, 0.45)
                agreement_str = "Image and text modalities show differing indicators; cross-modal variance has been factored in."

            fusion_method = f"Multimodal Weighted Fusion (Image: {int(eff_img_weight*100)}%, Text: {int(eff_txt_weight*100)}%)"
            explanation = (
                f"Combined multimodal fusion computed an authenticity score of {round(final_auth_score * 100, 1)}%. "
                f"{agreement_str} Image: {image_result['prediction']}, Text: {text_result['prediction']}."
            )

        # Classify final verdict
        if final_auth_score >= self.threshold_authentic:
            final_prediction = "Authentic"
        elif final_auth_score <= self.threshold_fake:
            final_prediction = "AI-Generated Content"
        else:
            final_prediction = "Potential Clone/Fake (Borderline / Suspect)"

        return {
            "input_type": input_type,
            "final_prediction": final_prediction,
            "authenticity_score_percent": round(final_auth_score * 100.0, 2),
            "confidence_percent": round(confidence * 100.0, 2),
            "fusion_score": round(final_auth_score, 4),
            "decision_fusion": {
                "image_weight": eff_img_weight,
                "text_weight": eff_txt_weight,
                "image_score": img_auth_score,
                "text_score": txt_auth_score,
                "fusion_method": fusion_method,
                "fusion_score": round(final_auth_score, 4),
            },
            "explanation": explanation,
        }


fusion_engine = DecisionFusionEngine()
