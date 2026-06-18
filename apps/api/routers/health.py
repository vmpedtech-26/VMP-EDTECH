"""
Enhanced health check endpoint with detailed system status.
"""
from fastapi import APIRouter, status
from core.database import prisma
import psutil
import os

router = APIRouter()


@router.get("/health")
async def health_check():
    """Basic health check"""
    return {"status": "ok"}


@router.get("/health/detailed")
async def detailed_health_check():
    """
    Detailed health check with system information.
    Useful for monitoring and debugging.
    """
    health_status = {
        "status": "ok",
        "checks": {}
    }
    
    # Database check
    try:
        await prisma.user.count()
        health_status["checks"]["database"] = {
            "status": "ok",
            "message": "Database connection successful"
        }
    except Exception as e:
        health_status["status"] = "degraded"
        health_status["checks"]["database"] = {
            "status": "error",
            "message": str(e)
        }
    
    # Disk space check
    try:
        disk = psutil.disk_usage('/')
        disk_percent = disk.percent
        health_status["checks"]["disk"] = {
            "status": "ok" if disk_percent < 90 else "warning",
            "usage_percent": disk_percent,
            "free_gb": round(disk.free / (1024**3), 2)
        }
    except Exception as e:
        health_status["checks"]["disk"] = {
            "status": "error",
            "message": str(e)
        }
    
    # Memory check
    try:
        memory = psutil.virtual_memory()
        memory_percent = memory.percent
        health_status["checks"]["memory"] = {
            "status": "ok" if memory_percent < 90 else "warning",
            "usage_percent": memory_percent,
            "available_gb": round(memory.available / (1024**3), 2)
        }
    except Exception as e:
        health_status["checks"]["memory"] = {
            "status": "error",
            "message": str(e)
        }
    
    return health_status


@router.get("/health/db-inspect")
async def db_inspect():
    """Temporary database catalog inspection endpoint"""
    try:
        tables = await prisma.query_raw("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        
        company_columns = await prisma.query_raw("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'companies';
        """)
        
        user_columns = await prisma.query_raw("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        """)
        
        return {
            "status": "success",
            "tables": [t["table_name"] for t in tables] if tables else [],
            "company_columns": {c["column_name"]: c["data_type"] for c in company_columns} if company_columns else {},
            "user_columns": {c["column_name"]: c["data_type"] for c in user_columns} if user_columns else {}
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

