import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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
    title="VMP - EDTECH API",
    description="API para plataforma de capacitación profesional con credenciales verificables",
    version="0.1.0-beta",
)

@app.on_event("startup")
async def startup():
    # 1. Database Connection with better error handling
    try:
        await connect_db()
    except Exception as e:
        print(f"❌ CRITICAL ERROR: Could not connect to database: {e}")
        # In production, we might want to continue or exit depending on criticality
        # For now, we log and let it proceed (it will fail on requests anyway)
    
    # 2. Ensure ALL storage directories exist
    # Using a list to ensure consistency and avoid missing subdirs
    storage_dirs = [
        os.path.join(settings.STORAGE_PATH, "credenciales"),
        os.path.join(settings.STORAGE_PATH, "uploads", "credenciales"),
        os.path.join(settings.STORAGE_PATH, "uploads", "evidencias"),
    ]
    
    for directory in storage_dirs:
        try:
            os.makedirs(directory, exist_ok=True)
            print(f"✅ Storage directory ready: {directory}")
        except Exception as e:
            print(f"⚠️ Warning: Could not create directory {directory}: {e}")

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



from routers import auth, examenes, cursos, inscripciones, evidencias, fotos_credencial, empresas, users, cotizaciones, public, metrics, seed, admin_ops, credenciales, contact, accounting

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(examenes.router, prefix="/api/examenes", tags=["examenes"])
app.include_router(cursos.router, prefix="/api/cursos", tags=["cursos"])
app.include_router(inscripciones.router, prefix="/api/inscripciones", tags=["inscripciones"])
app.include_router(credenciales.router, prefix="/api/credenciales", tags=["credenciales"])
app.include_router(evidencias.router, prefix="/api/evidencias", tags=["evidencias"])
app.include_router(fotos_credencial.router, prefix="/api/fotos-credencial", tags=["fotos-credencial"])
app.include_router(empresas.router, prefix="/api/empresas", tags=["empresas"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(cotizaciones.router, prefix="/api/cotizaciones", tags=["cotizaciones"])
app.include_router(public.router, prefix="/api/public", tags=["public"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["metrics"])
app.include_router(seed.router, prefix="/api/seed", tags=["seed"])
app.include_router(admin_ops.router, prefix="/api/admin", tags=["admin"])
app.include_router(accounting.router, prefix="/api/accounting", tags=["accounting"])
app.include_router(contact.router)


# Serve static files (credential PDFs, uploaded photos, etc.)
app.mount("/storage", StaticFiles(directory=settings.STORAGE_PATH), name="storage")



@app.get("/")
async def root():
    return {
        "message": "VMP - EDTECH API",
        "version": "0.1.0-beta",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}

