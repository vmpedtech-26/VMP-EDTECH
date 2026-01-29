from pydantic import BaseModel, EmailStr
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

class UserAdminResponse(UserAdminBase):
    id: str
    createdAt: datetime
    
    class Config:
        from_attributes = True

class UserWithEmpresaResponse(UserAdminResponse):
    empresa_nombre: Optional[str] = None
