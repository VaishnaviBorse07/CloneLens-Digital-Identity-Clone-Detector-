"""Google Gemini LLM & NLP Forensics Provider Layer for CloneLens

Specialized for Google Gemini (Gemini 1.5 Flash, 2.0 Flash, 1.5 Pro)
with Deterministic Stylometric Offline Fallback.
"""
import os
import json
import abc
import httpx
from typing import Dict, Any, Tuple, Optional


class BaseLLMProvider(abc.ABC):
    """Abstract Base Class for LLM text clone forensics providers."""

    @abc.abstractmethod
    def analyze(self, text: str, linguistic_features: Dict[str, Any]) -> Tuple[float, float, str, Dict[str, Any]]:
        """
        Analyzes the text sample and returns forensic probabilities and details.

        Returns:
            (authenticity_probability, ai_generated_probability, explanation_string, forensic_details_dict)
        """
        pass


class MockLLMProvider(BaseLLMProvider):
    """
    Offline/Rule-based analyzer combining linguistic statistical variance, Shannon entropy,
    Type-Token Ratio, repetition index, and AI archetype phrases.
    Ensures deterministic offline testability without external API calls.
    """

    def analyze(self, text: str, linguistic_features: Dict[str, Any]) -> Tuple[float, float, str, Dict[str, Any]]:
        sent_std = linguistic_features.get("sentence_length_std", 0.0)
        ttr = linguistic_features.get("type_token_ratio", 0.5)
        ai_phrases = linguistic_features.get("ai_phrase_count", 0)
        ai_phrases_list = linguistic_features.get("ai_phrases_detected", [])
        entropy = linguistic_features.get("shannon_entropy", 4.0)
        repetition = linguistic_features.get("repetition_index", 0.0)
        word_count = linguistic_features.get("word_count", 0)

        ai_score = linguistic_features.get("stylometric_ai_score", 0.50)
        reasons = []

        if ai_phrases > 0:
            reasons.append(f"Contains {ai_phrases} characteristic AI transition marker(s) ({', '.join(ai_phrases_list[:3])})")

        if sent_std < 3.0 and linguistic_features.get("sentence_count", 0) > 2:
            reasons.append("Low sentence-length variance (uniform pacing characteristic of synthetic generation)")
        elif sent_std > 7.0:
            reasons.append("High sentence-length burstiness (natural human variation)")

        if ttr < 0.45 and word_count > 40:
            reasons.append("Repetitive vocabulary profile with low lexical diversity")
        elif ttr > 0.70:
            reasons.append("Diverse, idiosyncratic vocabulary distribution typical of human authors")

        if repetition > 0.08:
            reasons.append("Elevated n-gram phrase repetition detected")

        if entropy < 3.2 and word_count > 30:
            reasons.append("Low Shannon entropy indicating constrained token variety")

        ai_prob = round(min(max(ai_score, 0.05), 0.95), 4)
        auth_prob = round(1.0 - ai_prob, 4)

        explanation = "; ".join(reasons) if reasons else "Stylometric features are well-balanced within normal human baseline bounds."
        
        forensic_details = {
            "engine": "Stylometric Rule-Based Forensics",
            "evaluated_markers": ai_phrases,
            "burstiness_index": sent_std,
            "lexical_richness_ttr": ttr,
            "repetition_factor": repetition,
            "provider_status": "Offline / Deterministic",
        }

        return auth_prob, ai_prob, explanation, forensic_details


