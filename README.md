# CloneLens: Digital Identity Clone Detector

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2+-EE4C2C?style=flat&logo=pytorch&logoColor=white)](https://pytorch.org)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.3+-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)

> **CloneLens** is a multimodal AI-based digital identity clone detector developed as a final-year B.Tech engineering capstone project. It analyzes facial imagery and text to detect synthetic or manipulated content, combining unimodal assessments via a configurable **Decision Fusion Engine**.

---

## 1. System Architecture & Modalities

CloneLens implements a decoupled multimodal architecture:

```
                            [ End User / Web UI ]
                                      |
                     [ FastAPI REST API (Port 8000) ]
                                /           \
                               /             \
            [ Image Analysis Module ]    [ Text Analysis Module ]
            - Custom PyTorch CNN         - Shannon Entropy & TTR
            - Spatial & Frequency Noise  - Modular LLM Provider
                               \             /
                                \           /
                        [ Decision Fusion Engine ]
                        - Dynamic Weighted Fusion
                        - Calibrated Explainability
                                      |
                         [ Persistence & SQLite/PG ]
```

- **Facial Image Analysis**: Lightweight 4-block Custom PyTorch CNN (`CloneLensCNN`) analyzing synthetic boundary artifacts and frequency noise gradients.
- **Text Analysis**: Stylometric feature extraction (entropy, sentence length variance, Type-Token Ratio, transition markers) with a modular LLM provider interface (`mock`, `openai`, `gemini`).
- **Decision Fusion**: Weighted mathematical interpolation ($F = w_{img} S_{img} + w_{txt} S_{txt}$) with cross-modal corroboration calibration.
- **Persistence Layer**: SQLAlchemy ORM storing full audit trails without persisting sensitive raw user images unnecessarily.

---

## 2. Project Directory Structure

```
CloneLens/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py              # FastAPI REST endpoints
│   │   ├── core/
│   │   │   └── config.py              # Pydantic environment configuration
│   │   ├── database/
│   │   │   └── session.py             # SQLAlchemy session & DB initialization
│   │   ├── models/
│   │   │   └── analysis.py            # AnalysisRecord ORM model
│   │   ├── schemas/
│   │   │   └── analysis.py            # Pydantic request/response schemas
│   │   ├── services/
│   │   │   └── analysis_service.py    # Service orchestrator & DB persistence
│   │   └── main.py                    # FastAPI application entry point
│   ├── ml/
│   │   ├── image_model/
│   │   │   ├── architecture.py        # Custom PyTorch CNN (CloneLensCNN)
│   │   │   ├── dataset.py             # Image dataset loader & transforms
│   │   │   ├── train.py               # Custom CNN training script
│   │   │   ├── evaluate.py            # Standalone evaluation & confusion matrix
│   │   │   ├── inference.py           # Inference pipeline & zero-fabrication fallback
│   │   │   └── saved_models/          # Directory for *.pt PyTorch checkpoints
│   │   ├── text_model/
│   │   │   ├── preprocessor.py        # Linguistic feature extraction & entropy
│   │   │   ├── llm_provider.py        # Abstract LLM provider layer (Mock, OpenAI, etc.)
│   │   │   ├── detector.py            # Text detection engine
│   │   │   └── saved_models/          # Tokenizers & text checkpoints
│   │   ├── fusion/
│   │   │   └── engine.py              # Decision Fusion Engine & calibration
│   │   └── evaluation/
│   │       └── metrics.py             # Classification evaluation metrics
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx             # Top navigation & system status
│   │   │   ├── HealthStatusBadge.jsx  # Real-time backend connectivity badge
│   │   │   ├── VerificationForm.jsx   # Multimodal image & text upload tabs
│   │   │   ├── ResultsDisplay.jsx     # Score gauges, modality cards, report
│   │   │   ├── ModelInfoCard.jsx      # Research framework & architecture overview
│   │   │   └── Footer.jsx             # Project citations & footer
│   │   ├── services/
│   │   │   └── api.js                 # Axios API client
│   │   ├── App.jsx                    # Root application component
│   │   ├── App.css                    # Component layout & gauge styles
│   │   ├── index.css                  # Design tokens & glassmorphism system
│   │   └── main.jsx                   # React DOM entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── data/
│   ├── images/                        # train, validation, test (authentic / ai_generated)
│   ├── text/                          # train, validation, test
│   └── README.md
├── docs/
│   ├── architecture.md
│   ├── api_spec.md
│   └── decision_fusion_strategy.md
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
├── notebooks/
├── tests/
│   ├── test_api_health.py
│   └── test_fusion_engine.py
├── .gitignore
├── .env.example
└── README.md
```

---

## 3. Quick Start & Setup Guide

### Prerequisites
- **Python**: 3.10+
- **Node.js**: 18+ & **npm**

### Step 1: Clone Repository & Configure Environment
```bash
cp .env.example .env
```

### Step 2: Backend Setup & Execution
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Start the FastAPI server (Runs on http://localhost:8000)
python backend/app/main.py
# Or with uvicorn directly:
# uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation will be available at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Endpoint**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### Step 3: Frontend Setup & Execution
```bash
# Navigate to frontend directory
cd frontend

# Install node dependencies
npm install

# Start Vite development server (Runs on http://localhost:5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 4. Running Backend Unit Tests

Run the test suite:
```bash
python -m unittest discover -s tests -v
```

---

## 5. Academic Research & Zero-Fabrication Guidelines

As a research-oriented engineering prototype:
1. **No Fabricated Accuracies**: When PyTorch CNN weights are not yet trained on a custom dataset, the system displays `"model_status": "Training required"` rather than inventing false benchmark scores.
2. **Explainable AI**: The system outputs detailed stylometric and visual forensic features (sharpness gradient, sentence burstiness, Shannon entropy, transition markers) rather than unexplainable black-box verdicts.
3. **Probabilistic Disclaimer**: Every assessment carries an explicit AI disclaimer emphasizing that results are probabilistic research assessments.
