from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # JWT
    JWT_SECRET: str
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

        # 2. Configuración por defecto basada en entorno
        if self.ENVIRONMENT == "production":
            return [
                "https://vmp-edtech-next-final.vercel.app",
                "https://vmp-edtech-web.vercel.app",
                "https://vmp-edtech.com",
                "https://www.vmp-edtech.com",
                "https://api.vmp-edtech.com",
                "https://vmpservicios.com",
                "https://www.vmpservicios.com",
                "https://vmp-servicios-production.up.railway.app",
            ]
        
        return [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
        ]
    
    # Storage — Railway Volume mount path (/data/storage in production)
    STORAGE_PATH: str = "/data/storage"
    
    # Email
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@vmp-edtech.com"
    EMAIL_VENTAS: str = "ventas@vmp-edtech.com"
    ADMIN_URL: str = "http://localhost:3000"
    
    # Monitoring
    SENTRY_DSN: str = ""
    
    class Config:
        env_file = ".env"


settings = Settings()
