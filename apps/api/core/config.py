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
    FRONTEND_URL: str = "https://www.vmp-edtech.com"
    ENVIRONMENT: str = "production"
    
    @property
    def BACKEND_CORS_ORIGINS(self) -> List[str]:
        """
        Configuración de CORS según el entorno.
        En desarrollo: permite localhost
        En producción: solo dominios específicos
        """
        if self.ENVIRONMENT == "production":
            # Lista blanca de dominios permitidos en producción
            return [
                "https://www.vmp-edtech.com",
                "https://vmp-edtech.com",
                "http://localhost:3000",
                "http://localhost:3001",
            ]
        else:
            # Desarrollo: permite localhost en varios puertos
            return [
                "http://localhost:3000",
                "http://localhost:3001",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:3001",
            ]
    
    # Storage
    STORAGE_PATH: str = "./storage"
    
    # Email
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@vmp-edtech.com"
    EMAIL_VENTAS: str = "administracion@vmp-edtech.com"
    ADMIN_URL: str = "http://localhost:3000"
    
    # Automation / n8n
    N8N_WEBHOOK_URL: str = ""
    N8N_WEBHOOK_SECRET: str = ""

    # Monitoring
    SENTRY_DSN: str = ""
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
