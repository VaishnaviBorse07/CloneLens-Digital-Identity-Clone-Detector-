"""Dataset Loader & Transforms for Facial Clone Detection"""
import os
from typing import Tuple, Optional
from PIL import Image
import torch
from torch.utils.data import Dataset
import numpy as np

try:
    from torchvision import transforms
    HAS_TORCHVISION = True
except ImportError:
    HAS_TORCHVISION = False


def preprocess_image_tensor(pil_image: Image.Image, image_size: int = 224) -> torch.Tensor:
    """Standardizes and converts PIL RGB Image to normalized PyTorch float Tensor (3, H, W)."""
    resized = pil_image.resize((image_size, image_size), Image.Resampling.BILINEAR)
    img_array = np.array(resized, dtype=np.float32) / 255.0  # [0, 1]
    
    # Standard ImageNet normalization: mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    norm_img = (img_array - mean) / std
    
    # Transpose to (C, H, W)
    tensor = torch.from_numpy(norm_img).permute(2, 0, 1).float()
    return tensor


def get_image_transforms(image_size: int = 224, is_train: bool = False):
    """Returns transformation pipeline for facial imagery."""
    if HAS_TORCHVISION:
        if is_train:
            return transforms.Compose([
                transforms.Resize((image_size, image_size)),
                transforms.RandomHorizontalFlip(p=0.5),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ])
        else:
            return transforms.Compose([
                transforms.Resize((image_size, image_size)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ])
    else:
        return lambda img: preprocess_image_tensor(img, image_size=image_size)


class FaceCloneDataset(Dataset):
    """Custom Dataset for loading Authentic (0) and AI-Generated (1) facial images."""
    def __init__(self, root_dir: str, split: str = "train", transform=None):
        self.split_dir = os.path.join(root_dir, "images", split)
        self.transform = transform or get_image_transforms(is_train=(split == "train"))
        self.samples = []

        authentic_dir = os.path.join(self.split_dir, "authentic")
        ai_gen_dir = os.path.join(self.split_dir, "ai_generated")

        if os.path.exists(authentic_dir):
            for fname in os.listdir(authentic_dir):
                if fname.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
                    self.samples.append((os.path.join(authentic_dir, fname), 0))

        if os.path.exists(ai_gen_dir):
            for fname in os.listdir(ai_gen_dir):
                if fname.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
                    self.samples.append((os.path.join(ai_gen_dir, fname), 1))

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        img_path, label = self.samples[idx]
        image = Image.open(img_path).convert("RGB")
        if self.transform:
            image = self.transform(image)
        return image, label
