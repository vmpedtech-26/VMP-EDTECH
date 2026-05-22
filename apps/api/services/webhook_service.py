"""
WebhookService — VMP-EDTECH Automation Engine
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Servicio centralizado de dispatch de eventos hacia n8n.
Características enterprise:
  - Firma HMAC-SHA256 en cada payload (seguridad)
  - Retry automático con backoff exponencial (resiliencia)
  - Dispatch asíncrono no-bloqueante (performance)
  - Logging estructurado de cada evento (observabilidad)
  - Circuit breaker básico (estabilidad)
"""

import asyncio
import hashlib
import hmac
import json
import logging
import time
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, Optional
from uuid import uuid4

import httpx

from core.config import settings

logger = logging.getLogger("vmp-api.webhooks")


# ─── Catálogo de Eventos ──────────────────────────────────────────────────────

class WebhookEvent(str, Enum):
    """
    Catálogo centralizado de todos los eventos del sistema.
    Usar siempre estas constantes — nunca strings sueltos.
    """
    # Leads / Cotizaciones
    LEAD_CREATED          = "lead.created"
    LEAD_UPDATED          = "lead.updated"
    LEAD_CONVERTED        = "lead.converted"

    # Empresas
    COMPANY_ONBOARDED     = "company.onboarded"

    # Alumnos
    STUDENT_ENROLLED      = "student.enrolled"
    STUDENT_COMPLETED     = "student.completed"

    # Credenciales
    CREDENTIAL_ISSUED     = "credential.issued"
    CREDENTIAL_REGENERATED = "credential.regenerated"

    # Contabilidad
    INVOICE_PROCESSED     = "invoice.processed"
    INVOICE_FAILED        = "invoice.failed"

    # Sistema
    SYSTEM_TEST           = "system.test"


# ─── Payload Builder ──────────────────────────────────────────────────────────

def build_payload(event: WebhookEvent, data: Dict[str, Any], source: str = "vmp-api") -> Dict[str, Any]:
    """
    Construye un payload estándar con metadatos de auditoría.
    Siempre incluye: id, event, timestamp, source y data.
    """
    return {
        "id":        str(uuid4()),
        "event":     event.value,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source":    source,
        "version":   "1.0",
        "data":      data,
    }


# ─── HMAC Signer ──────────────────────────────────────────────────────────────

def sign_payload(payload_bytes: bytes, secret: str) -> str:
    """
    Genera firma HMAC-SHA256 del payload.
    n8n verificará esta firma en el nodo Webhook para garantizar autenticidad.
    """
    return "sha256=" + hmac.new(
        key=secret.encode("utf-8"),
        msg=payload_bytes,
        digestmod=hashlib.sha256,
    ).hexdigest()


# ─── Circuit Breaker (simple) ─────────────────────────────────────────────────

class _CircuitBreaker:
    """
    Circuit breaker de 3 estados: CLOSED → OPEN → HALF_OPEN.
    Evita saturar n8n si está caído, sin detener la API principal.
    """
    THRESHOLD = 5           # fallos consecutivos para abrir
    RECOVERY_TIMEOUT = 60   # segundos antes de intentar medio-abrir

    def __init__(self) -> None:
        self._failures = 0
        self._opened_at: Optional[float] = None
        self._state = "CLOSED"

    @property
    def is_open(self) -> bool:
        if self._state == "OPEN":
            if time.monotonic() - (self._opened_at or 0) > self.RECOVERY_TIMEOUT:
                self._state = "HALF_OPEN"
                logger.info("🔌 Webhook circuit-breaker: HALF_OPEN — intentando recuperación")
                return False
            return True
        return False

    def record_success(self) -> None:
        self._failures = 0
        if self._state == "HALF_OPEN":
            self._state = "CLOSED"
            logger.info("✅ Webhook circuit-breaker: CLOSED — n8n recuperado")

    def record_failure(self) -> None:
        self._failures += 1
        if self._failures >= self.THRESHOLD:
            if self._state != "OPEN":
                self._state = "OPEN"
                self._opened_at = time.monotonic()
                logger.error(
                    f"🔴 Webhook circuit-breaker: OPEN — {self._failures} fallos consecutivos. "
                    f"Webhooks pausados por {self.RECOVERY_TIMEOUT}s"
                )


