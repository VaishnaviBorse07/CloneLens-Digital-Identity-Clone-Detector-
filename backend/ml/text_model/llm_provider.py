"""Modular LLM & NLP Provider Abstraction Layer"""
import os
import abc
from typing import Dict, Any, Tuple


class BaseLLMProvider(abc.ABC):
    """Abstract Base Class for LLM analysis providers."""

    @abc.abstractmethod
    def analyze(self, text: str, linguistic_features: Dict[str, Any]) -> Tuple[float, float, str]:
        """
        Returns:
            (authenticity_probability, ai_generated_probability, explanation_string)
        """
        pass


class MockLLMProvider(BaseLLMProvider):
    """
    Offline/Rule-based analyzer combining linguistic statistical variance and entropy.
    Requires no external API keys, ensuring deterministic offline testability.
    """
    def analyze(self, text: str, linguistic_features: Dict[str, Any]) -> Tuple[float, float, str]:
        sent_std = linguistic_features.get("sentence_length_std", 0.0)
        ttr = linguistic_features.get("type_token_ratio", 0.5)
        ai_phrases = linguistic_features.get("ai_phrase_count", 0)
        entropy = linguistic_features.get("shannon_entropy", 4.0)

        # Baseline score calculation:
        # LLMs often have very uniform sentence lengths (lower std dev) and repeated transition patterns.
        # Human text exhibits high burstiness (high std dev) and idiosyncratic punctuation/vocabulary.
        ai_score = 0.50
        reasons = []

        if ai_phrases > 0:
            ai_score += min(ai_phrases * 0.15, 0.35)
            reasons.append(f"Contains {ai_phrases} characteristic AI transition marker(s)")

        if sent_std < 3.0 and linguistic_features.get("sentence_count", 0) > 2:
            ai_score += 0.12
            reasons.append("Low sentence-length variance (uniform pacing typical of synthetic text)")
        elif sent_std > 7.0:
            ai_score -= 0.15
            reasons.append("High sentence-length burstiness (natural human variation)")

        if ttr < 0.45 and linguistic_features.get("word_count", 0) > 40:
            ai_score += 0.10
            reasons.append("Repetitive vocabulary profile")
        elif ttr > 0.70:
            ai_score -= 0.10
            reasons.append("Diverse, natural vocabulary dispersion")

        ai_prob = min(max(ai_score, 0.05), 0.95)
        auth_prob = 1.0 - ai_prob

        explanation = "; ".join(reasons) if reasons else "Stylometric features are well-balanced within normal bounds."
        return round(auth_prob, 4), round(ai_prob, 4), explanation


class OpenAILLMProvider(BaseLLMProvider):
    """OpenAI API Provider (GPT-4o, GPT-3.5-turbo, etc.)."""
    def __init__(self, api_key: str, model_name: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model_name = model_name

    def analyze(self, text: str, linguistic_features: Dict[str, Any]) -> Tuple[float, float, str]:
        # If API key is not configured, gracefully fallback to mock analyzer
        if not self.api_key or self.api_key.startswith("your_"):
            mock = MockLLMProvider()
            auth, ai, exp = mock.analyze(text, linguistic_features)
            return auth, ai, f"[Mock Fallback: API Key not set] {exp}"

        # Production integration calls OpenAI API
        try:
            import httpx
            # Payload construction
            headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
            payload = {
                "model": self.model_name,
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "You are an AI text forensics expert. Analyze the following text and determine if it is human-written or AI-generated. "
                            "Respond with JSON format: {\"authenticity_probability\": float (0.0 to 1.0), \"explanation\": string}"
                        )
                    },
                    {"role": "user", "content": text[:3000]}
                ],
                "temperature": 0.0,
                "response_format": {"type": "json_object"}
            }
            with httpx.Client(timeout=15.0) as client:
                res = client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
                if res.status_code == 200:
                    import json
                    data = res.json()
                    content = json.loads(data["choices"][0]["message"]["content"])
                    auth_p = float(content.get("authenticity_probability", 0.5))
                    ai_p = round(1.0 - auth_p, 4)
                    return auth_p, ai_p, content.get("explanation", "OpenAI assessment completed.")
        except Exception as e:
            print(f"[!] OpenAI API call failed: {e}")
            
        mock = MockLLMProvider()
        auth, ai, exp = mock.analyze(text, linguistic_features)
        return auth, ai, f"[Fallback] {exp}"


def get_llm_provider(provider_name: str, api_key: str = "", model_name: str = "gpt-4o-mini") -> BaseLLMProvider:
    """Factory function for instantiating the appropriate LLM provider."""
    name = (provider_name or "mock").lower()
    if name == "openai":
        return OpenAILLMProvider(api_key=api_key, model_name=model_name)
    elif name == "mock":
        return MockLLMProvider()
    else:
        return MockLLMProvider()
