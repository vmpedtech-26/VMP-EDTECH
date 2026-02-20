"""
Router dedicado a la gestión de credenciales.
Generación manual por instructores y listados.
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from datetime import datetime
from auth.dependencies import get_current_user
from core.database import prisma
from services.credential_service import generate_credential_for_student
from services.batch_service import generate_batch_pdf_for_course
from pydantic import BaseModel

router = APIRouter()


# ============= SCHEMAS =============

class GenerarCredencialManualRequest(BaseModel):
    alumnoId: str
    cursoId: str


class CredencialListItem(BaseModel):
    id: str
    numero: str
    pdfUrl: str
    qrCodeUrl: str
    fechaEmision: str
    fechaVencimiento: Optional[str] = None
    alumnoNombre: str
    alumnoApellido: str
    alumnoDni: str
    cursoNombre: str
    cursoCodigo: str
    empresaNombre: Optional[str] = None


# ============= ENDPOINTS =============

@router.get("/mis-credenciales")
async def mis_credenciales(current_user=Depends(get_current_user)):
    """Obtener credenciales del usuario actual (ALUMNO)"""
    credenciales = await prisma.credencial.find_many(
        where={"alumnoId": current_user.id},
        include={"curso": True},
        order={"createdAt": "desc"}
    )

    return [
        {
            "id": c.id,
            "numero": c.numero,
            "pdfUrl": c.pdfUrl,
            "qrCodeUrl": c.qrCodeUrl,
            "fechaEmision": c.fechaEmision.isoformat(),
            "fechaVencimiento": c.fechaVencimiento.isoformat() if c.fechaVencimiento else None,
            "curso": {
                "id": c.curso.id,
                "nombre": c.curso.nombre,
                "descripcion": c.curso.descripcion,
                "codigo": c.curso.codigo,
                "duracionHoras": c.curso.duracionHoras,
                "vigenciaMeses": c.curso.vigenciaMeses,
                "activo": c.curso.activo
            }
        }
        for c in credenciales
    ]


@router.post("/generar")
async def generar_credencial_manual(
    data: GenerarCredencialManualRequest,
    current_user=Depends(get_current_user)
):
    """
    Generar credencial manualmente.
    Solo INSTRUCTOR y SUPER_ADMIN pueden usar este endpoint.
    Útil para credenciales pre-curso.
    """
    if current_user.rol not in ["INSTRUCTOR", "SUPER_ADMIN"]:
        raise HTTPException(status_code=403, detail="No autorizado")

    # Si es instructor, verificar que el alumno pertenece a su empresa
    if current_user.rol == "INSTRUCTOR":
        alumno = await prisma.user.find_unique(where={"id": data.alumnoId})
        if not alumno:
            raise HTTPException(status_code=404, detail="Alumno no encontrado")
        if alumno.empresaId != current_user.empresaId:
            raise HTTPException(
                status_code=403,
                detail="Solo puedes generar credenciales para alumnos de tu empresa"
            )

    try:
        result = await generate_credential_for_student(
            alumno_id=data.alumnoId,
            curso_id=data.cursoId,
            emisor_id=current_user.id,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if result.get("already_existed"):
        return {
            "message": "La credencial ya existe para este alumno y curso",
            "pdfUrl": result["pdfUrl"],
            "credencial": _serialize_credencial(result["credencial"])
        }

    return {
        "message": "Credencial generada exitosamente",
        "pdfUrl": result["pdfUrl"],
        "credencial": _serialize_credencial(result["credencial"])
    }


@router.get("/")
async def listar_credenciales(
    empresaId: Optional[str] = Query(None),
    cursoId: Optional[str] = Query(None),
    alumnoId: Optional[str] = Query(None),
    current_user=Depends(get_current_user)
):
    """
    Listar credenciales con filtros opcionales.
    INSTRUCTOR: solo ve las de su empresa.
    SUPER_ADMIN: ve todas.
    """
    if current_user.rol not in ["INSTRUCTOR", "SUPER_ADMIN"]:
        raise HTTPException(status_code=403, detail="No autorizado")

    # Construir filtro
    where: dict = {}

    if alumnoId:
        where["alumnoId"] = alumnoId
    if cursoId:
        where["cursoId"] = cursoId

    # Instructor solo ve alumnos de su empresa
    if current_user.rol == "INSTRUCTOR" and current_user.empresaId:
        where["alumno"] = {"empresaId": current_user.empresaId}
    elif empresaId:
        where["alumno"] = {"empresaId": empresaId}

    credenciales = await prisma.credencial.find_many(
        where=where,
        include={
            "alumno": {"include": {"empresa": True}},
            "curso": True
        },
        order={"createdAt": "desc"}
    )

    return [
        CredencialListItem(
            id=c.id,
            numero=c.numero,
            pdfUrl=c.pdfUrl,
            qrCodeUrl=c.qrCodeUrl,
            fechaEmision=c.fechaEmision.isoformat(),
            fechaVencimiento=c.fechaVencimiento.isoformat() if c.fechaVencimiento else None,
            alumnoNombre=c.alumno.nombre,
            alumnoApellido=c.alumno.apellido,
            alumnoDni=c.alumno.dni,
            cursoNombre=c.curso.nombre,
            cursoCodigo=c.curso.codigo,
            empresaNombre=c.alumno.empresa.nombre if c.alumno.empresa else None
        )
        for c in credenciales
    ]


@router.get("/batch-pdf")
async def descargar_lote_pdf(
    cursoId: str = Query(...),
    current_user=Depends(get_current_user)
):
    """
    Genera un solo PDF con todas las credenciales de un curso.
    Solo INSTRUCTOR y SUPER_ADMIN.
    """
    if current_user.rol not in ["INSTRUCTOR", "SUPER_ADMIN"]:
        raise HTTPException(status_code=403, detail="No autorizado")
        
    try:
        pdf_url = await generate_batch_pdf_for_course(cursoId, current_user.id)
        return {"pdfUrl": pdf_url}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"[BATCH PDF] Error: {e}")
        raise HTTPException(status_code=500, detail="Error al generar el lote de PDF")


@router.delete("/{credencial_id}")
async def eliminar_credencial(credencial_id: str, current_user=Depends(get_current_user)):
    """Eliminar credencial. Solo SUPER_ADMIN."""
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Solo SUPER_ADMIN puede eliminar credenciales")

    credencial = await prisma.credencial.find_unique(where={"id": credencial_id})
    if not credencial:
        raise HTTPException(status_code=404, detail="Credencial no encontrada")

    await prisma.credencial.delete(where={"id": credencial_id})
    return {"success": True, "message": "Credencial eliminada"}


# ============= HELPERS =============

def _serialize_credencial(c) -> dict:
    return {
        "id": c.id,
        "numero": c.numero,
        "pdfUrl": c.pdfUrl,
        "qrCodeUrl": c.qrCodeUrl,
        "fechaEmision": c.fechaEmision.isoformat() if c.fechaEmision else None,
        "fechaVencimiento": c.fechaVencimiento.isoformat() if c.fechaVencimiento else None,
    }
