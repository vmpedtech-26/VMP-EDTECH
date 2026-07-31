"""
Automation Router — VMP-EDTECH / n8n Bridge
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Endpoints diseñados específicamente para interactuar con n8n:

  POST /api/automation/invoice-email  — n8n envía un PDF de factura recibido por email
  POST /api/automation/test-webhook   — dispara un evento de prueba para verificar la integración
  GET  /api/automation/health         — healthcheck del canal de automatización
  GET  /api/automation/events/catalog — catálogo de todos los eventos disponibles
"""

import base64
import hashlib
import hmac
import logging
import tempfile
import os
from datetime import datetime
from typing import Optional, Any

from fastapi import APIRouter, Depends, HTTPException, Header, Request, status
from pydantic import BaseModel

from auth.dependencies import get_current_user
from core.config import settings
from core.database import prisma
from services.webhook_service import WebhookEvent, emit_sync

logger = logging.getLogger("vmp-api.automation")
router = APIRouter()


# ─── Schemas ─────────────────────────────────────────────────────────────────

class InvoiceEmailRequest(BaseModel):
    """
    Payload que envía n8n cuando recibe un email con factura adjunta.
    El PDF viene en base64 para evitar problemas con multipart en n8n.
    """
    pdf_base64: str             # PDF de la factura en base64
    filename: str               # Nombre original del archivo
    sender_email: Optional[str] = None   # Email del remitente (proveedor)
    received_at: Optional[str] = None   # ISO timestamp de recepción
    subject: Optional[str] = None       # Asunto del email


class TestWebhookRequest(BaseModel):
    event: str = "system.test"
    data: dict[str, Any] = {}


# ─── HMAC Verification ───────────────────────────────────────────────────────

def _verify_n8n_signature(body: bytes, signature_header: Optional[str]) -> bool:
    """
    Verifica que el request viene de n8n firmado correctamente.
    Usado para proteger endpoints que n8n llama hacia la API.
    """
    secret = settings.N8N_WEBHOOK_SECRET
    if not secret or not signature_header:
        return False
    expected = "sha256=" + hmac.new(
        key=secret.encode("utf-8"),
        msg=body,
        digestmod=hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature_header)


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.get("/health")
async def automation_health():
    """
    Healthcheck del canal de automatización.
    Verifica si n8n está configurado y accesible.
    """
    n8n_configured = bool(settings.N8N_WEBHOOK_URL)
    return {
        "status":           "ok",
        "n8n_configured":   n8n_configured,
        "n8n_url":          settings.N8N_WEBHOOK_URL if n8n_configured else None,
        "events_available": [e.value for e in WebhookEvent],
        "timestamp":        datetime.utcnow().isoformat(),
    }


@router.get("/events/catalog")
async def events_catalog(current_user=Depends(get_current_user)):
    """Catálogo completo de eventos disponibles en el sistema."""
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")

    catalog = {
        "lead.created":           "Nueva cotización B2B recibida",
        "lead.converted":         "Cotización convertida a cliente activo",
        "company.onboarded":      "Nueva empresa incorporada con sus alumnos",
        "student.enrolled":       "Alumno inscripto en un curso",
        "student.completed":      "Alumno completó un curso",
        "credential.issued":      "Credencial de curso emitida",
        "credential.regenerated": "Credencial regenerada por admin",
        "invoice.processed":      "Factura de compra procesada por IA",
        "invoice.failed":         "Fallo al procesar una factura",
        "system.test":            "Evento de prueba de integración",
    }
    return {"events": catalog, "total": len(catalog)}


@router.post("/test-webhook", status_code=202)
async def test_webhook(
    payload: TestWebhookRequest,
    current_user=Depends(get_current_user),
):
    """
    Dispara un evento de prueba hacia n8n.
    Útil para verificar que la integración funcione end-to-end.
    Solo accesible por SUPER_ADMIN.
    """
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")

    if not settings.N8N_WEBHOOK_URL:
        raise HTTPException(
            status_code=503,
            detail="n8n no está configurado. Agrega N8N_WEBHOOK_URL en las variables de entorno."
        )

    test_data = {
        "triggered_by": current_user.email,
        "message": "🤖 Integración VMP-EDTECH ↔ n8n funcionando correctamente",
        **payload.data,
    }

    success = await emit_sync(WebhookEvent.SYSTEM_TEST, test_data)

    if not success:
        raise HTTPException(
            status_code=502,
            detail="El webhook llegó a n8n pero retornó un error. Verifica el workflow en n8n."
        )

    return {
        "status": "dispatched",
        "event":  WebhookEvent.SYSTEM_TEST.value,
        "n8n_url": settings.N8N_WEBHOOK_URL,
        "message": "✅ Evento enviado exitosamente a n8n",
    }


@router.post("/invoice-email", status_code=200)
async def process_invoice_from_email(
    request: Request,
    payload: InvoiceEmailRequest,
    x_vmp_signature: Optional[str] = Header(None),
):
    """
    Endpoint llamado por n8n cuando recibe un email con una factura adjunta.
    
    Flujo:
      Gmail → n8n → POST /api/automation/invoice-email → Gemini AI → DB (Compra)
    
    Seguridad: verifica firma HMAC antes de procesar.
    """
    # Verificar firma HMAC (n8n firma cada request hacia la API)
    body = await request.body()
    if not _verify_n8n_signature(body, x_vmp_signature):
        logger.warning(f"❌ Invoice email request with invalid signature from {request.client}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firma inválida. El request no proviene de n8n autorizado."
        )

    # Decodificar PDF desde base64
    try:
        pdf_bytes = base64.b64decode(payload.pdf_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="El campo pdf_base64 contiene datos inválidos")

    if len(pdf_bytes) < 100:
        raise HTTPException(status_code=400, detail="El PDF parece estar vacío o corrupto")

    # Procesar con el mismo pipeline de Gemini que ya existe en accounting.py
    try:
        from routers.accounting import _extract_invoice_data_with_ai

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(pdf_bytes)
            tmp_path = tmp.name

        try:
            extracted = await _extract_invoice_data_with_ai(tmp_path)
        finally:
            os.unlink(tmp_path)

        # Enriquecer con metadatos del email si el AI no los extrajo
        if payload.sender_email and not extracted.get("proveedor"):
            extracted["proveedor"] = payload.sender_email

        logger.info(f"✅ Invoice from email processed | proveedor={extracted.get('proveedor')} total={extracted.get('total')}")

        return {
            "status":  "processed",
            "source":  "email",
            "subject": payload.subject,
            "extracted": extracted,
            "message": "Factura procesada correctamente. Revisa el Dashboard de Contabilidad.",
        }

    except AttributeError:
        # Si _extract_invoice_data_with_ai no está expuesta aún, usar fallback
        logger.warning("_extract_invoice_data_with_ai not exported yet — returning raw PDF info")
        return {
            "status":   "received",
            "source":   "email",
            "filename": payload.filename,
            "size_kb":  round(len(pdf_bytes) / 1024, 1),
            "message":  "PDF recibido. Procesamiento manual requerido.",
        }
    except Exception as e:
        logger.error(f"❌ Error processing invoice from email: {e}")
        raise HTTPException(status_code=500, detail=f"Error al procesar la factura: {str(e)}")
