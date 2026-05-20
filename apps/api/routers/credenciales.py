"""
Router dedicado a la gestión de credenciales.
Generación manual por instructores y listados.
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime
from auth.dependencies import get_current_user
from core.database import prisma
from services.credential_service import generate_credential_for_student
from services.credential_validator import credential_validator
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


@router.get("/mis-credenciales", response_model=List[CredencialListItem])
async def mis_credenciales(current_user=Depends(get_current_user)):
    """Obtener credenciales del alumno autenticado"""
    credenciales = await prisma.credencial.find_many(
        where={"alumnoId": current_user.id},
        include={"alumno": True, "curso": True},
        order={"fechaEmision": "desc"}
    )

    result = []
    for c in credenciales:
        result.append(CredencialListItem(
            id=c.id,
            numero=c.numero,
            pdfUrl=c.pdfUrl,
            qrCodeUrl=c.qrCodeUrl,
            fechaEmision=c.fechaEmision.strftime("%d/%m/%Y") if c.fechaEmision else "",
            fechaVencimiento=c.fechaVencimiento.strftime("%d/%m/%Y") if c.fechaVencimiento else None,
            alumnoNombre=c.alumno.nombre if c.alumno else "",
            alumnoApellido=c.alumno.apellido if c.alumno else "",
            alumnoDni=c.alumno.dni if c.alumno else "",
            cursoNombre=c.curso.nombre if c.curso else "",
            cursoCodigo=c.curso.codigo if c.curso else "",
        ))
    return result


@router.get("/all", response_model=List[CredencialListItem])
async def listar_credenciales(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    current_user=Depends(get_current_user)
):
    """Listar todas las credenciales (Solo SUPER_ADMIN o INSTRUCTOR)"""
    if current_user.rol not in ["SUPER_ADMIN", "INSTRUCTOR"]:
        raise HTTPException(status_code=403, detail="No tienes permisos")

    credenciales = await prisma.credencial.find_many(
        include={"alumno": {"include": {"empresa": True}}, "curso": True},
        order={"fechaEmision": "desc"},
        skip=skip,
        take=limit
    )

    result = []
    for c in credenciales:
        result.append(CredencialListItem(
            id=c.id,
            numero=c.numero,
            pdfUrl=c.pdfUrl,
            qrCodeUrl=c.qrCodeUrl,
            fechaEmision=c.fechaEmision.strftime("%d/%m/%Y") if c.fechaEmision else "",
            fechaVencimiento=c.fechaVencimiento.strftime("%d/%m/%Y") if c.fechaVencimiento else None,
            alumnoNombre=c.alumno.nombre if c.alumno else "",
            alumnoApellido=c.alumno.apellido if c.alumno else "",
            alumnoDni=c.alumno.dni if c.alumno else "",
            cursoNombre=c.curso.nombre if c.curso else "",
            cursoCodigo=c.curso.codigo if c.curso else "",
            empresaNombre=c.alumno.empresa.nombre if (c.alumno and c.alumno.empresa) else None,
        ))
    return result


@router.get("/validar/{numero}")
async def validar_credencial_publica(numero: str):
    """
    Validar una credencial por su número de forma pública (sin autenticación).
    Este endpoint es utilizado por la landing page /validar/{codigo}
    """
    try:
        result = await credential_validator.validate_credential(numero)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al validar credencial: {str(e)}")



@router.post("/generar-manual")
async def generar_credencial_manual(
    data: GenerarCredencialManualRequest,
    current_user=Depends(get_current_user)
):
    """Generar credencial manualmente (Solo SUPER_ADMIN o INSTRUCTOR)"""
    if current_user.rol not in ["SUPER_ADMIN", "INSTRUCTOR"]:
        raise HTTPException(status_code=403, detail="No tienes permisos para generar credenciales")

    try:
        result = await generate_credential_for_student(
            alumno_id=data.alumnoId,
            curso_id=data.cursoId,
            emisor_id=current_user.id,
            force=False
        )
        return {
            "message": "Credencial ya existía" if result.get("already_existed") else "Credencial generada exitosamente",
            "credencial": {
                "id": result["credencial"].id,
                "numero": result["credencial"].numero,
                "pdfUrl": result["pdfUrl"],
                "already_existed": result.get("already_existed", False)
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando credencial: {str(e)}")


@router.post("/regenerar/{credencial_id}")
async def regenerar_credencial(
    credencial_id: str,
    current_user=Depends(get_current_user)
):
    """Regenerar una credencial existente (forzado, Solo SUPER_ADMIN)"""
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")

    # Obtener la credencial existente
    existing = await prisma.credencial.find_unique(where={"id": credencial_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Credencial no encontrada")

    try:
        result = await generate_credential_for_student(
            alumno_id=existing.alumnoId,
            curso_id=existing.cursoId,
            emisor_id=current_user.id,
            force=True
        )
        return {
            "message": "Credencial regenerada exitosamente",
            "credencial": {
                "numero": result["credencial"].numero,
                "pdfUrl": result["pdfUrl"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error regenerando credencial: {str(e)}")
