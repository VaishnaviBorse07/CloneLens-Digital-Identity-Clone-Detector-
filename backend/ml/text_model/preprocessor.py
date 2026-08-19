"""Linguistic Preprocessing and Statistical Feature Extraction for Text Forensics"""
import re
import math
from typing import Dict, Any, List
from collections import Counter


class TextFeatureExtractor:
    """
    Extracts explainable linguistic, lexical, and statistical stylometric features
    from text to aid both heuristic detection and LLM forensic prompt grounding.
    """

    AI_INDICATOR_PATTERNS = [
        r"\bin summary\b",
        r"\bfurthermore\b",
        r"\bdelve into\b",
        r"\bit is important to remember\b",
        r"\bit is important to note\b",
        r"\bit is worth noting\b",
        r"\btapestry of\b",
        r"\brich tapestry\b",
        r"\btestament to\b",
        r"\bserves as a testament\b",
        r"\bcrucial to note\b",
        r"\bcrucial to remember\b",
        r"\bharnessing the power of\b",
        r"\bmultifaceted\b",
        r"\bvibrant\b",
        r"\bembark on a journey\b",
        r"\bnavigating the complexities\b",
        r"\bparamount importance\b",
        r"\bshed light on\b",
        r"\bin conclusion\b",
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
        total_chars = len(cleaned)

        if total_words == 0:
            return {
                "word_count": 0,
                "sentence_count": 0,
                "char_count": 0,
                "avg_sentence_length": 0.0,
                "sentence_length_std": 0.0,
                "sentence_burstiness_ratio": 0.0,
                "type_token_ratio": 0.0,
                "root_ttr": 0.0,
                "shannon_entropy": 0.0,
                "char_entropy": 0.0,
                "repetition_index": 0.0,
                "ai_phrases_detected": [],
                "ai_phrase_count": 0,
                "stylometric_ai_score": 0.50,
            }

        # 1. Sentence length variance & burstiness
        sentence_lengths = [len(re.findall(r"\b\w+\b", s)) for s in sentences]
        avg_sent_len = sum(sentence_lengths) / max(total_sentences, 1)
        variance = sum((l - avg_sent_len) ** 2 for l in sentence_lengths) / max(total_sentences, 1)
        sent_len_std = math.sqrt(variance)
        # Coefficient of variation (burstiness metric)
        burstiness_ratio = sent_len_std / max(avg_sent_len, 0.1)

        # 2. Vocabulary Richness (Type-Token Ratio & Root TTR)
        unique_words = set(words)
        ttr = len(unique_words) / total_words
        root_ttr = len(unique_words) / math.sqrt(total_words)

        # 3. Shannon Entropy of word frequencies & character frequencies
        word_counts = Counter(words)
        word_entropy = -sum(
            (c / total_words) * math.log2(c / total_words) for c in word_counts.values()
        )
        
        char_counts = Counter(cleaned.lower())
        char_entropy = -sum(
            (c / total_chars) * math.log2(c / total_chars) for c in char_counts.values()
        )

        # 4. Repetition Index (repeated 3-word n-grams)
        repeated_3grams = 0
        if total_words >= 3:
            trigrams = [tuple(words[i:i+3]) for i in range(len(words) - 2)]
            trigram_counts = Counter(trigrams)
            repeated_3grams = sum(count - 1 for count in trigram_counts.values() if count > 1)
        repetition_index = repeated_3grams / max(total_words - 2, 1)

        # 5. LLM Cliche / Archetypal pattern matches
        cliche_matches = []
        for pattern in cls.AI_INDICATOR_PATTERNS:
            found = re.findall(pattern, cleaned, flags=re.IGNORECASE)
            if found:
                cliche_matches.extend(found)

        # 6. Baseline Stylometric AI Score heuristic (0.0=authentic, 1.0=ai)
        ai_heuristic = 0.50
        if len(cliche_matches) > 0:
            ai_heuristic += min(len(cliche_matches) * 0.12, 0.35)

        if sent_len_std < 3.0 and total_sentences > 2:
            ai_heuristic += 0.10
        elif sent_len_std > 7.0:
            ai_heuristic -= 0.12

        if ttr < 0.45 and total_words > 40:
            ai_heuristic += 0.10
        elif ttr > 0.70:
            ai_heuristic -= 0.10

        if repetition_index > 0.08:
            ai_heuristic += 0.10

        ai_heuristic = round(min(max(ai_heuristic, 0.05), 0.95), 4)

        return {
            "word_count": total_words,
            "sentence_count": total_sentences,
            "char_count": total_chars,
            "avg_sentence_length": round(avg_sent_len, 2),
            "sentence_length_std": round(sent_len_std, 2),
            "sentence_burstiness_ratio": round(burstiness_ratio, 3),
            "type_token_ratio": round(ttr, 3),
            "root_ttr": round(root_ttr, 3),
            "shannon_entropy": round(word_entropy, 3),
            "char_entropy": round(char_entropy, 3),
            "repetition_index": round(repetition_index, 4),
            "ai_phrases_detected": list(set(cliche_matches)),
            "ai_phrase_count": len(cliche_matches),
            "stylometric_ai_score": ai_heuristic,
        }

