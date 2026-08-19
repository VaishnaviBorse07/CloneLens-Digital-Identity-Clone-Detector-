"""Automated Dataset Splitting & Preprocessing Pipeline for CloneLens Image Forensics"""
import os
import sys
import json
import random
import time
import argparse
import zipfile
from typing import Dict, Any, List, Tuple


def build_split_manifest(
    zip_path: str,
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    seed: int = 42
) -> Tuple[Dict[str, Tuple[str, str]], Dict[str, Any]]:
    """
    Scans the zip archive, stratifies authentic and ai_generated images,
    and returns a lookup mapping: internal_zip_path -> (target_rel_dir, target_filename).
    """
    assert abs(train_ratio + val_ratio + test_ratio - 1.0) < 1e-4, "Ratios must sum to 1.0"

    print(f"[*] Opening archive: {zip_path}")
    with zipfile.ZipFile(zip_path, "r") as z:
        all_members = [
            f for f in z.namelist()
            if not f.endswith("/") and f.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))
        ]

    authentic_files = []
    fake_files = []

    for path in all_members:
        lower_path = path.lower()
        if "real" in lower_path or "authentic" in lower_path:
            authentic_files.append(path)
        elif "fake" in lower_path or "ai_generated" in lower_path or "synthetic" in lower_path:
            fake_files.append(path)
        else:
            if "ai" in lower_path:
                fake_files.append(path)
            else:
                authentic_files.append(path)

    print(f"[*] Discovered {len(all_members):,} total images:")
    print(f"    - Authentic / Real: {len(authentic_files):,}")
    print(f"    - AI-Generated / Fake: {len(fake_files):,}")

    rng = random.Random(seed)
    rng.shuffle(authentic_files)
    rng.shuffle(fake_files)

    def compute_splits(files: List[str], class_name: str) -> Dict[str, List[Tuple[str, str, str]]]:
        n = len(files)
        n_train = int(n * train_ratio)
        n_val = int(n * val_ratio)
        
        train_list = files[:n_train]
        val_list = files[n_train:n_train + n_val]
        test_list = files[n_train + n_val:]

        tasks = {"train": [], "validation": [], "test": []}
        
        for split_name, file_subset in [("train", train_list), ("validation", val_list), ("test", test_list)]:
            for item in file_subset:
                # Sanitize filename to avoid collisions across source folders (e.g. train_real_0001.jpg)
                safe_name = item.replace("/", "_").replace("\\", "_")
                target_rel_dir = os.path.join(split_name, class_name)
                tasks[split_name].append((item, target_rel_dir, safe_name))
        return tasks

    auth_splits = compute_splits(authentic_files, "authentic")
    fake_splits = compute_splits(fake_files, "ai_generated")

    task_map: Dict[str, Tuple[str, str]] = {}
    summary_splits = {}

    for split in ["train", "validation", "test"]:
        auth_tasks = auth_splits[split]
        fake_tasks = fake_splits[split]
        total_split = len(auth_tasks) + len(fake_tasks)

        for item, target_rel_dir, safe_name in auth_tasks:
            task_map[item] = (target_rel_dir, safe_name)
        for item, target_rel_dir, safe_name in fake_tasks:
            task_map[item] = (target_rel_dir, safe_name)

        summary_splits[split] = {
            "total_images": total_split,
            "ratio": round(total_split / max(len(all_members), 1), 4),
            "authentic_samples": len(auth_tasks),
            "ai_generated_samples": len(fake_tasks),
            "target_directories": [
                f"images/{split}/authentic",
                f"images/{split}/ai_generated"
            ]
        }

    summary = {
        "dataset_archive": os.path.basename(zip_path),
        "total_images": len(all_members),
        "random_seed": seed,
        "splits": summary_splits
    }

    return task_map, summary


def extract_and_split_dataset(
    zip_path: str = "data/images/archive.zip",
    output_dir: str = "data/images",
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    seed: int = 42,
    log_interval: int = 2000
) -> Dict[str, Any]:
    """
    Extracts and partitions the facial clone detection image archive in sequential stream order.
    """
    if not os.path.exists(zip_path):
        raise FileNotFoundError(f"Image dataset archive not found at: {zip_path}")

    # Ensure target directories exist
    for split in ["train", "validation", "test"]:
        for cls in ["authentic", "ai_generated"]:
            os.makedirs(os.path.join(output_dir, split, cls), exist_ok=True)

    task_map, summary = build_split_manifest(
        zip_path=zip_path,
        train_ratio=train_ratio,
        val_ratio=val_ratio,
        test_ratio=test_ratio,
        seed=seed
    )

    total_tasks = len(task_map)
    print(f"[*] Starting streaming extraction of {total_tasks:,} images into '{output_dir}'...")

    start_time = time.time()
    extracted_count = 0

    with zipfile.ZipFile(zip_path, "r") as z:
        for info in z.infolist():
            if info.filename in task_map:
                target_rel_dir, target_filename = task_map[info.filename]
                target_file = os.path.join(output_dir, target_rel_dir, target_filename)

                # Read and write directly
                data = z.read(info)
                with open(target_file, "wb") as f_out:
                    f_out.write(data)

                extracted_count += 1

                if extracted_count % log_interval == 0 or extracted_count == total_tasks:
                    elapsed = time.time() - start_time
                    speed = extracted_count / max(elapsed, 0.001)
                    pct = (extracted_count / total_tasks) * 100
                    eta = (total_tasks - extracted_count) / max(speed, 0.001)
                    print(
                        f"    [{pct:5.1f}%] Extracted {extracted_count:,}/{total_tasks:,} images | "
                        f"{speed:6.1f} img/s | Elapsed: {elapsed:.1f}s | ETA: {eta:.1f}s",
                        flush=True
                    )

    total_time = time.time() - start_time
    print(f"[+] Dataset extraction and split completed in {total_time:.2f} seconds ({extracted_count / total_time:.1f} img/s)!")

    # Save summary json
    summary_path = os.path.join(output_dir, "dataset_split_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
    print(f"[+] Split summary metadata written to: {summary_path}")

    return summary


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract & Split Facial Clone Image Dataset")
    parser.add_argument("--zip_path", type=str, default="data/images/archive.zip", help="Path to archive.zip")
    parser.add_argument("--output_dir", type=str, default="data/images", help="Target output directory")
    parser.add_argument("--train_ratio", type=float, default=0.70, help="Ratio for training set")
    parser.add_argument("--val_ratio", type=float, default=0.15, help="Ratio for validation set")
    parser.add_argument("--test_ratio", type=float, default=0.15, help="Ratio for test set")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for deterministic split")
    parser.add_argument("--log_interval", type=int, default=2000, help="Log interval for progress reporting")

    args = parser.parse_args()

    extract_and_split_dataset(
        zip_path=args.zip_path,
        output_dir=args.output_dir,
        train_ratio=args.train_ratio,
        val_ratio=args.val_ratio,
        test_ratio=args.test_ratio,
        seed=args.seed,
        log_interval=args.log_interval
    )
