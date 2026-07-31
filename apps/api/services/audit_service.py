from typing import Optional
from core.database import prisma
from core.logger import logger
import json

async def log_audit_action(
    action: str,
    user_id: Optional[str] = None,
    user_email: Optional[str] = None,
    details: Optional[str] = None,
    ip_address: Optional[str] = None,
    request_id: Optional[str] = None
) -> bool:
    """
    Registra un evento de auditoría inmutable en la base de datos.
    Este proceso es tolerante a fallos para asegurar que fallos en la auditoría
    no interrumpan las operaciones del negocio, registrando cualquier error en el logger corporativo.
    """
    try:
        await prisma.auditlog.create(
            data={
                "userId": user_id,
                "userEmail": user_email,
                "action": action,
                "details": details,
                "ipAddress": ip_address,
                "requestId": request_id
            }
        )
        
        # Log estructurado en servidor para agregación
        logger.info(
            f"AUDIT_LOG [{action}]: Usuario={user_email or 'N/A'}, RequestID={request_id or 'N/A'}",
            extra={
                "extra_data": {
                    "action": action,
                    "user_id": user_id,
                    "user_email": user_email,
                    "ip_address": ip_address,
                    "request_id": request_id,
                    "details": details
                }
            }
        )
        return True
    except Exception as e:
        logger.error(
            f"Fallo crítico al guardar log de auditoría inmutable para acción '{action}': {str(e)}",
            exc_info=e,
            extra={
                "extra_data": {
                    "action": action,
                    "user_id": user_id,
                    "user_email": user_email,
                    "request_id": request_id
                }
            }
        )
        return False
