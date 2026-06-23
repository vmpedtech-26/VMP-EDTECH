from pydantic import BaseModel
from core.security_utils import SanitizedBaseModel
from typing import List, Optional

# ============= CURSO SCHEMAS =============

class CursoListItem(BaseModel):
    """Curso en listado con información resumida"""
    id: str
    nombre: str
    descripcion: str
    codigo: str
    duracionHoras: int
    vigenciaMeses: Optional[int] = None
    empresaId: Optional[str] = None
    alumnosEsperados: int = 0
    # Mejora #3: modalidad
    modalidad: Optional[str] = "ONLINE"
    # Mejora #4: instructor asignado
    instructorId: Optional[str] = None
    instructorNombre: Optional[str] = None
    activo: bool
    meetingLink: Optional[str] = None
    meetingPlatform: Optional[str] = None
    
    class Config:
        from_attributes = True

class CreateCursoRequest(SanitizedBaseModel):
    nombre: str
    descripcion: str
    codigo: str
    duracionHoras: int
    vigenciaMeses: Optional[int] = None
    empresaId: Optional[str] = None
    alumnosEsperados: int = 0
    # Mejora #3: modalidad de capacitación
    modalidad: Optional[str] = "ONLINE"
    # Mejora #4: instructor asignado
    instructorId: Optional[str] = None
    meetingLink: Optional[str] = None
    meetingPlatform: Optional[str] = None

class UpdateCursoRequest(SanitizedBaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    codigo: Optional[str] = None
    duracionHoras: Optional[int] = None
    vigenciaMeses: Optional[int] = None
    empresaId: Optional[str] = None
    alumnosEsperados: Optional[int] = None
    activo: Optional[bool] = None
    # Mejora #3 y #4: modalidad e instructor
    modalidad: Optional[str] = None
    instructorId: Optional[str] = None
    meetingLink: Optional[str] = None
    meetingPlatform: Optional[str] = None

class ModuloSummary(BaseModel):
    """Resumen de módulo para detalle de curso"""
    id: str
    titulo: str
    orden: int
    tipo: str  # TEORIA, QUIZ, PRACTICA
    liveClassUrl: Optional[str] = None
    liveClassPlatform: Optional[str] = None
    
    class Config:
        from_attributes = True

class CursoDetail(BaseModel):
    """Detalle completo de curso con módulos"""
    id: str
    nombre: str
    descripcion: str
    codigo: str
    duracionHoras: int
    vigenciaMeses: Optional[int] = None
    empresaId: Optional[str] = None
    alumnosEsperados: int = 0
    activo: bool
    # Mejora #3 y #4
    modalidad: Optional[str] = "ONLINE"
    instructorId: Optional[str] = None
    instructorNombre: Optional[str] = None
    meetingLink: Optional[str] = None
    meetingPlatform: Optional[str] = None
    modulos: List[ModuloSummary]
    
    class Config:
        from_attributes = True

# ============= MODULO SCHEMAS =============

class PreguntaResponse(BaseModel):
    """Pregunta para estudiante (sin respuesta correcta)"""
    id: str
    pregunta: str
    opciones: List[str]
    # No incluir respuestaCorrecta para estudiantes
    
    class Config:
        from_attributes = True

class PreguntaDetailAdmin(BaseModel):
    """Pregunta completa con respuesta (solo admin)"""
    id: str
    pregunta: str
    opciones: List[str]
    respuestaCorrecta: int
    explicacion: Optional[str] = None
    
    class Config:
        from_attributes = True

class TareaPracticaResponse(BaseModel):
    """Tarea práctica con información de requerimientos"""
    id: str
    descripcion: str
    requiereFoto: bool
    
    class Config:
        from_attributes = True

class ModuloDetail(BaseModel):
    """Detalle completo de módulo con contenido"""
    id: str
    titulo: str
    orden: int
    tipo: str
    contenidoHtml: Optional[str] = None
    videoUrl: Optional[str] = None
    # Live class support
    liveClassUrl: Optional[str] = None
    liveClassDate: Optional[str] = None
    liveClassPlatform: Optional[str] = None
    preguntas: Optional[List[PreguntaResponse]] = None  # Solo si tipo == QUIZ
    
    class Config:
        from_attributes = True

class ModuloDetailAdmin(BaseModel):
    """Detalle completo de módulo con respuestas (solo admin)"""
    id: str
    titulo: str
    orden: int
    tipo: str
    contenidoHtml: Optional[str] = None
    videoUrl: Optional[str] = None
    preguntas: Optional[List[PreguntaDetailAdmin]] = None
    
    class Config:
        from_attributes = True

# ============= GESTOR DE CONTENIDOS (REQUESTS) =============

class PreguntaCreate(SanitizedBaseModel):
    pregunta: str
    opciones: List[str]
    respuestaCorrecta: int
    explicacion: Optional[str] = None

class TareaCreate(SanitizedBaseModel):
    descripcion: str
    requiereFoto: bool = True

class CreateModuloRequest(SanitizedBaseModel):
    titulo: str
    orden: int
    tipo: str  # TEORIA, QUIZ, PRACTICA
    contenidoHtml: Optional[str] = None
    videoUrl: Optional[str] = None
    # Live class support
    liveClassUrl: Optional[str] = None
    liveClassPlatform: Optional[str] = None
    # Solo si es QUIZ
    preguntas: Optional[List[PreguntaCreate]] = None

class UpdateModuloRequest(SanitizedBaseModel):
    titulo: Optional[str] = None
    orden: Optional[int] = None
    contenidoHtml: Optional[str] = None
    videoUrl: Optional[str] = None
    # Live class support
    liveClassUrl: Optional[str] = None
    liveClassPlatform: Optional[str] = None
    # Optional sync for Quiz
    preguntas: Optional[List[PreguntaCreate]] = None

class UpdatePreguntaRequest(SanitizedBaseModel):
    pregunta: Optional[str] = None
    opciones: Optional[List[str]] = None
    respuestaCorrecta: Optional[int] = None
    explicacion: Optional[str] = None

class UpdateTareaRequest(SanitizedBaseModel):
    descripcion: Optional[str] = None
    requiereFoto: Optional[bool] = None
