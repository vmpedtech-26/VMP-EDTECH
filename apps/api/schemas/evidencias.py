from pydantic import BaseModel
from typing import Optional, List

from enum import Enum

# ============= EVIDENCIA SCHEMAS =============

class EstadoEvidencia(str, Enum):
    PENDIENTE = "PENDIENTE"
    APROBADA = "APROBADA"
    RECHAZADA = "RECHAZADA"

class EvidenciaResponse(BaseModel):
    """Evidencia de tarea práctica"""
    id: str
    tareaId: str
    alumnoId: str
    fotoUrl: str
    comentario: Optional[str] = None
    estado: EstadoEvidencia = EstadoEvidencia.PENDIENTE
    feedback: Optional[str] = None
    evaluadorId: Optional[str] = None
    uploadedAt: str
    
    class Config:
        from_attributes = True

class EvaluarEvidenciaRequest(BaseModel):
    """Solicitud para evaluar una evidencia"""
    estado: EstadoEvidencia
    feedback: Optional[str] = None

class UploadEvidenciaResponse(BaseModel):
    """Respuesta al subir evidencia"""
    success: bool
    evidencia: EvidenciaResponse
    message: str

class ListEvidenciasResponse(BaseModel):
    """Lista de evidencias para una tarea"""
    evidencias: List[EvidenciaResponse]
    total: int
