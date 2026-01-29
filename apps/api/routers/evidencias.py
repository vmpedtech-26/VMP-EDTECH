from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime
from schemas.evidencias import (
    EvidenciaResponse,
    UploadEvidenciaResponse,
    ListEvidenciasResponse
)
from auth.dependencies import get_current_user
from core.database import prisma
from services.file_upload import save_evidence_photo, delete_evidence_photo

router = APIRouter()

@router.post("/upload", response_model=UploadEvidenciaResponse)
async def upload_evidencia(
    file: UploadFile = File(...),
    tareaId: str = Form(...),
    comentario: Optional[str] = Form(None),
    current_user=Depends(get_current_user)
):
    """Subir foto de evidencia para una tarea práctica"""
    
    # Verificar que la tarea existe
    tarea = await prisma.tareapractica.find_unique(where={"id": tareaId})
    if not tarea:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    
    # Verificar que el usuario tiene acceso a esta tarea
    # (verificar que está inscrito en el curso del módulo de la tarea)
    modulo = await prisma.modulo.find_unique(
        where={"id": tarea.moduloId},
        include={"curso": True}
    )
    
    if not modulo:
        raise HTTPException(status_code=404, detail="Módulo no encontrado")
    
    inscripcion = await prisma.inscripcion.find_first(
        where={
            "alumnoId": current_user.id,
            "cursoId": modulo.cursoId
        }
    )
    
    if not inscripcion:
        raise HTTPException(
            status_code=403,
            detail="No estás inscrito en el curso de esta tarea"
        )
    
    # Guardar archivo
    try:
        foto_url = await save_evidence_photo(file)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar archivo: {str(e)}")
    
    # Crear registro de evidencia
    evidencia = await prisma.evidencia.create(
        data={
            "tareaId": tareaId,
            "alumnoId": current_user.id,
            "fotoUrl": foto_url,
            "comentario": comentario,
            "uploadedAt": datetime.now()
        }
    )
    
    return UploadEvidenciaResponse(
        success=True,
        evidencia=EvidenciaResponse(
            id=evidencia.id,
            tareaId=evidencia.tareaId,
            alumnoId=evidencia.alumnoId,
            fotoUrl=evidencia.fotoUrl,
            comentario=evidencia.comentario,
            uploadedAt=evidencia.uploadedAt.isoformat()
        ),
        message="Evidencia subida exitosamente"
    )


@router.get("/tarea/{tareaId}", response_model=ListEvidenciasResponse)
async def obtener_evidencias_tarea(
    tareaId: str,
    current_user=Depends(get_current_user)
):
    """Obtener evidencias del usuario para una tarea específica"""
    
    # Verificar que la tarea existe
    tarea = await prisma.tareapractica.find_unique(where={"id": tareaId})
    if not tarea:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    
    # Obtener evidencias del usuario
    evidencias = await prisma.evidencia.find_many(
        where={
            "tareaId": tareaId,
            "alumnoId": current_user.id
        },
        order={"uploadedAt": "desc"}
    )
    
    evidencias_response = [
        EvidenciaResponse(
            id=e.id,
            tareaId=e.tareaId,
            alumnoId=e.alumnoId,
            fotoUrl=e.fotoUrl,
            comentario=e.comentario,
            uploadedAt=e.uploadedAt.isoformat()
        )
        for e in evidencias
    ]
    
    return ListEvidenciasResponse(
        evidencias=evidencias_response,
        total=len(evidencias_response)
    )


@router.delete("/{id}")
async def eliminar_evidencia(id: str, current_user=Depends(get_current_user)):
    """Eliminar una evidencia (solo propia)"""
    
    # Buscar evidencia
    evidencia = await prisma.evidencia.find_unique(where={"id": id})
    
    if not evidencia:
        raise HTTPException(status_code=404, detail="Evidencia no encontrada")
    
    # Verificar que es del usuario actual
    if evidencia.alumnoId != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="No tienes permiso para eliminar esta evidencia"
        )
    
    # Eliminar archivo físico
    delete_evidence_photo(evidencia.fotoUrl)
    
    # Eliminar registro
    await prisma.evidencia.delete(where={"id": id})
    
    return {"success": True, "message": "Evidencia eliminada exitosamente"}
