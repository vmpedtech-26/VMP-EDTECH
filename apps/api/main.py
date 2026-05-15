import os
from fastapi import FastAPI
from fastapi.responses import ORJSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from core.config import settings
from middleware.security import (
    SecurityHeadersMiddleware,
    RequestIDMiddleware,
    limiter,
    _rate_limit_exceeded_handler
)
from middleware.db_middleware import DatabaseConnectionMiddleware
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
    default_response_class=ORJSONResponse
)

# Rate limiter state
app.state.limiter = limiter

app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS (Keep this, it's essential)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    print("🚀 API STARTUP INITIATED")
    
    # 1. Ensure storage dirs
    _storage_path = settings.STORAGE_PATH
    os.makedirs(_storage_path, exist_ok=True)
    
    # 2. Connect DB immediately with timeout
    try:
        import asyncio
        from core.database import connect_db
        print("🔗 Connecting to Database...")
        await asyncio.wait_for(connect_db(), timeout=20.0)
        print("✅ Database connected successfully")
    except Exception as e:
        print(f"❌ Database connection FAILED: {e}")
        # We don't exit, let's see if /health works at least
    
    print("✅ STARTUP COMPLETED")

@app.on_event("shutdown")
async def shutdown():
    print("🛑 API SHUTDOWN INITIATED")
    try:
        from core.database import disconnect_db
        await disconnect_db()
    except:
        pass



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


# Serve static files with caching
# Ensure directory exists before mounting
_storage_path = settings.STORAGE_PATH
os.makedirs(_storage_path, exist_ok=True)

class CachedStaticFiles(StaticFiles):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def get_response(self, path: str, scope):
        response = await super().get_response(path, scope)
        # Cache for 30 days (PDFs and images don't change often)
        response.headers["Cache-Control"] = "public, max-age=2592000"
        return response

app.mount("/storage", CachedStaticFiles(directory=_storage_path), name="storage")



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

