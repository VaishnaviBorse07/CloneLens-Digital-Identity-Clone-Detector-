"""Automated Dataset Splitting & Preprocessing Pipeline for CloneLens Text Forensics"""
import os
import sys
import json
import argparse
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split


def split_ai_vs_human_dataset(
    source_csv: str = "data/text/ai_vs_human_text.csv",
    output_dir: str = "data/text",
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    seed: int = 42
):
    """
    Splits ai_vs_human_text.csv into stratified train, validation, and test sets,
    stratified by the 'model' column to ensure balanced LLM representation.
    """
    if not os.path.exists(source_csv):
        print(f"[!] Source file not found: {source_csv}")
        return None

    print(f"[*] Processing {source_csv}...")
    df = pd.read_csv(source_csv)
    total_samples = len(df)
    print(f"    Loaded {total_samples} samples across models: {df['model'].unique().tolist()}")

    # Stratify primarily by model (which inherently partitions human vs specific LLM)
    stratify_col = df['model'] if 'model' in df.columns else df['label']

    # Step 1: Split into Train (70%) and Temp (30%)
    temp_size = val_ratio + test_ratio
    train_df, temp_df = train_test_split(
        df,
        test_size=temp_size,
        random_state=seed,
        stratify=stratify_col
    )

    # Step 2: Split Temp into Validation (50% of temp = 15%) and Test (50% of temp = 15%)
    val_rel_size = val_ratio / temp_size
    temp_stratify = temp_df['model'] if 'model' in temp_df.columns else temp_df['label']
    val_df, test_df = train_test_split(
        temp_df,
        test_size=(1.0 - val_rel_size),
        random_state=seed,
        stratify=temp_stratify
    )

    train_path = os.path.join(output_dir, "train", "ai_vs_human_train.csv")
    val_path = os.path.join(output_dir, "validation", "ai_vs_human_val.csv")
    test_path = os.path.join(output_dir, "test", "ai_vs_human_test.csv")

    os.makedirs(os.path.dirname(train_path), exist_ok=True)
    os.makedirs(os.path.dirname(val_path), exist_ok=True)
    os.makedirs(os.path.dirname(test_path), exist_ok=True)

    train_df.to_csv(train_path, index=False)
    val_df.to_csv(val_path, index=False)
    test_df.to_csv(test_path, index=False)

    summary = {
        "dataset": "ai_vs_human_text.csv",
        "total_rows": total_samples,
        "splits": {
            "train": {
                "file": train_path,
                "rows": len(train_df),
                "ratio": round(len(train_df) / total_samples, 4),
                "label_counts": train_df["label"].value_counts().to_dict(),
                "model_counts": train_df["model"].value_counts().to_dict() if "model" in train_df.columns else {},
            },
            "validation": {
                "file": val_path,
                "rows": len(val_df),
                "ratio": round(len(val_df) / total_samples, 4),
                "label_counts": val_df["label"].value_counts().to_dict(),
                "model_counts": val_df["model"].value_counts().to_dict() if "model" in val_df.columns else {},
            },
            "test": {
                "file": test_path,
                "rows": len(test_df),
                "ratio": round(len(test_df) / total_samples, 4),
                "label_counts": test_df["label"].value_counts().to_dict(),
                "model_counts": test_df["model"].value_counts().to_dict() if "model" in test_df.columns else {},
            },
        },
    }
    print(f"    [+] Saved Train: {len(train_df)}, Val: {len(val_df)}, Test: {len(test_df)}")
    return summary


