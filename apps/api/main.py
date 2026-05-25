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
from middleware.db_middleware import DatabaseConnectionMiddleware
from slowapi.errors import RateLimitExceeded
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from core.logger import setup_logging, logger

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
    version="0.1.0-beta"
)

# Rate limiter state
app.state.limiter = limiter

app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

from fastapi.exceptions import RequestValidationError
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_unhandled_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", "N/A")
    
    if isinstance(exc, HTTPException):
        logger.warning(
            f"HTTPException [{exc.status_code}]: {exc.detail}",
            extra={"extra_data": {"request_id": request_id, "status_code": exc.status_code, "path": request.url.path}}
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail, "request_id": request_id}
        )
        
    if isinstance(exc, RequestValidationError):
        logger.warning(
            f"RequestValidationError: {exc.errors()}",
            extra={"extra_data": {"request_id": request_id, "errors": exc.errors(), "path": request.url.path}}
        )
        return JSONResponse(
            status_code=422,
            content={"detail": "Error de validación en la solicitud.", "errors": exc.errors(), "request_id": request_id}
        )
    
    # Log tracebacks via corporate structured logging
    logger.error(
        f"Unhandled exception occurred on path {request.url.path}: {str(exc)}",
        exc_info=exc,
        extra={"extra_data": {"request_id": request_id, "path": request.url.path}}
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Ha ocurrido un error interno en el servidor. Por favor, contacte al soporte técnico.",
            "request_id": request_id
        }
    )

# Database & Security Middlewares
app.add_middleware(DatabaseConnectionMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestIDMiddleware)

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
    print("🚀 API STARTUP INITIATED (INSTANT MODE)")
    
    # 1. Ensure storage dirs
    _storage_path = settings.STORAGE_PATH
    try:
        os.makedirs(_storage_path, exist_ok=True)
        print(f"✅ Storage directory ready: {_storage_path}")
    except Exception as e:
        print(f"⚠️ Storage directory error: {e}")
    
    # 2. Database will connect lazily on the first request 
    # to avoid blocking the startup process and causing 502s
    print("ℹ️ Database connection deferred to first request (Lazy Mode)")
    
    print("✅ STARTUP COMPLETED")

@app.on_event("shutdown")
async def shutdown():
    print("🛑 API SHUTDOWN INITIATED")
    try:
        from core.database import disconnect_db
        await disconnect_db()
    except:
        pass



from routers import auth, examenes, cursos, inscripciones, evidencias, fotos_credencial, fotos_validation, empresas, users, cotizaciones, public, metrics, seed, admin_ops, credenciales, contact, accounting, b2b, automation, audit

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(examenes.router, prefix="/api/examenes", tags=["examenes"])
app.include_router(cursos.router, prefix="/api/cursos", tags=["cursos"])
app.include_router(inscripciones.router, prefix="/api/inscripciones", tags=["inscripciones"])
app.include_router(credenciales.router, prefix="/api/credenciales", tags=["credenciales"])
app.include_router(evidencias.router, prefix="/api/evidencias", tags=["evidencias"])
app.include_router(fotos_credencial.router, prefix="/api/fotos-credencial", tags=["fotos-credencial"])
app.include_router(fotos_validation.router, prefix="/api/fotos-credencial", tags=["fotos-credencial"])
app.include_router(empresas.router, prefix="/api/empresas", tags=["empresas"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(cotizaciones.router, prefix="/api/cotizaciones", tags=["cotizaciones"])
app.include_router(public.router, prefix="/api/public", tags=["public"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["metrics"])
app.include_router(seed.router, prefix="/api/seed", tags=["seed"])
app.include_router(admin_ops.router, prefix="/api/admin", tags=["admin"])
app.include_router(accounting.router, prefix="/api/accounting", tags=["accounting"])
app.include_router(b2b.router, prefix="/api/b2b", tags=["b2b"])
app.include_router(automation.router, prefix="/api/automation", tags=["automation"])
app.include_router(audit.router, prefix="/api/admin", tags=["admin"])
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

