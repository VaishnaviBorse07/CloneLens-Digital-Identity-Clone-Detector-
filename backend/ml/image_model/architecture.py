"""Customized PyTorch CNN Architecture for AI-Generated vs Human-Generated Image Detection.

Features:
  - 4-Stage Progressive Residual Convolutional Blocks with LeakyReLU activations
  - Squeeze-and-Excitation (SE) Channel Attention Modules to highlight synthetic artifact channels
  - High-Frequency / Texture & Spatial Feature Extraction
  - Dual Global Pooling (Adaptive AvgPool + MaxPool) capturing distributed noise and peak artifacts
  - Built-in Grad-CAM (Gradient-weighted Class Activation Mapping) for visual explainability
"""
from typing import Optional, Tuple
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F


class SEBlock(nn.Module):
    """Squeeze-and-Excitation Channel Attention Module.
    Dynamically recalibrates channel-wise feature responses by explicitly modelling
    interdependencies between channels (critical for isolating GAN/diffusion frequency fingerprints).
    """
    def __init__(self, channels: int, reduction: int = 16):
        super(SEBlock, self).__init__()
        reduced_channels = max(channels // reduction, 4)
        self.fc = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Linear(channels, reduced_channels, bias=False),
            nn.ReLU(inplace=True),
            nn.Linear(reduced_channels, channels, bias=False),
            nn.Sigmoid()
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        b, c, _, _ = x.size()
        weights = self.fc(x).view(b, c, 1, 1)
        return x * weights


class ResidualConvBlock(nn.Module):
    """Residual Convolutional Block with optional SE Channel Attention."""
    def __init__(
        self,
        in_channels: int,
        out_channels: int,
        dropout_rate: float = 0.15,
        use_se: bool = True
    ):
        super(ResidualConvBlock, self).__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.act1 = nn.LeakyReLU(0.1, inplace=True)

        self.conv2 = nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)
        self.act2 = nn.LeakyReLU(0.1, inplace=True)

        self.se = SEBlock(out_channels) if use_se else nn.Identity()
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)
        self.dropout = nn.Dropout2d(dropout_rate)

        if in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, kernel_size=1, bias=False),
                nn.BatchNorm2d(out_channels)
            )
        else:
            self.shortcut = nn.Identity()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        res = self.shortcut(x)

        out = self.conv1(x)
        out = self.bn1(out)
        out = self.act1(out)

        out = self.conv2(out)
        out = self.bn2(out)
        out = self.se(out)

        out = out + res
        out = self.act2(out)
        out = self.pool(out)
        out = self.dropout(out)
        return out


