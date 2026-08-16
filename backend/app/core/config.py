"""CloneLens Core Configuration Module"""
import os
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    APP_NAME: str = "CloneLens Digital Identity Clone Detector"
    API_V1_PREFIX: str = "/api"

    # Server Bind
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    ALLOWED_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # Database
    DATABASE_URL: str = "sqlite:///./clonelens.db"

    # ML Image Model
    IMAGE_MODEL_WEIGHTS_PATH: str = "backend/ml/image_model/saved_models/custom_cnn_v1.pt"
    IMAGE_INPUT_SIZE: int = 224
    IMAGE_BATCH_SIZE: int = 32

    # Decision Fusion Defaults
    FUSION_IMAGE_WEIGHT: float = 0.60
    FUSION_TEXT_WEIGHT: float = 0.40
    FUSION_THRESHOLD_AUTHENTIC: float = 0.70
    FUSION_THRESHOLD_FAKE: float = 0.40

    # LLM / Text Model
    LLM_PROVIDER: str = "mock"
    LLM_API_KEY: str = ""
    LLM_MODEL_NAME: str = "gpt-4o-mini"

    # Uploads & Security
    MAX_UPLOAD_SIZE_MB: int = 10
    ALLOWED_IMAGE_TYPES: Union[str, List[str]] = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ]

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @field_validator("ALLOWED_ORIGINS", "ALLOWED_IMAGE_TYPES", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return []


settings = Settings()
