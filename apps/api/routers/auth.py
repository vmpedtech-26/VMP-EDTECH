from fastapi import APIRouter, HTTPException, status, Depends, Request
from schemas.models import UserLogin, UserRegister, TokenResponse, UserResponse
from auth.jwt import hash_password, verify_password, create_access_token
from core.database import prisma
from auth.dependencies import get_current_user
from middleware.security import rate_limit_login, rate_limit_forgot_password
from services.audit_service import log_audit_action

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister):
    """Registrar nuevo usuario"""

    # Verificar si email ya existe
    existing_user = await prisma.user.find_unique(where={"email": data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Verificar si DNI ya existe
    existing_dni = await prisma.user.find_unique(where={"dni": data.dni})
    if existing_dni:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="DNI already registered"
        )

    # Resolver empresaSlug (link de auto-registro /registro/{slug}) a un empresaId real
    empresa_id = data.empresaId
    if data.empresaSlug and not empresa_id:
        from routers.public import slugify
        slug_normalizado = data.empresaSlug.lower().strip()
        empresas = await prisma.company.find_many(where={"activa": True})
        empresa_match = next((e for e in empresas if slugify(e.nombre) == slug_normalizado), None)
        if not empresa_match:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="El enlace de registro no corresponde a ninguna empresa activa"
            )
        empresa_id = empresa_match.id

    # Hash password
    hashed_password = hash_password(data.password)

    # Crear usuario
    user = await prisma.user.create(
        data={
            "email": data.email,
            "passwordHash": hashed_password,
            "nombre": data.nombre,
            "apellido": data.apellido,
            "dni": data.dni,
            "telefono": data.telefono,
            "empresaId": empresa_id,
            "rol": "ALUMNO",  # Default role
        }
    )
    
    # Crear token
    access_token = create_access_token(data={"sub": user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "nombre": user.nombre,
            "apellido": user.apellido,
            "rol": user.rol,
        }
    }

@router.post("/login", response_model=TokenResponse)
@rate_limit_login()
async def login(request: Request, data: UserLogin):
    """Login de usuario"""

    
    # Buscar usuario por email
    user = await prisma.user.find_unique(where={"email": data.email})
    
    if not user or not verify_password(data.password, user.passwordHash):
        try:
            ip_address = request.client.host if request.client else "N/A"
            await log_audit_action(
                action="AUTH_FAILURE",
                user_id=user.id if user else None,
                user_email=data.email,
                # Mismo mensaje exista o no el usuario -- igual que la respuesta
                # HTTP unificada, no delatamos en el log cuál de los dos pasó.
                details="Intento de inicio de sesión con contraseña incorrecta",
                ip_address=ip_address,
            )
        except Exception as audit_err:
            print(f"⚠️ Error al registrar log de auditoria de login fallido: {audit_err}")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    if not user.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )
    
    # Crear token
    access_token = create_access_token(data={"sub": user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "nombre": user.nombre,
            "apellido": user.apellido,
            "dni": user.dni,
            "rol": user.rol,
            "empresaId": user.empresaId,
        }
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_user)):
    """Obtener información del usuario actual"""
    return current_user


# ============= PASSWORD RESET =============

from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
import uuid
import os

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/forgot-password")
@rate_limit_forgot_password()
async def forgot_password(request: Request, data: ForgotPasswordRequest):
    """
    Solicitar recuperación de contraseña.
    Genera un token y envía email con link de recuperación.
    """
    try:
        # Buscar usuario por email
        user = await prisma.user.find_unique(where={"email": data.email})
        
        if not user:
            # Por seguridad, no revelar si el email existe o no
            return {
                "message": "Si el email existe en nuestro sistema, recibirás un link de recuperación."
            }
        
        # Generar token único
        reset_token = str(uuid.uuid4())
        
        # Calcular expiración (1 hora desde ahora)
        expires_at = datetime.utcnow() + timedelta(hours=1)
        
        # Guardar token en base de datos
        await prisma.passwordresettoken.create(
            data={
                "token": reset_token,
                "userId": user.id,
                "expiresAt": expires_at,
                "used": False
            }
        )
        
        # Enviar email con link de recuperación
        try:
            from services.email_service import email_service
            
            # Construir URL de reset
            frontend_url = os.getenv("ADMIN_URL", "http://localhost:3000")
            reset_url = f"{frontend_url}/reset-password/{reset_token}"
            
            await email_service.send_reset_password(
                email=user.email,
                reset_token=reset_token,
                reset_url=reset_url
            )
        except Exception as email_error:
            # Log error pero no fallar la request
            print(f"Error sending reset email: {email_error}")
        
        return {
            "message": "Si el email existe en nuestro sistema, recibirás un link de recuperación."
        }
        
    except Exception as e:
        print(f"Error in forgot_password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al procesar la solicitud"
        )


