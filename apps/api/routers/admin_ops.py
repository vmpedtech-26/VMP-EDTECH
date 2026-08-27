from fastapi import APIRouter, Depends, HTTPException, status
import psutil
import os
from typing import List
from auth.dependencies import get_current_user
from schemas.models import UserResponse
from core.database import prisma

router = APIRouter()

@router.get("/health", tags=["admin"])
async def get_system_health(current_user: UserResponse = Depends(get_current_user)):
    """
    Detailed system health for SUPER_ADMIN.
    """
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check DB
    db_status = "connected"
    try:
        await prisma.query_raw("SELECT 1")
    except Exception:
        db_status = "disconnected"

    # System metrics
    cpu_usage = psutil.cpu_percent()
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')

    return {
        "status": "online",
        "database": db_status,
        "cpu": f"{cpu_usage}%",
        "memory": {
            "total": f"{memory.total >> 20} MB",
            "used": f"{memory.used >> 20} MB",
            "percent": f"{memory.percent}%"
        },
        "disk": {
            "total": f"{disk.total >> 30} GB",
            "used": f"{disk.used >> 30} GB",
            "percent": f"{disk.percent}%"
        },
        "environment": os.getenv("ENVIRONMENT", "development")
    }
