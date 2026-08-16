# CloneLens REST API Specification

The backend server is built with FastAPI and provides automatic Swagger documentation at `/docs` and ReDoc at `/redoc`.

---

## Endpoints Summary

| Method | Path | Description | Request Body / Params |
|---|---|---|---|
| `GET` | `/api/health` | System health check and model status | None |
| `POST` | `/api/analyze/image` | Unimodal facial image artifact detection | `multipart/form-data` (`file`) |
| `POST` | `/api/analyze/text` | Unimodal text AI/human stylometric analysis | `application/json` (`{ "text": "..." }`) |
| `POST` | `/api/analyze/multimodal` | Multimodal analysis using Decision Fusion Engine | `multipart/form-data` (`file`, `text`) |
| `GET` | `/api/results/{id}` | Retrieve stored analysis record by ID | Path parameter `id` (UUID) |

---

## Endpoint Details

### 1. `GET /api/health`
**Response (200 OK):**
```json
{
  "status": "healthy",
  "app_name": "CloneLens Digital Identity Clone Detector",
  "version": "1.0.0",
  "timestamp": "2026-08-16T09:00:00.000000Z",
  "environment": "development",
  "database_connected": true,
  "models": {
    "image_custom_cnn": {
      "name": "CloneLens Custom PyTorch CNN (Facial Artifact Detector)",
      "type": "Convolutional Neural Network",
      "status": "Training required",
      "weights_path": "backend/ml/image_model/saved_models/custom_cnn_v1.pt",
      "weights_loaded": false,
      "details": "Architecture initialized in PyTorch; active inference fallback available."
    },
    "text_nlp_llm": {
      "name": "CloneLens NLP Suite + MOCK Provider",
      "type": "Statistical NLP + LLM Heuristics",
      "status": "Ready",
      "weights_path": null,
      "weights_loaded": true,
      "details": "Configured provider: mock"
    },
    "decision_fusion": {
      "name": "Multimodal Decision Fusion Engine",
      "type": "Weighted Decision & Confidence Calibration",
      "status": "Ready",
      "weights_path": null,
      "weights_loaded": true,
      "details": "Default weights: Image=60%, Text=40%"
    }
  }
}
```

### 2. `POST /api/analyze/multimodal`
**Parameters:**
- `file`: Image binary (JPEG / PNG / WEBP)
- `text`: Text string snippet

**Response (200 OK):**
```json
{
  "analysis_id": "78c9354f-561b-402a-a92c-554be50979e2",
  "timestamp": "2026-08-16T09:05:00.000000Z",
  "input_type": "multimodal",
  "final_prediction": "Authentic",
  "authenticity_score_percent": 81.5,
  "confidence_percent": 88.0,
  "image_analysis": {
    "prediction": "Authentic",
    "authenticity_probability": 0.82,
    "ai_generated_probability": 0.18,
    "confidence": 0.82,
    "model_name": "CloneLens Custom PyTorch CNN (4-Block ConvNet)",
    "model_version": "1.0.0",
    "model_status": "Training required",
    "processing_time_ms": 14.5,
    "image_metadata": {
      "dimensions": "512x512",
      "sharpness_gradient_metric": 18.2
    },
    "explanation": "Facial texture and frequency gradients are consistent with authentic photographic captures."
  },
  "text_analysis": {
    "prediction": "Human-written",
    "authenticity_probability": 0.80,
    "ai_generated_probability": 0.20,
    "confidence": 0.80,
    "model_name": "CloneLens NLP Stylometric Suite + MOCK Provider",
    "provider": "mock",
    "processing_time_ms": 2.1,
    "linguistic_features": {
      "word_count": 28,
      "sentence_count": 2,
      "avg_sentence_length": 14.0,
      "sentence_length_std": 5.2,
      "type_token_ratio": 0.78,
      "shannon_entropy": 4.12
    },
    "explanation": "Text analysis indicates human-written characteristics. High sentence-length burstiness."
  },
  "decision_fusion": {
    "image_weight": 0.6,
    "text_weight": 0.4,
    "image_score": 0.82,
    "text_score": 0.80,
    "fusion_method": "Multimodal Weighted Fusion (Image: 60%, Text: 40%)",
    "fusion_score": 0.812
  },
  "explanation": "Combined multimodal fusion computed an authenticity score of 81.2%. Both image and text analyses consistently corroborate the assessment.",
  "disclaimer": "This result is an AI-based probabilistic assessment generated for research and prototyping purposes. It should not be treated as absolute verification."
}
```
