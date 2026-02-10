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
                "https://vmpservicios.com",
                "https://www.vmpservicios.com",
                "https://app.vmpservicios.com",
                # Agregar dominios de producción aquí
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
    EMAIL_FROM: str = "noreply@vmpservicios.com"
    EMAIL_VENTAS: str = "ventas@vmpservicios.com"
    ADMIN_URL: str = "http://localhost:3000"
    
    # Monitoring
    SENTRY_DSN: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()
