from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class EmpresaBase(BaseModel):
    nombre: str
    cuit: str
    direccion: Optional[str] = ""
    telefono: Optional[str] = ""
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

    # SSO corporativo (Azure AD / Entra ID)
    ssoActive: Optional[bool] = None
    ssoDomain: Optional[str] = None
    ssoProvider: Optional[str] = None
    ssoClientId: Optional[str] = None
    ssoTenantId: Optional[str] = None
    # Secret en texto plano recibido del formulario -- se cifra antes de
    # guardar y nunca se devuelve. Si se omite o llega vacío, se conserva
    # el secret ya guardado (no se pisa).
    ssoClientSecret: Optional[str] = None

class EmpresaResponse(EmpresaBase):
    id: str
    createdAt: datetime

    ssoActive: bool = False
    ssoDomain: Optional[str] = None
    ssoProvider: Optional[str] = None
    ssoClientId: Optional[str] = None
    ssoTenantId: Optional[str] = None
    # No incluye ssoClientSecret: nunca se expone, ni cifrado.
    ssoClientSecretSet: Optional[bool] = None

    class Config:
        from_attributes = True
