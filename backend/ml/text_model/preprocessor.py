"""Linguistic Preprocessing and Statistical Feature Extraction for Text"""
import re
import math
from typing import Dict, Any, List
from collections import Counter


class TextFeatureExtractor:
    """Extracts explainable linguistic, lexical, and statistical features from text."""

    AI_INDICATOR_PATTERNS = [
        r"\bin summary\b",
        r"\bfurthermore\b",
        r"\bdelve into\b",
        r"\bit is important to remember\b",
        r"\btapestry of\b",
        r"\btestament to\b",
        r"\bcrucial to note\b",
        r"\bharnessing the power of\b",
        r"\bmultifaceted\b",
        r"\bvibrant\b",
    ]

    @staticmethod
    def clean_text(text: str) -> str:
        """Removes extra whitespace and normalizes text."""
        return re.sub(r"\s+", " ", text).strip()

    @classmethod
    def extract_features(cls, text: str) -> Dict[str, Any]:
        cleaned = cls.clean_text(text)
        words = re.findall(r"\b\w+\b", cleaned.lower())
        sentences = [s.strip() for s in re.split(r"[.!?]+", cleaned) if s.strip()]

        total_words = len(words)
        total_sentences = len(sentences)

        if total_words == 0:
            return {
                "word_count": 0,
                "sentence_count": 0,
                "avg_sentence_length": 0.0,
                "sentence_len_std": 0.0,
                "type_token_ratio": 0.0,
                "shannon_entropy": 0.0,
                "cliche_phrase_count": 0,
            }

        # 1. Sentence length variation (Human writing has high burstiness/variance)
        sentence_lengths = [len(re.findall(r"\b\w+\b", s)) for s in sentences]
        avg_sent_len = sum(sentence_lengths) / max(total_sentences, 1)
        variance = sum((l - avg_sent_len) ** 2 for l in sentence_lengths) / max(total_sentences, 1)
        sent_len_std = math.sqrt(variance)

        # 2. Vocabulary Richness (Type-Token Ratio)
        unique_words = set(words)
        ttr = len(unique_words) / total_words

        # 3. Shannon Entropy of word frequencies
        counts = Counter(words)
        entropy = -sum((count / total_words) * math.log2(count / total_words) for count in counts.values())

        # 4. LLM Cliche / Archetypal pattern matches
        cliche_matches = []
        for pattern in cls.AI_INDICATOR_PATTERNS:
            found = re.findall(pattern, cleaned, flags=re.IGNORECASE)
            if found:
                cliche_matches.extend(found)

        return {
            "word_count": total_words,
            "sentence_count": total_sentences,
            "avg_sentence_length": round(avg_sent_len, 2),
            "sentence_length_std": round(sent_len_std, 2),
            "type_token_ratio": round(ttr, 3),
            "shannon_entropy": round(entropy, 3),
            "ai_phrases_detected": list(set(cliche_matches)),
            "ai_phrase_count": len(cliche_matches),
        }
