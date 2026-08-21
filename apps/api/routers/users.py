from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
from typing import List, Optional
from schemas.users import (
    UserAdminResponse, CreateUserRequest, UpdateUserRequest, UserWithEmpresaResponse,
    CargaMasivaRequest, CargaMasivaResponse
)
from auth.dependencies import get_current_user, require_admin
from core.database import prisma
from auth.jwt import hash_password
from services import storage_service

router = APIRouter()


@router.get("/me/signature")
async def obtener_mi_firma(current_user=Depends(require_admin)):
    """Consultar si el instructor/admin actual ya tiene una firma digitalizada cargada."""
    return {"exists": bool(current_user.firmaUrl), "url": current_user.firmaUrl}


@router.post("/me/signature")
async def subir_mi_firma(
    file: UploadFile = File(...),
    current_user=Depends(require_admin)
):
    """Subir (o reemplazar) la firma digitalizada del instructor/admin actual.

    Se estampa automáticamente en las credenciales PDF que emita este usuario.
    """
    if file.content_type != "image/png":
        raise HTTPException(status_code=400, detail="La firma debe ser una imagen PNG")

    data = await file.read()
    try:
        url = storage_service.upload_bytes(data, f"firmas/{current_user.id}.png", "image/png")
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    await prisma.user.update(where={"id": current_user.id}, data={"firmaUrl": url})

    return {"exists": True, "url": url}

@router.get("", response_model=List[UserWithEmpresaResponse])
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


def _verificar_acceso_alumno(current_user, alumno) -> None:
    """SUPER_ADMIN accede a cualquiera; INSTRUCTOR solo a alumnos de su empresa."""
    if current_user.rol == "SUPER_ADMIN":
        return
    if current_user.rol == "INSTRUCTOR" and alumno.empresaId == current_user.empresaId:
        return
    raise HTTPException(status_code=403, detail="No tienes permisos sobre este usuario")


@router.get("/{id}", response_model=UserWithEmpresaResponse)
async def obtener_usuario(id: str, current_user=Depends(get_current_user)):
    """Detalle de un usuario (Solo SUPER_ADMIN o INSTRUCTOR para su empresa)"""
    usuario = await prisma.user.find_unique(where={"id": id}, include={"empresa": True})
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    _verificar_acceso_alumno(current_user, usuario)

    user_dict = usuario.__dict__
    user_dict["empresa_nombre"] = usuario.empresa.nombre if usuario.empresa else None
    return user_dict


@router.get("/{id}/inscripciones")
async def listar_inscripciones_alumno(id: str, current_user=Depends(get_current_user)):
    """Cursos en los que está inscripto un alumno, con su progreso y cantidad de
    sesiones OBD2 registradas (Solo SUPER_ADMIN o INSTRUCTOR para su empresa)."""
    alumno = await prisma.user.find_unique(where={"id": id})
    if not alumno:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    _verificar_acceso_alumno(current_user, alumno)

    inscripciones = await prisma.inscripcion.find_many(
        where={"alumnoId": id},
        include={"curso": True, "obd2Sessions": True},
        order={"createdAt": "desc"}
    )

    return [
        {
            "id": i.id,
            "curso_id": i.cursoId,
            "curso_nombre": i.curso.nombre if i.curso else "",
            "progreso": i.progreso,
            "estado": i.estado,
            "obd2_sessions_count": len(i.obd2Sessions or []),
        }
        for i in inscripciones
    ]


@router.post("", response_model=UserAdminResponse)
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


@router.post("/masivo", response_model=CargaMasivaResponse)
async def crear_usuarios_masivo(data: CargaMasivaRequest, current_user=Depends(get_current_user)):
    """
    Carga masiva de alumnos (nómina subida por Excel/CSV o pegada a mano).
    SUPER_ADMIN puede cargar para cualquier empresa (indicando empresaId);
    INSTRUCTOR y EMPRESA solo pueden cargar alumnos de su propia empresa.
    """
    if current_user.rol == "SUPER_ADMIN":
        empresa_objetivo = data.empresaId
    elif current_user.rol in ["INSTRUCTOR", "EMPRESA"]:
        if not current_user.empresaId:
            raise HTTPException(status_code=400, detail="Tu usuario no está vinculado a ninguna empresa")
        empresa_objetivo = current_user.empresaId
    else:
        raise HTTPException(status_code=403, detail="No tienes permisos para cargar alumnos")

    if data.cursoId:
        curso = await prisma.curso.find_unique(where={"id": data.cursoId})
        if not curso:
            raise HTTPException(status_code=404, detail="El curso indicado no existe")

    creados = 0
    errores = []

    for alumno in data.alumnos:
        try:
            if await prisma.user.find_unique(where={"dni": alumno.dni}):
                errores.append({"dni": alumno.dni, "motivo": "El DNI ya está registrado"})
                continue

            email = alumno.email or f"{alumno.dni}@alumnos.vmp-edtech.com"
            if await prisma.user.find_unique(where={"email": email}):
                errores.append({"dni": alumno.dni, "motivo": "El email ya está registrado"})
                continue

            nuevo_usuario = await prisma.user.create(
                data={
                    "email": email,
                    "passwordHash": hash_password(alumno.dni),
                    "nombre": alumno.nombre,
                    "apellido": alumno.apellido,
                    "dni": alumno.dni,
                    "rol": "ALUMNO",
                    "empresaId": empresa_objetivo,
                }
            )

            if data.cursoId:
                await prisma.inscripcion.create(
                    data={"alumnoId": nuevo_usuario.id, "cursoId": data.cursoId}
                )

            creados += 1
        except Exception as e:
            errores.append({"dni": alumno.dni, "motivo": str(e)})

    return CargaMasivaResponse(creados=creados, errores=errores)


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