class GeminiLLMProvider(BaseLLMProvider):
    """
    Google Gemini Forensics Provider (Gemini 1.5 Flash, 2.0 Flash, 1.5 Pro).
    Uses direct Google REST API with structured JSON output and stylometric prompt grounding.
    """

    def __init__(self, api_key: str, model_name: str = "gemini-1.5-flash"):
        self.api_key = (api_key or "").strip()
        # Clean model name if passed with 'models/' prefix
        clean_model = (model_name or "gemini-1.5-flash").replace("models/", "").strip()
        self.model_name = clean_model or "gemini-1.5-flash"

    def analyze(self, text: str, linguistic_features: Dict[str, Any]) -> Tuple[float, float, str, Dict[str, Any]]:
        # Graceful fallback if API key is not configured
        if not self.api_key or self.api_key.startswith("your_") or len(self.api_key) < 10:
            mock = MockLLMProvider()
            auth, ai, exp, details = mock.analyze(text, linguistic_features)
            details["fallback_reason"] = "Gemini API key not configured. Used stylometric fallback."
            return auth, ai, f"[Gemini Mock Fallback: API Key not set] {exp}", details

        prompt_context = (
            "You are a leading AI Text Forensics & Synthetic Clone Detection Expert.\n"
            "Analyze the given text snippet along with the extracted stylometric features to determine "
            "whether the text was written by a human or generated/synthesized by an LLM.\n\n"
            f"Extracted Stylometric Context:\n"
            f"- Word Count: {linguistic_features.get('word_count', 0)}\n"
            f"- Sentence Length Burstiness (Std Dev): {linguistic_features.get('sentence_length_std', 0.0)}\n"
            f"- Type-Token Ratio (Lexical Diversity): {linguistic_features.get('type_token_ratio', 0.0)}\n"
            f"- Shannon Entropy: {linguistic_features.get('shannon_entropy', 0.0)}\n"
            f"- Detected AI Transition Markers: {linguistic_features.get('ai_phrases_detected', [])}\n\n"
            "Analyze for syntax uniformity, robotic phrasing, hallucinated neutrality, transition cliches, and tone.\n"
            "Respond strictly in JSON format with keys:\n"
            "{\n"
            '  "authenticity_probability": float (0.0 to 1.0 where 1.0 is definitely human),\n'
            '  "ai_generated_probability": float (0.0 to 1.0 where 1.0 is definitely AI),\n'
            '  "forensic_rationale": string (concise explanation of why this verdict was reached),\n'
            '  "synthetic_markers": list of detected synthetic patterns\n'
            "}"
        )

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt_context},
                        {"text": f"Text to analyze:\n```\n{text[:4000]}\n```"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json",
            }
        }

        # Try candidate models with graceful failover
        candidate_models = [self.model_name]
        if self.model_name != "gemini-1.5-flash":
            candidate_models.append("gemini-1.5-flash")
        if self.model_name != "gemini-2.0-flash":
            candidate_models.append("gemini-2.0-flash")

        for m_name in candidate_models:
            endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{m_name}:generateContent?key={self.api_key}"
            try:
                with httpx.Client(timeout=20.0) as client:
                    res = client.post(endpoint, json=payload, headers={"Content-Type": "application/json"})
                    if res.status_code == 200:
                        data = res.json()
                        raw_content = data["candidates"][0]["content"]["parts"][0]["text"]
                        parsed = json.loads(raw_content)
                        
                        auth_p = float(parsed.get("authenticity_probability", 0.5))
                        ai_p = float(parsed.get("ai_generated_probability", 1.0 - auth_p))
                        total = auth_p + ai_p
                        if total > 0:
                            auth_p = round(auth_p / total, 4)
                            ai_p = round(ai_p / total, 4)

                        exp = parsed.get("forensic_rationale", "Gemini forensic assessment completed.")
                        markers = parsed.get("synthetic_markers", [])

                        forensic_details = {
                            "engine": f"Google Gemini ({m_name})",
                            "synthetic_markers": markers,
                            "provider_status": "Online / API Verified",
                        }
                        return auth_p, ai_p, exp, forensic_details
            except Exception as e:
                pass

        # Fallback if network or key issue
        mock = MockLLMProvider()
        auth, ai, exp, details = mock.analyze(text, linguistic_features)
        details["fallback_reason"] = "Gemini API call failed or key was invalid. Used stylometric fallback."
        return auth, ai, f"[Gemini Fallback] {exp}", details


def get_llm_provider(
    provider_name: Optional[str] = None,
    api_key: Optional[str] = None,
    model_name: Optional[str] = None,
    base_url: Optional[str] = None
) -> BaseLLMProvider:
    """
    Factory function for instantiating the Gemini LLM provider.
    Defaults to GeminiLLMProvider, or MockLLMProvider if explicitly requested.
    """
    name = (provider_name or "gemini").strip().lower()

    if name in ["gemini", "google", "default"]:
        return GeminiLLMProvider(
            api_key=api_key or os.getenv("GEMINI_API_KEY", os.getenv("LLM_API_KEY", "")),
            model_name=model_name or os.getenv("LLM_MODEL_NAME", "gemini-1.5-flash")
        )
    else:
        return MockLLMProvider()
