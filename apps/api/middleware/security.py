"""
Middleware de seguridad para la aplicación.
Incluye rate limiting, headers de seguridad, y CORS.
"""
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
import time


# Configurar rate limiter
limiter = Limiter(key_func=get_remote_address)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware para agregar headers de seguridad a todas las respuestas.
    """
    
    async def dispatch(self, request: Request, call_next: Callable):
        print(f"DEBUG: SecurityHeadersMiddleware executing for {request.url}")
        response = await call_next(request)
        # Headers de seguridad
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Content Security Policy
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' http://localhost:8001 http://localhost:3000 http://127.0.0.1:8001 http://127.0.0.1:3000 https://vmp-edtech.com https://www.vmp-edtech.com https://api.vmp-edtech.com https:;"
        )

        return response


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Middleware para agregar un ID único a cada request.
    Útil para tracking y debugging.
    """
    
    async def dispatch(self, request: Request, call_next: Callable):
        request_id = f"{int(time.time() * 1000)}-{get_remote_address(request)}"
        request.state.request_id = request_id
        
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        
        return response


# Rate limit decorators para endpoints específicos
def rate_limit_login():
    """Rate limit para login: 5 requests por minuto"""
    return limiter.limit("5/minute")


def rate_limit_forgot_password():
    """Rate limit para forgot password: 3 requests por minuto"""
    return limiter.limit("3/minute")


def rate_limit_public():
    """Rate limit para endpoints públicos: 20 requests por minuto"""
    return limiter.limit("20/minute")


def rate_limit_api():
    """Rate limit general para API: 60 requests por minuto"""
    return limiter.limit("60/minute")
