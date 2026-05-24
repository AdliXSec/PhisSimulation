from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    APP_NAME: str = "PhiSimulation"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-me-in-production"
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://phisim_admin:phisim_secret_2026@localhost:5432/phisimulation"

    # JWT
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # AI - OpenRouter
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_API_URL: str = "https://openrouter.ai/api/v1/chat/completions"
    OPENROUTER_MODEL: str = "deepseek/deepseek-v3.2"

    # Email - Mailtrap
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = "noreply@phisimulation.local"
    MAIL_PORT: int = 2525
    MAIL_SERVER: str = "sandbox.smtp.mailtrap.io"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # URLs
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_URL: str = "http://localhost:8000"

    # Auth
    GOOGLE_CLIENT_ID: str = "996912080865-20do3327g536bga5ae5duthqvvgr3dpj.apps.googleusercontent.com"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
