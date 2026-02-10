from pydantic import BaseModel, EmailStr, validator
from core.security_utils import sanitize_data
from typing import Optional, List
from datetime import datetime

class UserAdminBase(BaseModel):
    email: EmailStr
    nombre: str
    apellido: str
    dni: str
    telefono: Optional[str] = None
    rol: str = "ALUMNO"
    empresaId: Optional[str] = None
    activo: bool = True

    @validator('nombre', 'apellido', 'dni', 'telefono', pre=True)
    def sanitize_text(cls, v):
        if isinstance(v, str):
            return sanitize_data(v)
        return v

class CreateUserRequest(UserAdminBase):
    password: str

class UpdateUserRequest(BaseModel):
    email: Optional[EmailStr] = None
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    dni: Optional[str] = None
    telefono: Optional[str] = None
    rol: Optional[str] = None
    empresaId: Optional[str] = None
    activo: Optional[bool] = None
    password: Optional[str] = None

    @validator('nombre', 'apellido', 'dni', 'telefono', pre=True)
    def sanitize_text(cls, v):
        if isinstance(v, str):
            return sanitize_data(v)
        return v

class UserAdminResponse(UserAdminBase):
    id: str
    createdAt: datetime
    
    class Config:
        from_attributes = True

class UserWithEmpresaResponse(UserAdminResponse):
    empresa_nombre: Optional[str] = None
