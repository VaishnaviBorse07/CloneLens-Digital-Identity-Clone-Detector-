"""Evaluation Script for Custom CNN Face Clone Detector"""
import os
import torch
import numpy as np
from torch.utils.data import DataLoader
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from backend.ml.image_model.architecture import get_model
from backend.ml.image_model.dataset import FaceCloneDataset


def evaluate_model(
    model_path: str = "backend/ml/image_model/saved_models/custom_cnn_v1.pt",
    data_dir: str = "data",
    batch_size: int = 32,
    device: str = "cuda" if torch.cuda.is_available() else "cpu"
):
    if not os.path.exists(model_path):
        print(f"[!] Model weights not found at {model_path}. Status: Training required.")
        return {"status": "Training required"}

    test_dataset = FaceCloneDataset(root_dir=data_dir, split="test")
    if len(test_dataset) == 0:
        print("[!] No test samples found in data/images/test/. Please add test dataset.")
        return {"status": "No test samples"}

    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)
    model = get_model(num_classes=2).to(device)

    checkpoint = torch.load(model_path, map_location=device)
    model.load_state_dict(checkpoint["model_state_dict"] if "model_state_dict" in checkpoint else checkpoint)
    model.eval()

    all_preds = []
    all_targets = []

    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)
            all_preds.extend(preds.cpu().numpy())
            all_targets.extend(labels.numpy())

    acc = accuracy_score(all_targets, all_preds)
    prec = precision_score(all_targets, all_preds, zero_division=0)
    rec = recall_score(all_targets, all_preds, zero_division=0)
    f1 = f1_score(all_targets, all_preds, zero_division=0)
    cm = confusion_matrix(all_targets, all_preds).tolist()

    metrics = {
        "accuracy": float(acc),
        "precision": float(prec),
        "recall": float(rec),
        "f1_score": float(f1),
        "confusion_matrix": cm,
        "total_test_samples": len(all_targets),
        "status": "Evaluated"
    }
    print("[*] Evaluation Metrics:")
    for k, v in metrics.items():
        print(f"  {k}: {v}")
    return metrics


if __name__ == "__main__":
    evaluate_model()
