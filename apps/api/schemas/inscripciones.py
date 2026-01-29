from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# ============= INSCRIPCION SCHEMAS =============

class InscripcionDetailResponse(BaseModel):
    """Detalle de inscripción con progreso completo"""
    id: str
    progreso: int  # 0-100
    estado: str  # NO_INICIADO, EN_PROGRESO, COMPLETADO, APROBADO, REPROBADO
    inicioDate: Optional[str] = None
    finDate: Optional[str] = None
    cursoId: str
    alumnoId: str
    
    class Config:
        from_attributes = True

class MisCursosItem(BaseModel):
    """Item de curso con estado de inscripción"""
    id: str
    nombre: str
    descripcion: str
    codigo: str
    duracionHoras: int
    progreso: int
    estado: str
    proximaActividad: Optional[str] = None  # Calculado
    
    class Config:
        from_attributes = True

class MisCursosResponse(BaseModel):
    """Respuesta con cursos del usuario y estadísticas"""
    cursos: List[MisCursosItem]
    stats: dict  # { cursosActivos, cursosCompletados, horasAcumuladas }

class InscribirseRequest(BaseModel):
    """Request para inscribirse en un curso"""
    cursoId: str

class CompletarModuloRequest(BaseModel):
    """Request para marcar módulo como completado"""
    moduloId: str
    # Campos opcionales según tipo de módulo
    calificacionQuiz: Optional[float] = None
    aprobadoQuiz: Optional[bool] = None

class CompletarModuloResponse(BaseModel):
    """Respuesta al completar módulo"""
    success: bool
    nuevoProgreso: int
    cursoCompletado: bool
    credencialGenerada: bool
    credencialNumero: Optional[str] = None
    message: str
