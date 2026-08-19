import os
import sys
import argparse
import time
from typing import Dict, Any, Optional

# Ensure project root is on sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from sklearn.metrics import f1_score, precision_score, recall_score

from backend.ml.image_model.architecture import get_model, CloneLensCNN
from backend.ml.image_model.dataset import FaceCloneDataset


def train_model(
    data_dir: str = "data",
    epochs: int = 5,
    batch_size: int = 32,
    learning_rate: float = 1e-3,
    limit_samples: Optional[int] = None,
    save_path: str = "backend/ml/image_model/saved_models/custom_cnn_v1.pt",
    device: Optional[str] = None
) -> Dict[str, Any]:
    """
    Trains the specialized CloneLensCNN model on authentic vs AI-generated facial images.
    Applies inverse class weighting to balance 1:4 dataset distribution.
    """
    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"

    print(f"[*] Initializing CloneLensCNN Training Pipeline")
    print(f"    - Target Device: {device}")
    print(f"    - Epochs: {epochs} | Batch Size: {batch_size} | Learning Rate: {learning_rate}")
    if limit_samples:
        print(f"    - Subsample Limit: {limit_samples} images per split")

    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    # 1. Load Datasets
    print(f"[*] Loading training & validation datasets from '{data_dir}/images'...")
    train_dataset = FaceCloneDataset(root_dir=data_dir, split="train", limit_samples=limit_samples)
    val_dataset = FaceCloneDataset(
        root_dir=data_dir,
        split="validation",
        limit_samples=limit_samples // 4 if limit_samples else None
    )

    if len(train_dataset) == 0:
        print("[!] No training samples found in data/images/train/. Cannot proceed.")
        return {"status": "No training samples found"}

    print(f"[+] Train dataset: {len(train_dataset):,} samples "
          f"({train_dataset.num_authentic:,} authentic, {train_dataset.num_ai_generated:,} AI-generated)")
    print(f"[+] Validation dataset: {len(val_dataset):,} samples "
          f"({val_dataset.num_authentic:,} authentic, {val_dataset.num_ai_generated:,} AI-generated)")

    # 2. Data Loaders & Class Weighting
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    class_weights = train_dataset.compute_class_weights().to(device)
    print(f"[+] Computed Class Imbalance Weights: Authentic={class_weights[0]:.3f}, AI-Generated={class_weights[1]:.3f}")

    # 3. Model, Criterion, Optimizer & Scheduler
    model = get_model(num_classes=2).to(device)
    criterion = nn.CrossEntropyLoss(weight=class_weights)
    optimizer = optim.AdamW(model.parameters(), lr=learning_rate, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=max(epochs, 1), eta_min=1e-5)

    best_val_f1 = 0.0
    best_val_acc = 0.0
    training_history = []

    start_time = time.time()

    # 4. Training Loop
    for epoch in range(epochs):
        epoch_start = time.time()
        model.train()
        running_loss = 0.0
        train_correct = 0
        train_total = 0

        for batch_idx, (images, labels) in enumerate(train_loader):
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()

            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            
            # Gradient clipping to stabilize deep residual blocks
            nn.utils.clip_grad_norm_(model.parameters(), max_norm=2.0)
            
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, predicted = torch.max(outputs, 1)
            train_total += labels.size(0)
            train_correct += (predicted == labels).sum().item()

        scheduler.step()

        train_epoch_loss = running_loss / max(train_total, 1)
        train_epoch_acc = (train_correct / max(train_total, 1)) * 100.0

        # 5. Validation Evaluation
        model.eval()
        val_loss = 0.0
        val_preds = []
        val_targets = []

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                val_loss += loss.item() * images.size(0)

                _, predicted = torch.max(outputs, 1)
                val_preds.extend(predicted.cpu().numpy())
                val_targets.extend(labels.cpu().numpy())

        val_total = len(val_targets)
        val_epoch_loss = val_loss / max(val_total, 1)
        val_acc = (sum(p == t for p, t in zip(val_preds, val_targets)) / max(val_total, 1)) * 100.0 if val_total > 0 else 0.0
        val_f1 = float(f1_score(val_targets, val_preds, zero_division=0) * 100.0) if val_total > 0 else 0.0
        val_prec = float(precision_score(val_targets, val_preds, zero_division=0) * 100.0) if val_total > 0 else 0.0
        val_rec = float(recall_score(val_targets, val_preds, zero_division=0) * 100.0) if val_total > 0 else 0.0

        epoch_duration = time.time() - epoch_start
        print(
            f"Epoch [{epoch+1:02d}/{epochs:02d}] ({epoch_duration:.1f}s) | "
            f"Train Loss: {train_epoch_loss:.4f} Acc: {train_epoch_acc:5.2f}% | "
            f"Val Loss: {val_epoch_loss:.4f} Acc: {val_acc:5.2f}% F1: {val_f1:5.2f}% (Prec: {val_prec:.1f}%, Rec: {val_rec:.1f}%)"
        )

        history_entry = {
            "epoch": epoch + 1,
            "train_loss": round(train_epoch_loss, 4),
            "train_acc": round(train_epoch_acc, 2),
            "val_loss": round(val_epoch_loss, 4),
            "val_acc": round(val_acc, 2),
            "val_f1": round(val_f1, 2)
        }
        training_history.append(history_entry)

        # Save Checkpoint if best validation F1 or last epoch
        if val_f1 >= best_val_f1 or epoch == epochs - 1:
            best_val_f1 = val_f1
            best_val_acc = val_acc
            torch.save({
                "epoch": epoch + 1,
                "model_state_dict": model.state_dict(),
                "val_acc": val_acc,
                "val_f1": val_f1,
                "val_loss": val_epoch_loss,
                "architecture": "CloneLensCNN",
                "class_weights": class_weights.cpu().tolist(),
                "class_names": ["Authentic", "AI-Generated / Synthetic"],
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }, save_path)
            print(f"  [+] Saved best model checkpoint to {save_path} (Val F1: {val_f1:.2f}%)")

    total_training_time = time.time() - start_time
    print(f"\n[✓] Training completed in {total_training_time:.1f}s. Best Val Acc: {best_val_acc:.2f}%, Best Val F1: {best_val_f1:.2f}%")

    return {
        "status": "Trained",
        "best_val_acc": round(best_val_acc, 2),
        "best_val_f1": round(best_val_f1, 2),
        "total_time_seconds": round(total_training_time, 2),
        "history": training_history,
        "save_path": save_path
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train CloneLens Customized CNN for AI Image Forensics")
    parser.add_argument("--epochs", type=int, default=5, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=32, help="DataLoader batch size")
    parser.add_argument("--lr", type=float, default=1e-3, help="Initial learning rate")
    parser.add_argument("--limit_samples", type=int, default=None, help="Optional sample limit for quick training")
    parser.add_argument("--save_path", type=str, default="backend/ml/image_model/saved_models/custom_cnn_v1.pt")
    args = parser.parse_args()

    train_model(
        epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.lr,
        limit_samples=args.limit_samples,
        save_path=args.save_path
    )
