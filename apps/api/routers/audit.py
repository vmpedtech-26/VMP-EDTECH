from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from auth.dependencies import get_current_user
from core.database import prisma
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class AuditLogItem(BaseModel):
    id: str
    userId: Optional[str]
    userEmail: Optional[str]
    action: str
    details: Optional[str]
    ipAddress: Optional[str]
    requestId: Optional[str]
    createdAt: datetime

class AuditLogsResponse(BaseModel):
    logs: List[AuditLogItem]
    total: int
    limit: int
    offset: int

@router.get("/audit-logs", response_model=AuditLogsResponse)
async def list_audit_logs(
    action: Optional[str] = None,
    user_email: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user = Depends(get_current_user)
):
    """
    Recupera una lista paginada y filtrable de logs de auditoría inmutables.
    Solo accesible para usuarios con el rol SUPER_ADMIN.
    """
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Acceso restringido. Solo el Super Administrador puede visualizar los registros de auditoría."
        )

    # Construir cláusula de búsqueda
    where_clause = {}
    if action:
        where_clause["action"] = action
    if user_email:
        where_clause["userEmail"] = {"contains": user_email}

    # Obtener el total e ítems en paralelo
    total = await prisma.auditlog.count(where=where_clause)
    logs = await prisma.auditlog.find_many(
        where=where_clause,
        take=limit,
        skip=offset,
        order={"createdAt": "desc"}
    )

    return AuditLogsResponse(
        logs=[
            AuditLogItem(
                id=log.id,
                userId=log.userId,
                userEmail=log.userEmail,
                action=log.action,
                details=log.details,
                ipAddress=log.ipAddress,
                requestId=log.requestId,
                createdAt=log.createdAt
            )
            for log in logs
        ],
        total=total,
        limit=limit,
        offset=offset
    )
