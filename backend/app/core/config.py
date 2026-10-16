import os
from pathlib import Path
from dotenv import load_dotenv

# Carrega o .env localizado na raiz de backend/
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings:
    PROJECT_NAME: str = "Fact-Checking Agent API"
    VERSION: str = "1.0.0"
    DEFAULT_GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    DEFAULT_GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]

    # Turso / LibSQL Database Configuration
    TURSO_DATABASE_URL: str = os.getenv("TURSO_DATABASE_URL", f"file:{(BASE_DIR / 'local.db').as_posix()}")
    TURSO_AUTH_TOKEN: str = os.getenv("TURSO_AUTH_TOKEN", "")

    # JWT Authentication Configuration
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "finesse-check-secret-jwt-key-development-2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

settings = Settings()

