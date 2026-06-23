from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from auth.dependencies import get_current_user
from core.database import prisma
from pydantic import BaseModel
from datetime import datetime, timedelta

router = APIRouter()

class SecurityMetricItem(BaseModel):
    auth_success: int
    auth_failure: int
    access_denied: int
    rate_limit_exceeded: int
    sso_config_change: int
    total_events: int

class SecurityLogItem(BaseModel):
    id: str
    action: str
    details: Optional[str]
    userEmail: Optional[str]
    ipAddress: Optional[str]
    requestId: Optional[str]
    createdAt: datetime

class SecurityMetricsResponse(BaseModel):
    metrics: SecurityMetricItem
    recent_logs: List[SecurityLogItem]

@router.get("/security/metrics", response_model=SecurityMetricsResponse)
async def get_security_metrics(
    current_user = Depends(get_current_user)
):
    """
    Returns real-time security events metrics and a list of recent security incidents.
    Accessible only to SUPER_ADMIN.
    """
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Acceso restringido. Solo el Super Administrador puede visualizar los indicadores de seguridad."
        )

    # 1. Calculate time threshold (e.g. past 7 days)
    threshold = datetime.utcnow() - timedelta(days=7)

    # 2. Count actions
    auth_success = await prisma.auditlog.count(
        where={"action": "AUTH_SUCCESS", "createdAt": {"gte": threshold}}
    )
    auth_failure = await prisma.auditlog.count(
        where={"action": "AUTH_FAILURE", "createdAt": {"gte": threshold}}
    )
    access_denied = await prisma.auditlog.count(
        where={"action": "ACCESS_DENIED", "createdAt": {"gte": threshold}}
    )
    rate_limit_exceeded = await prisma.auditlog.count(
        where={"action": "RATE_LIMIT_EXCEEDED", "createdAt": {"gte": threshold}}
    )
    sso_config_change = await prisma.auditlog.count(
        where={"action": "SSO_CONFIG_CHANGE", "createdAt": {"gte": threshold}}
    )
    total_events = await prisma.auditlog.count(
        where={"createdAt": {"gte": threshold}}
    )

    # 3. Retrieve recent security logs
    logs = await prisma.auditlog.find_many(
        where={
            "action": {
                "in": ["AUTH_FAILURE", "ACCESS_DENIED", "RATE_LIMIT_EXCEEDED", "SSO_CONFIG_CHANGE", "USER_ROLE_CHANGE"]
            }
        },
        take=15,
        order={"createdAt": "desc"}
    )

    return SecurityMetricsResponse(
        metrics=SecurityMetricItem(
            auth_success=auth_success,
            auth_failure=auth_failure,
            access_denied=access_denied,
            rate_limit_exceeded=rate_limit_exceeded,
            sso_config_change=sso_config_change,
            total_events=total_events
        ),
        recent_logs=[
            SecurityLogItem(
                id=log.id,
                action=log.action,
                details=log.details,
                userEmail=log.userEmail,
                ipAddress=log.ipAddress,
                requestId=log.requestId,
                createdAt=log.createdAt
            )
            for log in logs
        ]
    )
