from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime
from schemas.fotos_credencial import (
    FotoCredencialResponse,
    UploadFotoResponse,
    ListFotosResponse,
    EvaluarFotoRequest,
    EstadoFoto
)
from auth.dependencies import get_current_user
from core.database import prisma
from services.file_upload import save_credencial_photo, delete_credencial_photo

router = APIRouter()

@router.post("/upload", response_model=UploadFotoResponse)
async def upload_foto_credencial(
    file: UploadFile = File(...),
    alumnoId: str = Form(...),
    comentario: Optional[str] = Form(None),
    current_user=Depends(get_current_user)
):
    """
    Subir foto de credencial para un alumno
    Solo INSTRUCTOR y SUPER_ADMIN pueden subir fotos
    """
    
    # Verificar permisos
    if current_user.rol not in ["INSTRUCTOR", "SUPER_ADMIN"]:
        raise HTTPException(
            status_code=403,
            detail="Solo instructores pueden subir fotos de credencial"
        )
    
    # Verificar que el alumno existe
    alumno = await prisma.user.find_unique(where={"id": alumnoId})
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    
    # Verificar que el alumno es de la misma empresa (si es instructor)
    if current_user.rol == "INSTRUCTOR":
        if alumno.empresaId != current_user.empresaId:
            raise HTTPException(
                status_code=403,
                detail="Solo puedes subir fotos de alumnos de tu empresa"
            )
    
    # Verificar si ya existe una foto para este alumno
    existing_foto = await prisma.fotocredencial.find_unique(
        where={"alumnoId": alumnoId}
    )
    
    if existing_foto:
        # Si existe y está aprobada, no permitir reemplazo
        if existing_foto.estado == "APROBADA":
            raise HTTPException(
                status_code=400,
                detail="Este alumno ya tiene una foto aprobada. Elimínala primero si deseas cambiarla."
            )
        # Si está pendiente o rechazada, eliminar la anterior
        delete_credencial_photo(existing_foto.fotoUrl)
        await prisma.fotocredencial.delete(where={"id": existing_foto.id})
    
    # Guardar archivo
    try:
        foto_url = await save_credencial_photo(file)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar archivo: {str(e)}")
    
    # Crear registro de foto
    foto = await prisma.fotocredencial.create(
        data={
            "alumnoId": alumnoId,
            "fotoUrl": foto_url,
            "comentario": comentario,
            "estado": "PENDIENTE",
            "evaluadorId": current_user.id
        }
    )
    
    return UploadFotoResponse(
        success=True,
        foto=FotoCredencialResponse(
            id=foto.id,
            alumnoId=foto.alumnoId,
            fotoUrl=foto.fotoUrl,
            comentario=foto.comentario,
            estado=EstadoFoto(foto.estado),
            evaluadorId=foto.evaluadorId,
            uploadedAt=foto.uploadedAt.isoformat(),
            updatedAt=foto.updatedAt.isoformat() if foto.updatedAt else None
        ),
        message="Foto subida exitosamente"
    )


@router.get("/alumno/{alumnoId}", response_model=FotoCredencialResponse)
async def obtener_foto_alumno(
    alumnoId: str,
    current_user=Depends(get_current_user)
):
    """
    Obtener foto de credencial de un alumno específico
    Accesible por el alumno mismo, su instructor, o SUPER_ADMIN
    """
    
    # Verificar permisos
    if current_user.rol == "ALUMNO" and current_user.id != alumnoId:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    if current_user.rol == "INSTRUCTOR":
        alumno = await prisma.user.find_unique(where={"id": alumnoId})
        if not alumno or alumno.empresaId != current_user.empresaId:
            raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # Obtener foto
    foto = await prisma.fotocredencial.find_unique(
        where={"alumnoId": alumnoId},
        include={"alumno": {"include": {"empresa": True}}}
    )
    
    if not foto:
        raise HTTPException(status_code=404, detail="No se encontró foto para este alumno")
    
    return FotoCredencialResponse(
        id=foto.id,
        alumnoId=foto.alumnoId,
        fotoUrl=foto.fotoUrl,
        comentario=foto.comentario,
        estado=EstadoFoto(foto.estado),
        feedback=foto.feedback,
        evaluadorId=foto.evaluadorId,
        uploadedAt=foto.uploadedAt.isoformat(),
        updatedAt=foto.updatedAt.isoformat() if foto.updatedAt else None,
        alumnoNombre=foto.alumno.nombre,
        alumnoApellido=foto.alumno.apellido,
        alumnoDni=foto.alumno.dni,
        empresaNombre=foto.alumno.empresa.nombre if foto.alumno.empresa else None
    )


@router.delete("/{id}")
async def eliminar_foto(id: str, current_user=Depends(get_current_user)):
    """
    Eliminar una foto de credencial
    Solo instructor/admin puede eliminar
    Solo si está PENDIENTE o RECHAZADA
    """
    
    if current_user.rol not in ["INSTRUCTOR", "SUPER_ADMIN"]:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # Buscar foto
    foto = await prisma.fotocredencial.find_unique(
        where={"id": id},
        include={"alumno": True}
    )
    
    if not foto:
        raise HTTPException(status_code=404, detail="Foto no encontrada")
    
    # Verificar empresa si es instructor
    if current_user.rol == "INSTRUCTOR":
        if foto.alumno.empresaId != current_user.empresaId:
            raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # Solo permitir eliminar si está pendiente o rechazada
    if foto.estado == "APROBADA":
        raise HTTPException(
            status_code=400,
            detail="No puedes eliminar una foto que ya ha sido aprobada"
        )
    
    # Eliminar archivo físico
    delete_credencial_photo(foto.fotoUrl)
    
    # Eliminar registro
    await prisma.fotocredencial.delete(where={"id": id})
    
    return {"success": True, "message": "Foto eliminada exitosamente"}


