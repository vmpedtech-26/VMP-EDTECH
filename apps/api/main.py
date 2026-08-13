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
    title="VMP EdTech API",
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



from routers import auth, examenes, cursos, inscripciones, fotos_credencial, empresas, users, cotizaciones, public, metrics
from routers import capacitaciones, hr, administracion, banco_preguntas, plantillas, notificaciones, security_mgmt, admin_ops
from routers import sesiones
from routers import contact, audit, automation, obd2, compliance, b2b, fotos_validation
from routers import credenciales
from routers import accounting
from routers import evidencias

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
app.include_router(capacitaciones.router, prefix="/api/capacitaciones", tags=["capacitaciones"])
app.include_router(hr.router, prefix="/api/hr", tags=["hr"])
app.include_router(administracion.router, prefix="/api/administration", tags=["administration"])
app.include_router(banco_preguntas.router, prefix="/api/banco-preguntas", tags=["banco-preguntas"])
app.include_router(plantillas.router, prefix="/api/plantillas-evaluacion", tags=["plantillas"])
app.include_router(notificaciones.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(security_mgmt.router, prefix="/api/admin", tags=["security"])
app.include_router(admin_ops.router, prefix="/api/admin", tags=["admin-ops"])
app.include_router(sesiones.router, prefix="/api/sesiones", tags=["sesiones"])
app.include_router(contact.router, tags=["contact"])
app.include_router(audit.router, prefix="/api/admin", tags=["audit"])
app.include_router(automation.router, prefix="/api/automation", tags=["automation"])
app.include_router(obd2.router, prefix="/api", tags=["obd2"])
app.include_router(compliance.router, prefix="/api/compliance", tags=["compliance"])
app.include_router(b2b.router, prefix="/api/b2b", tags=["b2b"])
app.include_router(fotos_validation.router, prefix="/api/fotos-validation", tags=["fotos-validation"])
app.include_router(credenciales.router, prefix="/api/credenciales", tags=["credenciales"])
app.include_router(accounting.router, prefix="/api/accounting", tags=["accounting"])
app.include_router(evidencias.router, prefix="/api/evidencias", tags=["evidencias"])



@app.get("/")
async def root():
    return {
        "message": "VMP EdTech API",
        "version": "0.1.0-beta",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}

