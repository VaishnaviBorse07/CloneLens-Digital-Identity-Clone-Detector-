"""Structure checks for the CloneLens multimodal detection pipeline.

These tests only read files, so they do not change or import any existing
project code. Run from the project root:

    python -m unittest discover -s tests -v
"""
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

PIPELINE_FILES = [
    "backend/app/api/routes.py",
    "backend/app/services/analysis_service.py",
    "backend/ml/image_model/architecture.py",
    "backend/ml/image_model/inference.py",
    "backend/ml/text_model/preprocessor.py",
    "backend/ml/text_model/llm_provider.py",
    "backend/ml/text_model/detector.py",
    "backend/ml/fusion/engine.py",
    "docs/llm_multimodal_detection.md",
    ".env.example",
]


class TestMultimodalPipelineStructure(unittest.TestCase):
    def test_pipeline_files_exist(self):
        for rel in PIPELINE_FILES:
            with self.subTest(file=rel):
                self.assertTrue((ROOT / rel).is_file(), f"Missing file: {rel}")

    def test_pipeline_files_not_empty(self):
        for rel in PIPELINE_FILES:
            path = ROOT / rel
            if path.is_file():
                with self.subTest(file=rel):
                    self.assertGreater(path.stat().st_size, 0, f"Empty file: {rel}")

    def test_llm_provider_lists_supported_providers(self):
        text = (ROOT / "backend/ml/text_model/llm_provider.py").read_text(
            encoding="utf-8", errors="ignore"
        ).lower()
        for name in ("mock", "openai", "gemini"):
            with self.subTest(provider=name):
                self.assertIn(name, text)

    def test_documentation_covers_both_modalities_and_fusion(self):
        doc = (ROOT / "docs/llm_multimodal_detection.md").read_text(
            encoding="utf-8"
        ).lower()
        for keyword in ("image", "text", "fusion", "llm"):
            with self.subTest(keyword=keyword):
                self.assertIn(keyword, doc)


if __name__ == "__main__":
    unittest.main()
