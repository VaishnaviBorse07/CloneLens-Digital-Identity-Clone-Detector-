"""Dataset Loader & Forensic Data Augmentation for AI vs Human Generated Image Detection"""
import os
import random
from typing import Tuple, Optional, List
from PIL import Image, ImageEnhance
import torch
from torch.utils.data import Dataset
import numpy as np


def apply_data_augmentation(pil_image: Image.Image) -> Image.Image:
    """Applies randomized forensic data augmentation to enhance model generalization."""
    img = pil_image.copy()

    # 1. Random horizontal flip (50% probability)
    if random.random() > 0.5:
        img = img.transpose(Image.FLIP_LEFT_RIGHT)

    # 2. Subtle rotation (-10 to +10 degrees)
    if random.random() > 0.6:
        angle = random.uniform(-10.0, 10.0)
        img = img.rotate(angle, resample=Image.Resampling.BILINEAR)

    # 3. Brightness & Contrast jitter (+-15%)
    if random.random() > 0.5:
        brightness_factor = random.uniform(0.85, 1.15)
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(brightness_factor)

    if random.random() > 0.5:
        contrast_factor = random.uniform(0.85, 1.15)
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(contrast_factor)

    return img


def preprocess_image_tensor(
    pil_image: Image.Image,
    image_size: int = 224,
    is_train: bool = False
) -> torch.Tensor:
    """
    Standardizes and converts a PIL RGB Image to normalized PyTorch float Tensor (3, H, W).
    Applies optional forensic augmentations during training.
    """
    if is_train:
        pil_image = apply_data_augmentation(pil_image)

    resized = pil_image.resize((image_size, image_size), Image.Resampling.BILINEAR)
    img_array = np.array(resized, dtype=np.float32) / 255.0  # [0, 1]

    # Standard ImageNet normalization: mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    norm_img = (img_array - mean) / std

    # Add subtle Gaussian noise during training (simulates compression/sensor artifacts)
    if is_train and random.random() > 0.7:
        noise = np.random.normal(0, 0.02, norm_img.shape).astype(np.float32)
        norm_img = norm_img + noise

    # Transpose to (C, H, W)
    tensor = torch.from_numpy(norm_img).permute(2, 0, 1).float()
    return tensor


def get_image_transforms(image_size: int = 224, is_train: bool = False):
    """Returns transformation function for facial imagery."""
    return lambda img: preprocess_image_tensor(img, image_size=image_size, is_train=is_train)


class FaceCloneDataset(Dataset):
    """
    Custom Dataset for loading Authentic (Class 0) and AI-Generated (Class 1) facial images.
    Supports train, validation, and test splits with optional sample subsampling for fast training.
    """
    def __init__(
        self,
        root_dir: str = "data",
        split: str = "train",
        image_size: int = 224,
        limit_samples: Optional[int] = None,
        seed: int = 42
    ):
        self.split_dir = os.path.join(root_dir, "images", split)
        self.is_train = (split == "train")
        self.image_size = image_size
        self.samples: List[Tuple[str, int]] = []

        authentic_dir = os.path.join(self.split_dir, "authentic")
        ai_gen_dir = os.path.join(self.split_dir, "ai_generated")

        authentic_samples = []
        ai_gen_samples = []

        valid_exts = (".png", ".jpg", ".jpeg", ".webp")

        if os.path.exists(authentic_dir):
            for fname in os.listdir(authentic_dir):
                if fname.lower().endswith(valid_exts):
                    authentic_samples.append((os.path.join(authentic_dir, fname), 0))

        if os.path.exists(ai_gen_dir):
            for fname in os.listdir(ai_gen_dir):
                if fname.lower().endswith(valid_exts):
                    ai_gen_samples.append((os.path.join(ai_gen_dir, fname), 1))

        # Shuffle deterministically
        rng = random.Random(seed)
        rng.shuffle(authentic_samples)
        rng.shuffle(ai_gen_samples)

        # Apply sample limit if requested (e.g. for quick benchmarking or balanced subset)
        if limit_samples is not None and limit_samples > 0:
            half_limit = limit_samples // 2
            auth_sub = authentic_samples[:min(half_limit, len(authentic_samples))]
            fake_sub = ai_gen_samples[:min(half_limit, len(ai_gen_samples))]
            self.samples = auth_sub + fake_sub
            rng.shuffle(self.samples)
        else:
            self.samples = authentic_samples + ai_gen_samples
            rng.shuffle(self.samples)

        self.num_authentic = sum(1 for _, label in self.samples if label == 0)
        self.num_ai_generated = sum(1 for _, label in self.samples if label == 1)

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        img_path, label = self.samples[idx]
        try:
            image = Image.open(img_path).convert("RGB")
        except Exception:
            # Create a blank fallback tensor if an image file is corrupted
            return torch.zeros((3, self.image_size, self.image_size), dtype=torch.float32), label

        tensor = preprocess_image_tensor(image, image_size=self.image_size, is_train=self.is_train)
        return tensor, label

    def compute_class_weights(self) -> torch.FloatTensor:
        """
        Computes inverse class frequency weights: W_c = N_total / (2 * N_c)
        to neutralize dataset class imbalance (e.g. 1:4 Authentic vs AI-Gen).
        """
        total = len(self.samples)
        if total == 0 or self.num_authentic == 0 or self.num_ai_generated == 0:
            return torch.tensor([1.0, 1.0], dtype=torch.float32)

        weight_auth = float(total) / (2.0 * float(self.num_authentic))
        weight_fake = float(total) / (2.0 * float(self.num_ai_generated))
        return torch.tensor([weight_auth, weight_fake], dtype=torch.float32)
