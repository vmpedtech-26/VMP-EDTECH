from pydantic import BaseModel, EmailStr, validator
from core.security_utils import sanitize_data

# ============= AUTH SCHEMAS =============

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    nombre: str
    apellido: str
    dni: str
    telefono: str | None = None
    empresaId: str | None = None

    @validator('nombre', 'apellido', 'dni', 'telefono', pre=True)
    def sanitize_text(cls, v):
        if isinstance(v, str):
            return sanitize_data(v)
        return v

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

# ============= USER SCHEMAS =============

class UserResponse(BaseModel):
    id: str
    email: str
    nombre: str
    apellido: str
    dni: str
    rol: str
    empresaId: str | None = None
    avatar: str | None = None
    activo: bool

    class Config:
        from_attributes = True

# ============= CURSO SCHEMAS =============

class CursoResponse(BaseModel):
    id: str
    nombre: str
    descripcion: str
    codigo: str
    duracionHoras: int
    vigenciaMeses: int | None = None
    activo: bool

    class Config:
        from_attributes = True

# ============= INSCRIPCION SCHEMAS =============

class InscripcionResponse(BaseModel):
    id: str
    progreso: int
    estado: str
    curso: CursoResponse

    class Config:
        from_attributes = True

# ============= EXAMEN SCHEMAS =============

class SubmitExamenRequest(BaseModel):
    cursoId: str
    respuestas: dict  # { preguntaId: respuestaIndex }

class ExamenResponse(BaseModel):
    id: str
    calificacion: float | None = None
    aprobado: bool | None = None
    realizadoAt: str

    class Config:
        from_attributes = True

# ============= QUIZ SCHEMAS =============

class PreguntaFeedback(BaseModel):
    """Feedback individual por pregunta"""
    preguntaId: str
    correcta: bool
    respuestaElegida: int
    respuestaCorrecta: int
    explicacion: str | None = None

class EnviarQuizRequest(BaseModel):
    """Request para enviar quiz de un módulo"""
    cursoId: str
    moduloId: str
    respuestas: dict  # { preguntaId: respuestaIndex }

class QuizFeedbackResponse(BaseModel):
    """Respuesta con feedback del quiz"""
    calificacion: float
    aprobado: bool
    respuestasCorrectas: int
    totalPreguntas: int
    feedback: list[PreguntaFeedback]
    message: str

# ============= CREDENCIAL SCHEMAS =============

class GenerateCredencialRequest(BaseModel):
    alumnoId: str
    cursoId: str

class CredencialResponse(BaseModel):
    id: str
    numero: str
    pdfUrl: str
    qrCodeUrl: str
    fechaEmision: str
    fechaVencimiento: str | None = None
    curso: CursoResponse

    class Config:
        from_attributes = True
