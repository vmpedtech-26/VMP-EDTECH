from pydantic import BaseModel
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
    activo: bool
    
    class Config:
        from_attributes = True

class CreateCursoRequest(BaseModel):
    nombre: str
    descripcion: str
    codigo: str
    duracionHoras: int
    vigenciaMeses: Optional[int] = None
    empresaId: Optional[str] = None

class UpdateCursoRequest(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    codigo: Optional[str] = None
    duracionHoras: Optional[int] = None
    vigenciaMeses: Optional[int] = None
    activo: Optional[bool] = None

class ModuloSummary(BaseModel):
    """Resumen de módulo para detalle de curso"""
    id: str
    titulo: str
    orden: int
    tipo: str  # TEORIA, QUIZ, PRACTICA
    
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
    activo: bool
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
    tareasPracticas: Optional[List[TareaPracticaResponse]] = None  # Solo si tipo == PRACTICA
    
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
    tareasPracticas: Optional[List[TareaPracticaResponse]] = None
    
    class Config:
        from_attributes = True

# ============= GESTOR DE CONTENIDOS (REQUESTS) =============

class PreguntaCreate(BaseModel):
    pregunta: str
    opciones: List[str]
    respuestaCorrecta: int
    explicacion: Optional[str] = None

class TareaCreate(BaseModel):
    descripcion: str
    requiereFoto: bool = True

class CreateModuloRequest(BaseModel):
    titulo: str
    orden: int
    tipo: str  # TEORIA, QUIZ, PRACTICA
    contenidoHtml: Optional[str] = None
    videoUrl: Optional[str] = None
    # Solo si es QUIZ o PRACTICA
    preguntas: Optional[List[PreguntaCreate]] = None
    tareasPracticas: Optional[List[TareaCreate]] = None

class UpdateModuloRequest(BaseModel):
    titulo: Optional[str] = None
    orden: Optional[int] = None
    contenidoHtml: Optional[str] = None
    videoUrl: Optional[str] = None
    # Live class support
    liveClassUrl: Optional[str] = None
    # Optional sync for Quiz/Practica
    preguntas: Optional[List[PreguntaCreate]] = None
    tareasPracticas: Optional[List[TareaCreate]] = None

class UpdatePreguntaRequest(BaseModel):
    pregunta: Optional[str] = None
    opciones: Optional[List[str]] = None
    respuestaCorrecta: Optional[int] = None
    explicacion: Optional[str] = None

class UpdateTareaRequest(BaseModel):
    descripcion: Optional[str] = None
    requiereFoto: Optional[bool] = None
