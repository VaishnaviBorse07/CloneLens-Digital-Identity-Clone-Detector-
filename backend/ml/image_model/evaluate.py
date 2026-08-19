import os
import sys
import json
import argparse
from typing import Dict, Any, Optional

# Ensure project root is on sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import torch
import torch.nn.functional as F
import numpy as np
from torch.utils.data import DataLoader
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    roc_auc_score,
    classification_report
)

from backend.ml.image_model.architecture import get_model, CloneLensCNN
from backend.ml.image_model.dataset import FaceCloneDataset


def evaluate_model(
    model_path: str = "backend/ml/image_model/saved_models/custom_cnn_v1.pt",
    data_dir: str = "data",
    split: str = "test",
    batch_size: int = 32,
    limit_samples: Optional[int] = None,
    report_output: Optional[str] = "data/images/test_evaluation_report.json",
    device: Optional[str] = None
) -> Dict[str, Any]:
    """
    Runs full quantitative benchmark of CloneLensCNN against a test dataset.
    """
    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"

    if not os.path.exists(model_path):
        print(f"[!] Model weights not found at: {model_path}. Status: Training required.")
        return {"status": "Training required", "weights_path": model_path}

    test_dataset = FaceCloneDataset(root_dir=data_dir, split=split, limit_samples=limit_samples)
    if len(test_dataset) == 0:
        print(f"[!] No samples found in {data_dir}/images/{split}/. Please verify dataset.")
        return {"status": "No test samples found"}

    print(f"[*] Evaluating CloneLensCNN on {len(test_dataset):,} '{split}' samples (Device: {device})...")
    print(f"    - Authentic: {test_dataset.num_authentic:,} | AI-Generated: {test_dataset.num_ai_generated:,}")

    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
    model = get_model(num_classes=2).to(device)

    # Load weights
    try:
        checkpoint = torch.load(model_path, map_location=device, weights_only=False)
    except TypeError:
        checkpoint = torch.load(model_path, map_location=device)
    state_dict = checkpoint["model_state_dict"] if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint else checkpoint
    model.load_state_dict(state_dict)
    model.eval()

    all_preds = []
    all_probs = []
    all_targets = []

    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            logits = model(images)
            probs = F.softmax(logits, dim=1)
            _, preds = torch.max(logits, 1)

            all_preds.extend(preds.cpu().numpy().tolist())
            all_probs.extend(probs[:, 1].cpu().numpy().tolist())  # Probability of AI-generated (class 1)
            all_targets.extend(labels.numpy().tolist())

    acc = float(accuracy_score(all_targets, all_preds))
    prec = float(precision_score(all_targets, all_preds, zero_division=0))
    rec = float(recall_score(all_targets, all_preds, zero_division=0))
    f1 = float(f1_score(all_targets, all_preds, zero_division=0))
    cm = confusion_matrix(all_targets, all_preds).tolist()

    # Calculate ROC-AUC if both classes present
    try:
        auc = float(roc_auc_score(all_targets, all_probs))
    except Exception:
        auc = 0.5

    report = classification_report(
        all_targets,
        all_preds,
        target_names=["Authentic (0)", "AI-Generated (1)"],
        output_dict=True,
        zero_division=0
    )

    metrics = {
        "status": "Evaluated",
        "model_architecture": "CloneLensCNN (Custom 4-Block Residual ConvNet + SE Attention)",
        "model_weights": model_path,
        "evaluation_split": split,
        "total_samples": len(all_targets),
        "authentic_samples": test_dataset.num_authentic,
        "ai_generated_samples": test_dataset.num_ai_generated,
        "accuracy": round(acc * 100.0, 2),
        "precision": round(prec * 100.0, 2),
        "recall": round(rec * 100.0, 2),
        "f1_score": round(f1 * 100.0, 2),
        "roc_auc": round(auc, 4),
        "confusion_matrix": {
            "true_authentic": cm[0][0] if len(cm) > 0 and len(cm[0]) > 0 else 0,
            "false_ai_generated": cm[0][1] if len(cm) > 0 and len(cm[0]) > 1 else 0,
            "false_authentic": cm[1][0] if len(cm) > 1 and len(cm[1]) > 0 else 0,
            "true_ai_generated": cm[1][1] if len(cm) > 1 and len(cm[1]) > 1 else 0,
        },
        "detailed_classification_report": report
    }

    print("\n" + "=" * 55)
    print("        CLONELENS CUSTOM CNN EVALUATION REPORT")
    print("=" * 55)
    print(f"  Accuracy:         {metrics['accuracy']:.2f}%")
    print(f"  Precision:        {metrics['precision']:.2f}%")
    print(f"  Recall:           {metrics['recall']:.2f}%")
    print(f"  F1-Score:         {metrics['f1_score']:.2f}%")
    print(f"  ROC-AUC:          {metrics['roc_auc']:.4f}")
    print("-" * 55)
    print(f"  Confusion Matrix: TN={cm[0][0]}, FP={cm[0][1]}, FN={cm[1][0]}, TP={cm[1][1]}")
    print("=" * 55 + "\n")

    if report_output:
        os.makedirs(os.path.dirname(report_output), exist_ok=True)
        with open(report_output, "w", encoding="utf-8") as f:
            json.dump(metrics, f, indent=2)
        print(f"[+] Saved evaluation report to {report_output}")

    return metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate CloneLens Custom CNN on Test Dataset")
    parser.add_argument("--model_path", type=str, default="backend/ml/image_model/saved_models/custom_cnn_v1.pt")
    parser.add_argument("--split", type=str, default="test")
    parser.add_argument("--limit_samples", type=int, default=None)
    args = parser.parse_args()

    evaluate_model(
        model_path=args.model_path,
        split=args.split,
        limit_samples=args.limit_samples
    )
