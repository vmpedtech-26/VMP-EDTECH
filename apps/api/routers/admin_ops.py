from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
import psutil
import os
from typing import List
from auth.dependencies import get_current_user
from schemas.models import UserResponse
from services.backup_service import BackupService
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

@router.post("/backups/create", tags=["admin"])
async def create_backup(current_user: UserResponse = Depends(get_current_user)):
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        result = await BackupService.create_backup()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/backups", tags=["admin"])
async def list_backups(current_user: UserResponse = Depends(get_current_user)):
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return BackupService.list_backups()

@router.get("/backups/download/{filename}", tags=["admin"])
async def download_backup(filename: str, current_user: UserResponse = Depends(get_current_user)):
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    path = BackupService.get_backup_path(filename)
    if not path:
        raise HTTPException(status_code=404, detail="Backup file not found")
    
    return FileResponse(path, filename=filename, media_type='application/sql')

@router.delete("/backups/{filename}", tags=["admin"])
async def delete_backup(filename: str, current_user: UserResponse = Depends(get_current_user)):
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    success = BackupService.delete_backup(filename)
    if not success:
        raise HTTPException(status_code=404, detail="Backup file not found")
    
    return {"message": "Backup deleted successfully"}
