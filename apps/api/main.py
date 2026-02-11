from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from middleware.security import (
    SecurityHeadersMiddleware,
    RequestIDMiddleware,
    limiter,
    _rate_limit_exceeded_handler
)
from slowapi.errors import RateLimitExceeded
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from core.logging import setup_logging

from core.database import connect_db, disconnect_db

# Setup structured logging
setup_logging()

# Initialize Sentry
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        integrations=[FastApiIntegration()],
        environment=settings.ENVIRONMENT,
        traces_sample_rate=1.0,
    )

app = FastAPI(
    title="VMP Servicios API",
    description="API para plataforma de capacitación profesional con credenciales verificables",
    version="0.1.0-beta",
)

@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()

# Rate limiter state
app.state.limiter = limiter

app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security Middleware
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestIDMiddleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



from routers import auth, examenes, cursos, inscripciones, fotos_credencial, empresas, users, cotizaciones, public, metrics, seed

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(examenes.router, prefix="/api/examenes", tags=["examenes"])
app.include_router(cursos.router, prefix="/api/cursos", tags=["cursos"])
app.include_router(inscripciones.router, prefix="/api/inscripciones", tags=["inscripciones"])
app.include_router(fotos_credencial.router, prefix="/api/fotos-credencial", tags=["fotos-credencial"])
app.include_router(empresas.router, prefix="/api/empresas", tags=["empresas"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(cotizaciones.router, prefix="/api/cotizaciones", tags=["cotizaciones"])
app.include_router(public.router, prefix="/api/public", tags=["public"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["metrics"])
app.include_router(seed.router, prefix="/api/seed", tags=["seed"])



@app.get("/")
async def root():
    return {
        "message": "VMP Servicios API",
        "version": "0.1.0-beta",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}