_breaker = _CircuitBreaker()


# ─── Core Dispatch ────────────────────────────────────────────────────────────

async def _dispatch_with_retry(
    url: str,
    payload: Dict[str, Any],
    secret: str,
    max_retries: int = 3,
) -> bool:
    """
    Envía el webhook con reintentos y backoff exponencial.
    Retorna True si el envío fue exitoso, False si falló todos los intentos.
    """
    payload_bytes = json.dumps(payload, ensure_ascii=False, default=str).encode("utf-8")
    signature = sign_payload(payload_bytes, secret)

    headers = {
        "Content-Type":       "application/json; charset=utf-8",
        "X-VMP-Signature":    signature,
        "X-VMP-Event":        payload["event"],
        "X-VMP-Delivery-ID":  payload["id"],
        "User-Agent":         "VMP-EDTECH-Webhook/1.0",
    }

    for attempt in range(1, max_retries + 1):
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(url, content=payload_bytes, headers=headers)
                response.raise_for_status()

            _breaker.record_success()
            logger.info(
                f"📤 Webhook dispatched | event={payload['event']} "
                f"id={payload['id']} status={response.status_code} attempt={attempt}"
            )
            return True

        except httpx.HTTPStatusError as exc:
            logger.warning(
                f"⚠️ Webhook HTTP error | event={payload['event']} "
                f"id={payload['id']} status={exc.response.status_code} attempt={attempt}/{max_retries}"
            )
        except httpx.RequestError as exc:
            logger.warning(
                f"⚠️ Webhook request error | event={payload['event']} "
                f"id={payload['id']} error={type(exc).__name__} attempt={attempt}/{max_retries}"
            )

        if attempt < max_retries:
            backoff = 2 ** attempt  # 2s, 4s, 8s
            logger.info(f"⏳ Retrying webhook in {backoff}s...")
            await asyncio.sleep(backoff)

    _breaker.record_failure()
    logger.error(
        f"❌ Webhook failed after {max_retries} attempts | event={payload['event']} id={payload['id']}"
    )
    return False


# ─── Public API ───────────────────────────────────────────────────────────────

async def emit(event: WebhookEvent, data: Dict[str, Any]) -> None:
    """
    Emite un evento de forma asíncrona y NO BLOQUEANTE.
    La API responde al usuario inmediatamente; el webhook se dispara en background.

    Uso:
        from services.webhook_service import emit, WebhookEvent
        await emit(WebhookEvent.LEAD_CREATED, {"id": lead.id, "empresa": lead.empresa})
    """
    n8n_url    = settings.N8N_WEBHOOK_URL
    n8n_secret = settings.N8N_WEBHOOK_SECRET

    # Si n8n no está configurado, loguear y saltar silenciosamente
    if not n8n_url:
        logger.debug(f"N8N_WEBHOOK_URL not set — skipping event: {event.value}")
        return

    # Si el circuit breaker está abierto, no enviar
    if _breaker.is_open:
        logger.warning(f"🔴 Circuit breaker OPEN — event dropped: {event.value}")
        return

    payload = build_payload(event, data)

    # Fire-and-forget: no bloquea la respuesta HTTP de la API
    asyncio.create_task(
        _dispatch_with_retry(n8n_url, payload, n8n_secret)
    )


async def emit_sync(event: WebhookEvent, data: Dict[str, Any]) -> bool:
    """
    Versión síncrona (bloqueante) para casos donde necesitamos confirmar el envío.
    Usar solo desde endpoints de administración o tests.
    """
    n8n_url    = settings.N8N_WEBHOOK_URL
    n8n_secret = settings.N8N_WEBHOOK_SECRET

    if not n8n_url:
        return False

    payload = build_payload(event, data)
    return await _dispatch_with_retry(n8n_url, payload, n8n_secret)
