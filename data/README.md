# CloneLens Datasets

This directory contains training, validation, and test datasets for the multimodal clone detection system.

## Directory Structure

```
data/
├── images/
│   ├── archive.zip               # Source raw archive (60,000 images)
│   ├── train/                    # 70% Stratified Training Split (42,000 images)
│   │   ├── authentic/            # Real/authentic facial photographs (21,000)
│   │   └── ai_generated/        # AI-generated/deepfake facial images (21,000)
│   ├── validation/               # 15% Stratified Validation Split (9,000 images)
│   │   ├── authentic/            # (4,500)
│   │   └── ai_generated/        # (4,500)
│   ├── test/                     # 15% Stratified Test Split (9,000 images)
│   │   ├── authentic/            # (4,500)
│   │   └── ai_generated/        # (4,500)
│   └── dataset_split_summary.json# Complete image dataset metadata manifest
└── text/
    ├── train/                   # Stratified training split (70%)
    │   ├── ai_vs_human_train.csv (700 rows)
    │   └── ai_human_train.csv (341,138 rows)
    ├── validation/              # Stratified validation split (15%)
    │   ├── ai_vs_human_val.csv (150 rows)
    │   └── ai_human_val.csv (72,995 rows)
    ├── test/                    # Stratified test / holdout split (15%)
    │   ├── ai_vs_human_test.csv (150 rows)
    │   └── ai_human_test.csv (73,102 rows)
```

## Dataset Splitting Pipelines

### Facial Image Dataset
To partition `data/images/archive.zip` into stratified train/val/test splits:
```powershell
python -m backend.ml.image_model.split_dataset --zip_path data/images/archive.zip --output_dir data/images --train_ratio 0.70 --val_ratio 0.15 --test_ratio 0.15 --seed 42
```

### Forensic Text Dataset
To partition text corpora into stratified train/val/test splits:
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