# ============= ENDPOINTS INSTRUCTOR =============

@router.get("/pendientes", response_model=ListFotosResponse)
async def listar_fotos_pendientes(current_user=Depends(get_current_user)):
    """
    Listar fotos que requieren aprobación (Solo para INSTRUCTORES)
    """
    
    if current_user.rol not in ["INSTRUCTOR", "SUPER_ADMIN"]:
        raise HTTPException(status_code=403, detail="No tienes permisos de instructor")
    
    # Filtro: Solo mostrar alumnos de la misma empresa que el instructor
    where_clause = {"estado": "PENDIENTE"}
    if current_user.rol == "INSTRUCTOR" and current_user.empresaId:
        where_clause["alumno"] = {"empresaId": current_user.empresaId}
        
    fotos = await prisma.fotocredencial.find_many(
        where=where_clause,
        include={"alumno": {"include": {"empresa": True}}},
        order={"uploadedAt": "asc"}
    )
    
    fotos_response = [
        FotoCredencialResponse(
            id=f.id,
            alumnoId=f.alumnoId,
            fotoUrl=f.fotoUrl,
            comentario=f.comentario,
            estado=EstadoFoto(f.estado),
            feedback=f.feedback,
            evaluadorId=f.evaluadorId,
            uploadedAt=f.uploadedAt.isoformat(),
            updatedAt=f.updatedAt.isoformat() if f.updatedAt else None,
            alumnoNombre=f.alumno.nombre,
            alumnoApellido=f.alumno.apellido,
            alumnoDni=f.alumno.dni,
            empresaNombre=f.alumno.empresa.nombre if f.alumno.empresa else None
        )
        for f in fotos
    ]
    
    return ListFotosResponse(
        fotos=fotos_response,
        total=len(fotos_response)
    )


@router.get("/empresa/{empresaId}", response_model=ListFotosResponse)
async def listar_fotos_por_empresa(
    empresaId: str,
    estado: Optional[str] = None,
    current_user=Depends(get_current_user)
):
    """
    Listar fotos de alumnos de una empresa específica
    Permite filtrar por estado
    """
    
    if current_user.rol not in ["INSTRUCTOR", "SUPER_ADMIN"]:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # Verificar permisos de empresa
    if current_user.rol == "INSTRUCTOR" and current_user.empresaId != empresaId:
        raise HTTPException(status_code=403, detail="No tienes permisos para esta empresa")
    
    # Construir filtro
    where_clause = {"alumno": {"empresaId": empresaId}}
    if estado:
        where_clause["estado"] = estado
    
    fotos = await prisma.fotocredencial.find_many(
        where=where_clause,
        include={"alumno": {"include": {"empresa": True}}},
        order={"uploadedAt": "desc"}
    )
    
    fotos_response = [
        FotoCredencialResponse(
            id=f.id,
            alumnoId=f.alumnoId,
            fotoUrl=f.fotoUrl,
            comentario=f.comentario,
            estado=EstadoFoto(f.estado),
            feedback=f.feedback,
            evaluadorId=f.evaluadorId,
            uploadedAt=f.uploadedAt.isoformat(),
            updatedAt=f.updatedAt.isoformat() if f.updatedAt else None,
            alumnoNombre=f.alumno.nombre,
            alumnoApellido=f.alumno.apellido,
            alumnoDni=f.alumno.dni,
            empresaNombre=f.alumno.empresa.nombre if f.alumno.empresa else None
        )
        for f in fotos
    ]
    
    return ListFotosResponse(
        fotos=fotos_response,
        total=len(fotos_response)
    )


@router.put("/{id}/evaluar", response_model=FotoCredencialResponse)
async def evaluar_foto(
    id: str,
    data: EvaluarFotoRequest,
    current_user=Depends(get_current_user)
):
    """
    Aprobar o rechazar una foto de credencial (Solo para INSTRUCTORES)
    """
    
    if current_user.rol not in ["INSTRUCTOR", "SUPER_ADMIN"]:
        raise HTTPException(status_code=403, detail="No tienes permisos de instructor")
    
    # Buscar foto
    foto = await prisma.fotocredencial.find_unique(
        where={"id": id},
        include={"alumno": {"include": {"empresa": True}}}
    )
    
    if not foto:
        raise HTTPException(status_code=404, detail="Foto no encontrada")
    
    # Verificar empresa si es instructor
    if current_user.rol == "INSTRUCTOR":
        if foto.alumno.empresaId != current_user.empresaId:
            raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # Actualizar estado
    updated = await prisma.fotocredencial.update(
        where={"id": id},
        data={
            "estado": data.estado.value,
            "feedback": data.feedback,
            "evaluadorId": current_user.id
        },
        include={"alumno": {"include": {"empresa": True}}}
    )
    
    return FotoCredencialResponse(
        id=updated.id,
        alumnoId=updated.alumnoId,
        fotoUrl=updated.fotoUrl,
        comentario=updated.comentario,
        estado=EstadoFoto(updated.estado),
        feedback=updated.feedback,
        evaluadorId=updated.evaluadorId,
        uploadedAt=updated.uploadedAt.isoformat(),
        updatedAt=updated.updatedAt.isoformat() if updated.updatedAt else None,
        alumnoNombre=updated.alumno.nombre,
        alumnoApellido=updated.alumno.apellido,
        alumnoDni=updated.alumno.dni,
        empresaNombre=updated.alumno.empresa.nombre if updated.alumno.empresa else None
    )
