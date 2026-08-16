"""Training Script for Custom CNN Facial Clone Detector"""
import os
import argparse
import time
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from backend.ml.image_model.architecture import get_model
from backend.ml.image_model.dataset import FaceCloneDataset


def train_model(
    data_dir: str = "data",
    epochs: int = 15,
    batch_size: int = 32,
    learning_rate: float = 1e-3,
    save_path: str = "backend/ml/image_model/saved_models/custom_cnn_v1.pt",
    device: str = "cuda" if torch.cuda.is_available() else "cpu"
):
    print(f"[*] Initializing training on device: {device}")
    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    train_dataset = FaceCloneDataset(root_dir=data_dir, split="train")
    val_dataset = FaceCloneDataset(root_dir=data_dir, split="validation")

    if len(train_dataset) == 0:
        print("[!] No training samples found in data/images/train/. Please populate dataset before training.")
        return

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    model = get_model(num_classes=2).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=learning_rate, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="min", patience=2, factor=0.5)

    best_val_acc = 0.0

    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

        epoch_loss = running_loss / max(total, 1)
        epoch_acc = (correct / max(total, 1)) * 100.0

        # Validation
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                val_loss += loss.item() * images.size(0)
                _, predicted = torch.max(outputs, 1)
                val_total += labels.size(0)
                val_correct += (predicted == labels).sum().item()

        val_epoch_loss = val_loss / max(val_total, 1)
        val_epoch_acc = (val_correct / max(val_total, 1)) * 100.0 if val_total > 0 else 0.0

        scheduler.step(val_epoch_loss)

        print(f"Epoch [{epoch+1}/{epochs}] | Train Loss: {epoch_loss:.4f} Acc: {epoch_acc:.2f}% | Val Loss: {val_epoch_loss:.4f} Acc: {val_epoch_acc:.2f}%")

        if val_epoch_acc > best_val_acc or epoch == epochs - 1:
            best_val_acc = val_epoch_acc
            torch.save({
                "epoch": epoch + 1,
                "model_state_dict": model.state_dict(),
                "val_acc": val_epoch_acc,
                "architecture": "CloneLensCNN"
            }, save_path)
            print(f"[+] Saved model checkpoint to {save_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train CloneLens Custom CNN")
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-3)
    args = parser.parse_args()
    train_model(epochs=args.epochs, batch_size=args.batch_size, learning_rate=args.lr)
