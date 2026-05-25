from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Database
    
    # JWT
    JWT_SECRET: str = "your-super-secret-key-change-in-production-min-32-chars"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    ENVIRONMENT: str = "development"
    
    CORS_ORIGINS: str = ""

    @property
    def BACKEND_CORS_ORIGINS(self) -> List[str]:
        """
        Configuración de CORS según el entorno.
        Soporta variable de entorno dinámica (CORS_ORIGINS="url1,url2")
        """
        # 1. Soporte para variable de entorno dinámica
        cors_origins_env = os.getenv("CORS_ORIGINS", "")
        if cors_origins_env:
            return [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

        if self.CORS_ORIGINS:
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

        # 2. Unificar orígenes (siempre permitir localhost y producción)
        return [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "https://vmp-edtech-next-final.vercel.app",
            "https://vmp-edtech-web.vercel.app",
            "https://vmp-edtech.com",
            "https://www.vmp-edtech.com",
            "https://api.vmp-edtech.com",
            "https://vmpservicios.com",
            "https://www.vmpservicios.com",
            "https://vmp-servicios-production.up.railway.app",
        ]
    
    # Storage — Railway Volume mount path (/app/storage or /data/storage in production)
    # Default to 'storage' directory in the app root
    STORAGE_PATH: str = os.getenv(
        "STORAGE_PATH", 
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "storage"))
    )
    
    # Email
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@vmp-edtech.com"
    EMAIL_VENTAS: str = "ventas@vmp-edtech.com"
    ADMIN_URL: str = "http://localhost:3000"
    
    # ─── n8n Automation Engine ────────────────────────────────────────────────
    # URL del webhook raíz de n8n (ej: https://n8n.railway.app/webhook/vmp)
    # Si está vacío, todos los eventos se descartarán silenciosamente.
    N8N_WEBHOOK_URL: str = os.environ.get("N8N_WEBHOOK_URL", "")
    
    # Secret compartido entre la API y n8n para firmar payloads con HMAC-SHA256.
    # Generar con: python3 -c "import secrets; print(secrets.token_hex(32))"
    N8N_WEBHOOK_SECRET: str = os.environ.get("N8N_WEBHOOK_SECRET", "vmp-n8n-default-secret-change-me")
    
    # Monitoring
    SENTRY_DSN: str = ""

    # Railway PostgreSQL Defaults
    DATABASE_URL: str = os.environ.get(
        "DATABASE_URL",
        "postgresql://postgres:IwcEOvwvqqrKORJeBLRVIJFJgHlJXAlv@postgres.railway.internal:5432/railway"
    )
    
    # Railway Redis Defaults
    REDIS_URL: str = os.environ.get(
        "REDIS_URL",
        "redis://default:NaxeRKqQcmsoQkMfloNCbNPHhIhzilEA@redis.railway.internal:6379"
    )
    # Gemini AI
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
