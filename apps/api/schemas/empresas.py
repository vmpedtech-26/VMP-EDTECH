from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class EmpresaBase(BaseModel):
    nombre: str
    cuit: str
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    email: EmailStr
    activa: bool = True

class CreateEmpresaRequest(EmpresaBase):
    pass

class UpdateEmpresaRequest(BaseModel):
    nombre: Optional[str] = None
    cuit: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    activa: Optional[bool] = None

class EmpresaResponse(EmpresaBase):
    id: str
    createdAt: datetime
    
    class Config:
        from_attributes = True
