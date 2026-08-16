"""Custom PyTorch CNN Architecture for Facial Clone & AI Generation Detection"""
import torch
import torch.nn as nn
import torch.nn.functional as F


class ConvBlock(nn.Module):
    def __init__(self, in_channels: int, out_channels: int, dropout_rate: float = 0.2):
        super(ConvBlock, self).__init__()
        self.conv = nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False)
        self.bn = nn.BatchNorm2d(out_channels)
        self.act = nn.ReLU(inplace=True)
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)
        self.dropout = nn.Dropout2d(dropout_rate)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.conv(x)
        x = self.bn(x)
        x = self.act(x)
        x = self.pool(x)
        x = self.dropout(x)
        return x


class CloneLensCNN(nn.Module):
    """
    Lightweight Custom CNN specifically designed for detecting synthetic / manipulated facial artifacts.
    Architecture:
      - Input: 3x224x224 RGB image
      - 4 Convolutional blocks (32 -> 64 -> 128 -> 256 filters)
      - Adaptive Average Pooling (produces fixed 4x4 spatial feature map)
      - Fully Connected Dense Head with Dropout regularization
      - Binary Classification Output: Probability of authenticity (class 0: authentic, class 1: ai_generated)
    """
    def __init__(self, num_classes: int = 2, dropout_rate: float = 0.3):
        super(CloneLensCNN, self).__init__()
        
        self.features = nn.Sequential(
            ConvBlock(3, 32, dropout_rate=0.1),    # 224 -> 112
            ConvBlock(32, 64, dropout_rate=0.15),  # 112 -> 56
            ConvBlock(64, 128, dropout_rate=0.2),  # 56 -> 28
            ConvBlock(128, 256, dropout_rate=0.25) # 28 -> 14
        )
        
        self.adaptive_pool = nn.AdaptiveAvgPool2d((4, 4))
        
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(256 * 4 * 4, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout_rate),
            nn.Linear(256, 64),
            nn.ReLU(inplace=True),
            nn.Linear(64, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        x = self.adaptive_pool(x)
        logits = self.classifier(x)
        return logits

    def extract_features(self, x: torch.Tensor) -> torch.Tensor:
        """Extract intermediate convolutional embeddings for interpretability."""
        x = self.features(x)
        x = self.adaptive_pool(x)
        return torch.flatten(x, 1)


def get_model(num_classes: int = 2) -> CloneLensCNN:
    return CloneLensCNN(num_classes=num_classes)
