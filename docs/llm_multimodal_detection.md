# LLM-Based Multimodal Detection in CloneLens

This document explains how the text analysis (with its modular LLM provider), the image analysis and the Decision Fusion Engine work together to detect synthetic or manipulated digital identities in CloneLens.

## 1. Purpose

CloneLens checks two kinds of evidence about a digital identity:

- **Facial image**: is the photo authentic or AI-generated?
- **Text**: is the profile or bio text human-written or machine-generated?

Each modality gives its own score. The Decision Fusion Engine then combines both scores into one final assessment. This is called **multimodal detection**.

## 2. Pipeline Overview

```
 User (Web UI)
      |
 FastAPI REST API  (backend/app/api/routes.py)
      |
 Service layer     (backend/app/services/analysis_service.py)
     /   \
 Image     Text
 module    module
 (CNN)     (stylometry + LLM provider)
     \   /
 Decision Fusion Engine (backend/ml/fusion/engine.py)
      |
 Final score + explanation + database record
```

## 3. Text Module with LLM Provider

Folder: `backend/ml/text_model/`

| File | Role |
|---|---|
| `preprocessor.py` | Extracts linguistic features such as Shannon entropy, sentence-length variance, Type-Token Ratio (TTR) and transition markers |
| `llm_provider.py` | Abstract LLM provider layer. Supported provider names: `mock`, `openai`, `gemini` |
| `detector.py` | Text detection engine that produces the text score |

### Why a modular provider?

The detector does not depend on one specific LLM. The provider is selected through configuration, so:

- `mock` allows development and testing without an API key or internet access.
- `openai` and `gemini` allow real LLM-based analysis when an API key is configured in `.env`.
- A new provider can be added without changing the detector or the fusion engine.

## 4. Image Module

Folder: `backend/ml/image_model/`

A lightweight 4-block custom PyTorch CNN (`CloneLensCNN`) looks for synthetic boundary artifacts and frequency-noise patterns in the face image. If trained weights are not available, the system reports `"model_status": "Training required"` instead of inventing a score.

## 5. Decision Fusion

File: `backend/ml/fusion/engine.py`

The final score is a weighted combination of the two modality scores:

```
F = w_img * S_img + w_txt * S_txt
```

- `S_img` is the image score and `S_txt` is the text score.
- `w_img` and `w_txt` are the weights given to each modality.
- A calibration step adjusts the result when both modalities agree (cross-modal corroboration).

Because both modalities contribute, a single weak signal is less likely to cause a wrong final decision.

## 6. Explainability

The system returns the features behind the verdict (for example sharpness gradient, sentence burstiness, entropy and transition markers) instead of a black-box answer. Every result includes a disclaimer that it is a probabilistic research assessment.

## 7. Configuration

Settings are read from the `.env` file (copy `.env.example` to `.env`). The LLM provider and any API key are set there. Never commit real API keys to GitHub.

## 8. Testing

From the project root:

```
python -m unittest discover -s tests -v
```

The file `tests/test_project_structure.py` checks that the multimodal pipeline components documented here exist in the repository.

## 9. Limitations

- Results are probabilistic and are not proof of identity cloning.
- The image model needs a trained checkpoint for meaningful scores.
- The `mock` provider returns placeholder output and is for development only.
- Real LLM providers need a valid API key and network access.

## 10. Future Work

- Add more LLM providers behind the same interface.
- Tune the fusion weights using validation data.
- Add evaluation metrics on a larger labelled dataset.
