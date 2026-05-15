"""
Router dedicado a la gestión de credenciales.
Generación manual por instructores y listados.
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime
from auth.dependencies import get_current_user
from core.database import prisma
from services.credential_service import generate_credential_for_student
from pydantic import BaseModel


router = APIRouter()




# ============= SCHEMAS =============


class GenerarCredencialManualRequest(BaseModel):
    alumnoId: str
    cursoId: str




class CredencialListItem(BaseModel):
    id: str
    numero: str
    pdfUrl: str
    qrCodeUrl: str
    fechaEmision: str
    fechaVencimiento: Optional[str] = None
    alumnoNombre: str
    alumnoApellido: str
    alumnoDni: str
    cursoNombre: str
    cursoCodigo: str
    empresaNombre: Optional[str] = None

