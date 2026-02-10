from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

class EstadoFoto(str, Enum):
    PENDIENTE = "PENDIENTE"
    APROBADA = "APROBADA"
    RECHAZADA = "RECHAZADA"

class FotoCredencialResponse(BaseModel):
    id: str
    alumnoId: str
    fotoUrl: str
    comentario: Optional[str] = None
    estado: EstadoFoto
    feedback: Optional[str] = None
    evaluadorId: Optional[str] = None
    uploadedAt: str
    updatedAt: Optional[str] = None
    
    # Datos adicionales del alumno (opcional)
    alumnoNombre: Optional[str] = None
    alumnoApellido: Optional[str] = None
    alumnoDni: Optional[str] = None
    empresaNombre: Optional[str] = None

class UploadFotoResponse(BaseModel):
    success: bool
    foto: FotoCredencialResponse
    message: str

class ListFotosResponse(BaseModel):
    fotos: List[FotoCredencialResponse]
    total: int

class EvaluarFotoRequest(BaseModel):
    estado: EstadoFoto
    feedback: Optional[str] = None
