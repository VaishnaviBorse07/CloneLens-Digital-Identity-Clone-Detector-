# CloneLens System Architecture

## 1. High-Level Architecture Overview

CloneLens is a research-oriented, multimodal artificial intelligence defense system designed to detect synthetic, AI-generated, and cloned digital identities. It decouples feature extraction into two independent modalities (visual and textual) and unifies their assessments via a configurable Decision Fusion Engine.

```
                           +-------------------------------------+
                           |            End User / Client        |
                           |   (React 18 + Vite Glassmorphic UI) |
                           +------------------+------------------+
                                              |
                                              | HTTP / JSON / Multipart
                                              v
                           +-------------------------------------+
                           |           FastAPI Gateway           |
                           |  - Route Dispatching                |
                           |  - Request Validation (Pydantic)    |
                           |  - File Size & Type Sanitization    |
                           +--------+-------------------+--------+
                                    |                   |
               +--------------------+                   +--------------------+
               |                                                             |
               v                                                             v
+------------------------------------+             +------------------------------------+
|        Image Analysis Subsystem    |             |        Text Analysis Subsystem     |
| - Preprocessing & Normalization    |             | - Linguistic Feature Extraction    |
| - Custom PyTorch CNN (4 Blocks)    |             | - Shannon Entropy & Burstiness     |
| - Frequency & Gradient Variance    |             | - Modular LLM Provider Interface   |
+------------------+-----------------+             +-----------------+------------------+
                   |                                                 |
                   +------------------------+------------------------+
                                            |
                                            v
                           +-------------------------------------+
                           |       Decision Fusion Engine        |
                           | - Dynamic Weighting (w_img, w_txt)  |
                           | - Multi-source Calibration          |
                           | - Forensic Explanation Synthesis    |
                           +------------------+------------------+
                                              |
                                              v
                           +-------------------------------------+
                           |    Persistence & Audit Registry     |
                           | (SQLAlchemy: PostgreSQL / SQLite)   |
                           +-------------------------------------+
```

## 2. Decoupled Pipeline Design

1. **Facial Image Analysis**:
   - **Model**: Lightweight Custom CNN (`CloneLensCNN`) developed in PyTorch.
   - **Input**: 3x224x224 RGB image normalized using standard ImageNet distribution.
   - **Architecture**: 4 sequential Convolutional Blocks (32, 64, 128, 256 filters) with Batch Normalization, ReLU activation, Max Pooling, and spatial Dropout, followed by Adaptive Average Pooling to a 4x4 spatial resolution and dense classification layers.
   - **Zero-Fabrication Fallback**: If trained weights are not detected, the engine transparently reports `"model_status": "Training required"` and utilizes deterministic frequency gradient heuristics without inventing false benchmark numbers.

2. **Text Analysis**:
   - **Linguistic Engine**: Computes sentence length variance ($\sigma_{len}$), Type-Token Ratio ($TTR$), Shannon Entropy ($H(X)$), and detects archetypal generative transition indicators.
   - **LLM Provider Abstraction**: Supports `MockLLMProvider` (deterministic local heuristics), `OpenAILLMProvider`, `GeminiLLMProvider`, and local HuggingFace models through a unified abstract interface (`BaseLLMProvider`).

3. **Decision Fusion Engine**:
   - Computes weighted linear authenticity scores:
     $$F = w_{img} \cdot S_{img} + w_{txt} \cdot S_{txt}$$
   - Where $w_{img} + w_{txt} = 1.0$.
   - Supports unimodal execution ($w=1.0$ for the submitted modality) and multimodal cross-calibration.

4. **Persistence Layer**:
   - Stores analysis metadata, model versions, probability distributions, fusion weights, and forensic rationales without storing raw sensitive user media.
