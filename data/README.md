# CloneLens Datasets

This directory contains training, validation, and test datasets for the multimodal clone detection system.

## Directory Structure

```
data/
├── images/
│   ├── train/
│   │   ├── authentic/        # Real/authentic facial photographs
│   │   └── ai_generated/    # AI-generated/deepfake facial images
│   ├── validation/
│   │   ├── authentic/
│   │   └── ai_generated/
│   └── test/
│       ├── authentic/
│       └── ai_generated/
└── text/
    ├── train/               # Human-written and AI-generated text samples
    ├── validation/
    └── test/
```

## Recommended Academic & Research Datasets

1. **Face Forensics & Facial Image Datasets**:
   - **CelebA-HQ** / **FFHQ**: Authentic facial portrait benchmarks.
   - **StyleGAN2 / StyleGAN3 / DiffusionFace**: AI-generated facial images for synthetic artifact detection.
   - **FaceForensics++**: Deepfake and manipulated face video/frame benchmarks.

2. **AI Text Detection Datasets**:
   - **HC3 (Human ChatGPT Comparison Corpus)**: Paired human vs. LLM generated text.
   - **MGTBench**: Multi-generator benchmark for machine-generated text detection.

> [!NOTE]
> In accordance with academic research guidelines, do not invent or fabricate dataset labels. All raw datasets should be prepared using the scripts located in `backend/ml/` and documented with source citations.
