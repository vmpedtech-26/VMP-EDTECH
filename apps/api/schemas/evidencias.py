from pydantic import BaseModel
from typing import Optional, List

# ============= EVIDENCIA SCHEMAS =============

class EvidenciaResponse(BaseModel):
    """Evidencia de tarea práctica"""
    id: str
    tareaId: str
    alumnoId: str
    fotoUrl: str
    comentario: Optional[str] = None
    uploadedAt: str
    
    class Config:
        from_attributes = True

class UploadEvidenciaResponse(BaseModel):
    """Respuesta al subir evidencia"""
    success: bool
    evidencia: EvidenciaResponse
    message: str

class ListEvidenciasResponse(BaseModel):
    """Lista de evidencias para una tarea"""
    evidencias: List[EvidenciaResponse]
    total: int
