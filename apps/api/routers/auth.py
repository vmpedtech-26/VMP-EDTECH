from fastapi import APIRouter, HTTPException, status, Depends
from schemas.models import UserLogin, UserRegister, TokenResponse, UserResponse
from auth.jwt import hash_password, verify_password, create_access_token
from core.database import prisma
from auth.dependencies import get_current_user

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
async def login(data: UserLogin):
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
