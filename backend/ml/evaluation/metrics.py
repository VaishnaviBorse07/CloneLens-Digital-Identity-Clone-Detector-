"""Evaluation Metrics Utilities for Research Analysis"""
from typing import List, Dict, Any
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix


def compute_classification_metrics(y_true: List[int], y_pred: List[int]) -> Dict[str, Any]:
    """Calculates standard classification metrics without fabrication."""
    if not y_true or not y_pred or len(y_true) != len(y_pred):
        return {
            "status": "Training required",
            "message": "Dataset evaluation requires non-empty, matching ground-truth and prediction vectors."
        }

    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, zero_division=0)
    rec = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    cm = confusion_matrix(y_true, y_pred).tolist()

    return {
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1_score": round(float(f1), 4),
        "confusion_matrix": cm,
        "sample_count": len(y_true),
        "status": "Evaluated",
    }
