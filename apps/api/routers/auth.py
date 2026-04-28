from fastapi import APIRouter, HTTPException, status, Depends, Request
from schemas.models import UserLogin, UserRegister, TokenResponse, UserResponse
from auth.jwt import hash_password, verify_password, create_access_token
from core.database import prisma
from auth.dependencies import get_current_user
from middleware.security import rate_limit_login, rate_limit_forgot_password

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
            "empresaId": data.empresaId,
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

