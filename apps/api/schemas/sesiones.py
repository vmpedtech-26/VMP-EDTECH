from pydantic import BaseModel
from core.security_utils import SanitizedBaseModel
from typing import List, Optional
from datetime import datetime


# ============= SESION SCHEMAS =============

class CreateSesionRequest(SanitizedBaseModel):
    """Crear una nueva sesión de capacitación"""
    cursoId: str
    titulo: str
    descripcion: Optional[str] = None
    fechaInicio: datetime
    fechaFin: datetime
    lugar: Optional[str] = None
    plataforma: Optional[str] = None  # zoom, teams, meet, presencial
    meetLink: Optional[str] = None


class UpdateSesionRequest(SanitizedBaseModel):
    """Actualizar una sesión existente"""
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    fechaInicio: Optional[datetime] = None
    fechaFin: Optional[datetime] = None
    lugar: Optional[str] = None
    plataforma: Optional[str] = None
    meetLink: Optional[str] = None
    estado: Optional[str] = None  # PROGRAMADA, EN_CURSO, FINALIZADA, CANCELADA


class SesionListItem(BaseModel):
    """Sesión en listado"""
    id: str
    cursoId: str
    titulo: str
    descripcion: Optional[str] = None
    fechaInicio: datetime
    fechaFin: datetime
    lugar: Optional[str] = None
    plataforma: Optional[str] = None
    meetLink: Optional[str] = None
    estado: str
    createdAt: datetime
    # Info extra del curso (join)
    cursoNombre: Optional[str] = None
    cursoModalidad: Optional[str] = None
    totalAlumnos: Optional[int] = None
    alumnosPresentes: Optional[int] = None

    class Config:
        from_attributes = True


class AsistenciaItem(BaseModel):
    """Alumno en lista de asistencia"""
    alumnoId: str
    nombre: str
    apellido: str
    dni: str
    presente: bool
    checkIn: Optional[datetime] = None
    notas: Optional[str] = None

    class Config:
        from_attributes = True


class SesionDetail(BaseModel):
    """Detalle de sesión con lista de asistencia"""
    id: str
    cursoId: str
    titulo: str
    descripcion: Optional[str] = None
    fechaInicio: datetime
    fechaFin: datetime
    lugar: Optional[str] = None
    plataforma: Optional[str] = None
    meetLink: Optional[str] = None
    estado: str
    createdAt: datetime
    cursoNombre: Optional[str] = None
    cursoModalidad: Optional[str] = None
    asistencias: List[AsistenciaItem] = []

    class Config:
        from_attributes = True


class RegistrarAsistenciaRequest(BaseModel):
    """Registrar asistencia masiva de una sesión"""
    asistencias: List[dict]  # [{ alumnoId: str, presente: bool, notas?: str }]