class CloneLensCNN(nn.Module):
    """
    Advanced Custom Deepfake & AI Image Forensics CNN.
    
    Architecture:
      - Input: (B, 3, 224, 224) RGB Image
      - Stage 1: Conv Residual Block (3 -> 32 channels, 224x224 -> 112x112)
      - Stage 2: Conv Residual Block + SE (32 -> 64 channels, 112x112 -> 56x56)
      - Stage 3: Conv Residual Block + SE (64 -> 128 channels, 56x56 -> 28x28)
      - Stage 4: Conv Residual Block + SE (128 -> 256 channels, 28x28 -> 14x14)
      - Dual Pooling: AdaptiveAvgPool2d(2, 2) + AdaptiveMaxPool2d(2, 2) -> 256 * 8 features
      - Dense Classifier Head with BatchNorm, Dropout(0.3), and Linear Projections
      - Output: 2 logits: [Class 0: Authentic, Class 1: AI-Generated / Synthetic]
    """
    def __init__(self, num_classes: int = 2, dropout_rate: float = 0.3):
        super(CloneLensCNN, self).__init__()

        # Progressive Residual Backbone
        self.block1 = ResidualConvBlock(3, 32, dropout_rate=0.10, use_se=False)
        self.block2 = ResidualConvBlock(32, 64, dropout_rate=0.15, use_se=True)
        self.block3 = ResidualConvBlock(64, 128, dropout_rate=0.20, use_se=True)
        self.block4 = ResidualConvBlock(128, 256, dropout_rate=0.25, use_se=True)

        # Dual Pooling Heads: Average (global trends) + Max (local generative artifact peaks)
        self.avg_pool = nn.AdaptiveAvgPool2d((2, 2))
        self.max_pool = nn.AdaptiveMaxPool2d((2, 2))

        # Classifier Head (256 * 4 * 2 = 2048 input features)
        in_features = 256 * 4 * 2
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(in_features, 512),
            nn.BatchNorm1d(512),
            nn.LeakyReLU(0.1, inplace=True),
            nn.Dropout(dropout_rate),
            nn.Linear(512, 128),
            nn.BatchNorm1d(128),
            nn.LeakyReLU(0.1, inplace=True),
            nn.Dropout(dropout_rate * 0.5),
            nn.Linear(128, num_classes)
        )

        # Grad-CAM storage buffers
        self._gradients: Optional[torch.Tensor] = None
        self._activations: Optional[torch.Tensor] = None

    def forward_features(self, x: torch.Tensor) -> torch.Tensor:
        """Passes input through all 4 convolutional residual blocks."""
        x = self.block1(x)
        x = self.block2(x)
        x = self.block3(x)
        x = self.block4(x)
        return x

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        features = self.forward_features(x)
        
        # Capture activations for Grad-CAM if gradients are required
        if features.requires_grad:
            self._activations = features
            features.register_hook(self._save_gradient)

        # Dual pooling aggregation
        avg_p = self.avg_pool(features)
        max_p = self.max_pool(features)
        combined = torch.cat([avg_p, max_p], dim=1)

        logits = self.classifier(combined)
        return logits

    def _save_gradient(self, grad: torch.Tensor):
        self._gradients = grad

    def extract_features(self, x: torch.Tensor) -> torch.Tensor:
        """Extracts dense 512-dimensional embedding for similarity / forensic clustering."""
        features = self.forward_features(x)
        avg_p = self.avg_pool(features)
        max_p = self.max_pool(features)
        combined = torch.cat([avg_p, max_p], dim=1)
        flat = torch.flatten(combined, 1)
        
        # Pass through first classifier projection
        emb = self.classifier[1](flat)  # Linear(2048, 512)
        emb = self.classifier[2](emb)   # BatchNorm1d
        emb = self.classifier[3](emb)   # LeakyReLU
        return emb

    def generate_gradcam(
        self,
        input_tensor: torch.Tensor,
        target_class: Optional[int] = None
    ) -> np.ndarray:
        """
        Generates a 2D Grad-CAM (Gradient-weighted Class Activation Map) heatmap
        of shape (H, W) with values normalized in [0.0, 1.0].
        
        Highlights visual regions (e.g. hair boundaries, eye reflections, skin smoothing)
        that contributed strongest to the classification decision.
        """
        self.eval()
        if input_tensor.dim() == 3:
            input_tensor = input_tensor.unsqueeze(0)

        input_tensor = input_tensor.clone().detach().requires_grad_(True)
        
        # Forward pass
        logits = self.forward(input_tensor)
        
        if target_class is None:
            target_class = int(logits.argmax(dim=1).item())

        score = logits[:, target_class]
        
        # Backward pass
        self.zero_grad()
        score.backward(retain_graph=True)

        if self._gradients is None or self._activations is None:
            # Fallback uniform attention if gradients unavailable
            return np.ones((input_tensor.shape[2], input_tensor.shape[3]), dtype=np.float32) * 0.5

        gradients = self._gradients.detach().cpu().numpy()[0]   # (C, H_feat, W_feat)
        activations = self._activations.detach().cpu().numpy()[0] # (C, H_feat, W_feat)

        # Global average pooling of gradients per channel
        weights = np.mean(gradients, axis=(1, 2))  # (C,)

        # Weighted combination of activation maps
        cam = np.zeros(activations.shape[1:], dtype=np.float32)
        for i, w in enumerate(weights):
            cam += w * activations[i, :, :]

        # Apply ReLU to focus on positive contributions
        cam = np.maximum(cam, 0)

        # Normalize to [0, 1]
        cam_max = np.max(cam)
        if cam_max > 1e-8:
            cam = cam / cam_max
        else:
            cam = np.zeros_like(cam)

        # Bilinear interpolation resize to input resolution (H, W)
        target_h, target_w = input_tensor.shape[2], input_tensor.shape[3]
        cam_tensor = torch.from_numpy(cam).unsqueeze(0).unsqueeze(0)
        resized_cam = F.interpolate(
            cam_tensor,
            size=(target_h, target_w),
            mode="bilinear",
            align_corners=False
        ).squeeze().numpy()

        return resized_cam


def get_model(num_classes: int = 2) -> CloneLensCNN:
    """Factory method returning initialized CloneLensCNN instance."""
    return CloneLensCNN(num_classes=num_classes)