def split_large_ai_human_corpus(
    source_csv: str = "data/text/AI_Human.csv",
    output_dir: str = "data/text",
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    seed: int = 42,
    chunksize: int = 50000
):
    """
    Streams and splits the large AI_Human.csv (1.1GB) in chunks to avoid memory overflow.
    Assigns partition flags deterministically using seeded hash/uniform distribution.
    """
    if not os.path.exists(source_csv):
        print(f"[!] Source file not found: {source_csv}")
        return None

    print(f"[*] Processing large corpus {source_csv} in streaming chunks...")

    train_path = os.path.join(output_dir, "train", "ai_human_train.csv")
    val_path = os.path.join(output_dir, "validation", "ai_human_val.csv")
    test_path = os.path.join(output_dir, "test", "ai_human_test.csv")

    os.makedirs(os.path.dirname(train_path), exist_ok=True)
    os.makedirs(os.path.dirname(val_path), exist_ok=True)
    os.makedirs(os.path.dirname(test_path), exist_ok=True)

    # Remove existing files if any
    for p in [train_path, val_path, test_path]:
        if os.path.exists(p):
            os.remove(p)

    rng = np.random.RandomState(seed)
    total_processed = 0
    train_count = 0
    val_count = 0
    test_count = 0
    train_gen_count = 0
    val_gen_count = 0
    test_gen_count = 0

    first_chunk = True
    for chunk in pd.read_csv(source_csv, chunksize=chunksize):
        chunk_len = len(chunk)
        # Random uniform assignment per row based on ratio thresholds
        rand_vals = rng.uniform(0.0, 1.0, size=chunk_len)
        
        train_mask = rand_vals < train_ratio
        val_mask = (rand_vals >= train_ratio) & (rand_vals < (train_ratio + val_ratio))
        test_mask = rand_vals >= (train_ratio + val_ratio)

        train_chunk = chunk[train_mask]
        val_chunk = chunk[val_mask]
        test_chunk = chunk[test_mask]

        mode = 'w' if first_chunk else 'a'
        header = first_chunk

        train_chunk.to_csv(train_path, mode=mode, header=header, index=False)
        val_chunk.to_csv(val_path, mode=mode, header=header, index=False)
        test_chunk.to_csv(test_path, mode=mode, header=header, index=False)

        total_processed += chunk_len
        train_count += len(train_chunk)
        val_count += len(val_chunk)
        test_count += len(test_chunk)

        if 'generated' in chunk.columns:
            train_gen_count += int((train_chunk['generated'] == 1.0).sum())
            val_gen_count += int((val_chunk['generated'] == 1.0).sum())
            test_gen_count += int((test_chunk['generated'] == 1.0).sum())

        first_chunk = False
        print(f"    Processed {total_processed:,} rows (Train: {train_count:,}, Val: {val_count:,}, Test: {test_count:,})...")

    summary = {
        "dataset": "AI_Human.csv",
        "total_rows": total_processed,
        "splits": {
            "train": {
                "file": train_path,
                "rows": train_count,
                "ratio": round(train_count / max(total_processed, 1), 4),
                "ai_generated_samples": train_gen_count,
                "human_samples": train_count - train_gen_count
            },
            "validation": {
                "file": val_path,
                "rows": val_count,
                "ratio": round(val_count / max(total_processed, 1), 4),
                "ai_generated_samples": val_gen_count,
                "human_samples": val_count - val_gen_count
            },
            "test": {
                "file": test_path,
                "rows": test_count,
                "ratio": round(test_count / max(total_processed, 1), 4),
                "ai_generated_samples": test_gen_count,
                "human_samples": test_count - test_gen_count
            },
        },
    }
    print(f"    [+] Finished large corpus: Train: {train_count:,}, Val: {val_count:,}, Test: {test_count:,}")
    return summary


def run_pipeline(
    data_dir: str = "data/text",
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    seed: int = 42
):
    print("=" * 60)
    print(" CloneLens Automated Text Dataset Partitioning Pipeline")
    print("=" * 60)
    print(f"Ratios: Train={train_ratio*100:.1f}%, Val={val_ratio*100:.1f}%, Test={test_ratio*100:.1f}% (Seed: {seed})")

    results = {}

    # 1. Split ai_vs_human_text.csv
    small_csv = os.path.join(data_dir, "ai_vs_human_text.csv")
    if os.path.exists(small_csv):
        small_summary = split_ai_vs_human_dataset(
            source_csv=small_csv,
            output_dir=data_dir,
            train_ratio=train_ratio,
            val_ratio=val_ratio,
            test_ratio=test_ratio,
            seed=seed
        )
        if small_summary:
            results["ai_vs_human_text"] = small_summary

    # 2. Split AI_Human.csv
    large_csv = os.path.join(data_dir, "AI_Human.csv")
    if os.path.exists(large_csv):
        large_summary = split_large_ai_human_corpus(
            source_csv=large_csv,
            output_dir=data_dir,
            train_ratio=train_ratio,
            val_ratio=val_ratio,
            test_ratio=test_ratio,
            seed=seed
        )
        if large_summary:
            results["AI_Human"] = large_summary

    # Save summary report
    summary_path = os.path.join(data_dir, "dataset_split_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print("=" * 60)
    print(f"[+] Splitting complete! Saved metadata manifest to: {summary_path}")
    print("=" * 60)
    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Split CloneLens text datasets into train/val/test partitions.")
    parser.add_argument("--data_dir", type=str, default="data/text", help="Directory containing CSV datasets.")
    parser.add_argument("--train_ratio", type=float, default=0.70, help="Ratio for training set.")
    parser.add_argument("--val_ratio", type=float, default=0.15, help="Ratio for validation set.")
    parser.add_argument("--test_ratio", type=float, default=0.15, help="Ratio for test set.")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for deterministic splitting.")

    args = parser.parse_args()
    assert abs((args.train_ratio + args.val_ratio + args.test_ratio) - 1.0) < 1e-5, "Ratios must sum to 1.0"

    run_pipeline(
        data_dir=args.data_dir,
        train_ratio=args.train_ratio,
        val_ratio=args.val_ratio,
        test_ratio=args.test_ratio,
        seed=args.seed
    )
