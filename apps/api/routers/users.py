from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from schemas.users import UserAdminResponse, CreateUserRequest, UpdateUserRequest, UserWithEmpresaResponse
from auth.dependencies import get_current_user
from core.database import prisma
from auth.jwt import hash_password

router = APIRouter()

@router.get("/", response_model=List[UserWithEmpresaResponse])
async def listar_usuarios(
    rol: Optional[str] = None, 
    empresaId: Optional[str] = None,
    current_user=Depends(get_current_user)
):
    """Listar usuarios con filtros (Solo SUPER_ADMIN o INSTRUCTOR para su empresa)"""
    
    query = {}
    
    # Restricciones de rol
    if current_user.rol == "INSTRUCTOR":
        query["empresaId"] = current_user.empresaId
    elif current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # Filtros adicionales
    if rol:
        query["rol"] = rol
    if empresaId and current_user.rol == "SUPER_ADMIN":
        query["empresaId"] = empresaId
        
    usuarios = await prisma.user.find_many(
        where=query,
        include={"empresa": True},
        order={"createdAt": "desc"}
    )
    
    # Mapear para incluir nombre de empresa
    result = []
    for u in usuarios:
        user_dict = u.__dict__
        user_dict["empresa_nombre"] = u.empresa.nombre if u.empresa else None
        result.append(user_dict)
        
    return result


@router.post("/", response_model=UserAdminResponse)
async def crear_usuario(data: CreateUserRequest, current_user=Depends(get_current_user)):
    """Crear un nuevo usuario (Solo SUPER_ADMIN o INSTRUCTOR para su empresa)"""
    
    # Restricciones de rol
    if current_user.rol == "INSTRUCTOR":
        if data.rol != "ALUMNO" or data.empresaId != current_user.empresaId:
            raise HTTPException(status_code=403, detail="No puedes crear este tipo de usuario")
    elif current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
        
    # Verificar email y DNI únicos
    existing_email = await prisma.user.find_unique(where={"email": data.email})
    if existing_email:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
        
    existing_dni = await prisma.user.find_unique(where={"dni": data.dni})
    if existing_dni:
        raise HTTPException(status_code=400, detail="El DNI ya está registrado")
        
    user = await prisma.user.create(
        data={
            "email": data.email,
            "passwordHash": hash_password(data.password),
            "nombre": data.nombre,
            "apellido": data.apellido,
            "dni": data.dni,
            "telefono": data.telefono,
            "rol": data.rol,
            "empresaId": data.empresaId,
            "activo": data.activo
        }
    )
    
    return user


@router.put("/{id}", response_model=UserAdminResponse)
async def actualizar_usuario(id: str, data: UpdateUserRequest, current_user=Depends(get_current_user)):
    """Actualizar datos de un usuario (Solo SUPER_ADMIN o INSTRUCTOR para su empresa)"""
    
    existing = await prisma.user.find_unique(where={"id": id})
    if not existing:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    # Restricciones de rol
    if current_user.rol == "INSTRUCTOR":
        if existing.empresaId != current_user.empresaId:
            raise HTTPException(status_code=403, detail="No tienes permisos sobre este usuario")
        # No puede cambiar el rol ni la empresa
        if data.rol and data.rol != existing.rol:
            raise HTTPException(status_code=403, detail="No puedes cambiar el rol")
    elif current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
        
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    
    if "password" in update_data:
        update_data["passwordHash"] = hash_password(update_data.pop("password"))
        
    user = await prisma.user.update(
        where={"id": id},
        data=update_data
    )
    
    return user


@router.delete("/{id}")
async def eliminar_usuario(id: str, current_user=Depends(get_current_user)):
    """Desactivar o eliminar usuario (Solo SUPER_ADMIN o INSTRUCTOR para su empresa)"""
    
    existing = await prisma.user.find_unique(where={"id": id})
    if not existing:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    # Restricciones de rol
    if current_user.rol == "INSTRUCTOR":
        if existing.empresaId != current_user.empresaId:
            raise HTTPException(status_code=403, detail="No tienes permisos")
    elif current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
        
    # Verificar si tiene inscripciones
    inscripciones_count = await prisma.inscripcion.count(where={"alumnoId": id})
    
    if inscripciones_count > 0:
        # Desactivar
        await prisma.user.update(where={"id": id}, data={"activo": False})
        return {"message": "Usuario desactivado porque tiene inscripciones"}
        
    await prisma.user.delete(where={"id": id})
    return {"message": "Usuario eliminado exitosamente"}


# ============ Meet/Teams Link ============

from pydantic import BaseModel

class MeetLinkRequest(BaseModel):
    link: str


@router.get("/me/meet-link")
async def get_meet_link(current_user=Depends(get_current_user)):
    """Get the saved meeting link for the current instructor"""
    if current_user.rol not in ("INSTRUCTOR", "SUPER_ADMIN"):
        raise HTTPException(status_code=403, detail="Solo instructores pueden acceder a esta función")

    user = await prisma.user.find_unique(where={"id": current_user.id})
    return {"link": user.meetLink if user else None}


@router.put("/me/meet-link")
async def save_meet_link(data: MeetLinkRequest, current_user=Depends(get_current_user)):
    """Save a meeting link (Google Meet / Microsoft Teams) for the current instructor"""
    if current_user.rol not in ("INSTRUCTOR", "SUPER_ADMIN"):
        raise HTTPException(status_code=403, detail="Solo instructores pueden acceder a esta función")

    link = data.link.strip()
    if link and not link.startswith(("http://", "https://")):
        link = "https://" + link

    await prisma.user.update(
        where={"id": current_user.id},
        data={"meetLink": link or None}
    )

    return {"status": "ok", "link": link}
