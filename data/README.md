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
    ├── train/               # Stratified training split (70%)
    │   ├── ai_vs_human_train.csv (700 rows)
    │   └── ai_human_train.csv (341,138 rows)
    ├── validation/          # Stratified validation split (15%)
    │   ├── ai_vs_human_val.csv (150 rows)
    │   └── ai_human_val.csv (72,995 rows)
    ├── test/                # Stratified test / holdout split (15%)
    │   ├── ai_vs_human_test.csv (150 rows)
    │   └── ai_human_test.csv (73,102 rows)
    └── dataset_split_summary.json # Complete metadata manifest
```

## Dataset Splitting Pipeline

To re-generate or adjust partition ratios, run:
```powershell
python -m backend.ml.text_model.split_dataset --train_ratio 0.70 --val_ratio 0.15 --test_ratio 0.15 --seed 42
```

## Recommended Academic & Research Datasets

1. **Face Forensics & Facial Image Datasets**:
   - **CelebA-HQ** / **FFHQ**: Authentic facial portrait benchmarks.
   - **StyleGAN2 / StyleGAN3 / DiffusionFace**: AI-generated facial images for synthetic artifact detection.
   - **FaceForensics++**: Deepfake and manipulated face video/frame benchmarks.

2. **AI Text Detection Datasets**:
   - **HC3 (Human ChatGPT Comparison Corpus)**: Paired human vs. LLM generated text.
   - **MGTBench**: Multi-generator benchmark for machine-generated text detection.
   - **AI_Human & AI vs Human Benchmark Corpora**: Multi-model synthetic text generation comparison benchmark.

> [!NOTE]
> In accordance with academic research guidelines, do not invent or fabricate dataset labels. All raw datasets should be prepared using the scripts located in `backend/ml/` and documented with source citations.