@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest):
    """
    Restablecer contraseña usando token de recuperación.
    """
    try:
        # Buscar token en base de datos
        token_record = await prisma.passwordresettoken.find_unique(
            where={"token": data.token}
        )
        
        if not token_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token inválido o expirado"
            )
        
        # Verificar que no haya sido usado
        if token_record.used:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este link de recuperación ya fue utilizado"
            )
        
        # Verificar que no haya expirado
        if datetime.utcnow() > token_record.expiresAt:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este link de recuperación ha expirado. Solicita uno nuevo."
            )
        
        # Validar nueva contraseña
        if len(data.new_password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La contraseña debe tener al menos 6 caracteres"
            )
        
        # Hash nueva contraseña
        hashed_password = hash_password(data.new_password)
        
        # Actualizar contraseña del usuario
        await prisma.user.update(
            where={"id": token_record.userId},
            data={"passwordHash": hashed_password}
        )
        
        # Marcar token como usado
        await prisma.passwordresettoken.update(
            where={"token": data.token},
            data={"used": True}
        )
        
        return {
            "message": "Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in reset_password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al restablecer la contraseña"
        )

# ============= ORGANIZATIONS & CONTEXT (Blister-compatible) =============

import secrets
from typing import List

CONTEXT_MENU = [
    {"id": "cap-home", "label": "Inicio", "route": "/admin/capacitaciones", "icon": "home", "children": []},
    {"id": "cap-catalogo", "label": "Capacitaciones", "route": "/admin/capacitaciones/catalogo", "icon": "school", "children": []},
    {"id": "cap-clientes", "label": "Clientes", "route": "/admin/capacitaciones/clientes", "icon": "handshake", "children": []},
    {"id": "cap-historico", "label": "Histórico", "route": "/admin/capacitaciones/historico", "icon": "history", "children": []},
    {"id": "hr", "label": "Personal", "route": "/admin/hr/employees", "icon": "groups", "children": []},
    {"id": "params", "label": "Parámetros", "route": "/admin/parameters", "icon": "tune", "children": [
        {"id": "sectors", "label": "Sectores", "route": "/admin/administration/sectors", "icon": "account_tree", "children": []},
        {"id": "puestos", "label": "Puestos", "route": "/admin/administration/job-positions", "icon": "work", "children": []},
        {"id": "localidades", "label": "Localidades", "route": "/admin/administration/service-locations", "icon": "location_on", "children": []},
        {"id": "areas", "label": "Áreas operativas", "route": "/admin/administration/operational-areas", "icon": "map", "children": []},
        {"id": "banco", "label": "Banco de preguntas", "route": "/admin/capacitaciones/parametros/banco-preguntas", "icon": "quiz", "children": []},
        {"id": "plantillas", "label": "Plantillas evaluación", "route": "/admin/capacitaciones/parametros/plantillas-evaluacion", "icon": "assignment", "children": []},
    ]},
    {"id": "admin", "label": "Administración", "route": "/admin/administration", "icon": "shield", "children": [
        {"id": "users", "label": "Usuarios", "route": "/admin/users", "icon": "people", "children": []},
        {"id": "appearance", "label": "Apariencia", "route": "/admin/administration/appearance", "icon": "palette", "children": []},
    ]},
]

ROLE_PERMISSIONS = {
    "SUPER_ADMIN": ["atlas.admin.access", "atlas.capacitaciones.read", "atlas.capacitaciones.content.manage", "atlas.users.read", "atlas.users.create", "atlas.hr.employees.read", "atlas.hr.employees.manage", "atlas.customers.read", "atlas.customers.manage", "atlas.dashboard.view"],
    "INSTRUCTOR": ["atlas.capacitaciones.read", "atlas.capacitaciones.sessions.instruct", "atlas.hr.employees.read", "atlas.dashboard.view"],
    "ALUMNO": ["atlas.capacitaciones.learning.read", "atlas.capacitaciones.learning.enroll"],
}

@router.get("/organizations")
async def get_organizations(current_user=Depends(get_current_user)):
    """Lista de organizaciones del usuario (compatible Blister)"""
    return [{
        "id": "vmp-org-001",
        "code": "vmp-edtech",
        "name": "VMP - EDTECH",
        "brandTag": "VMP",
        "isDefault": True
    }]

@router.post("/context")
async def select_context(
    data: dict,
    current_user=Depends(get_current_user)
):
    """Seleccionar contexto organizacional y retornar permisos + menú (compatible Blister)"""
    # Generate context-scoped access token
    context_token = create_access_token(data={
        "sub": current_user.id,
        "org": "vmp-org-001",
        "rol": current_user.rol
    })
    refresh_token = secrets.token_urlsafe(48)
    
    permissions = ROLE_PERMISSIONS.get(current_user.rol, [])
    roles_map = {"SUPER_ADMIN": ["ORG_ADMIN", "TRAINING_MANAGER"], "INSTRUCTOR": ["TRAINING_MANAGER"], "ALUMNO": ["STUDENT"]}
    
    return {
        "accessToken": context_token,
        "refreshToken": refresh_token,
        "systemId": "vmp-system-001",
        "organizationId": "vmp-org-001",
        "organization": {"id": "vmp-org-001", "code": "vmp-edtech", "name": "VMP - EDTECH", "brandTag": "VMP", "tagline": "Capacitaciones Profesionales", "tema": "light"},
        "roles": roles_map.get(current_user.rol, []),
        "permissions": permissions,
        "menu": CONTEXT_MENU,
        "user": {"id": current_user.id, "displayName": f"{current_user.nombre} {current_user.apellido}", "email": current_user.email, "rol": current_user.rol}
    }
