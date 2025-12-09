import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_ENV: str = "development"
    PORT: int = 8000
    MONGODB_URI: str
    JWT_SECRET: str
    JWT_EXPIRES_IN: int = 86400
    CORS_ORIGINS: str = "http://localhost:5173"
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), ".env")

settings = Settings()