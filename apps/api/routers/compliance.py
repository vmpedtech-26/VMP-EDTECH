"""
Router dedicado a la gobernanza corporativa y canal de denuncias éticas (Ley N° 27.401).
Soporta denuncias públicas anónimas y gestión por parte de administradores.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Optional, List
from datetime import datetime
import secrets
import string
import json

from pydantic import BaseModel
from core.security_utils import SanitizedBaseModel
from auth.dependencies import get_current_user
from middleware.security import rate_limit_public
from core.database import prisma
from core.config import settings
from services.email_service import EmailService

router = APIRouter()
email_service = EmailService()


# ============= SCHEMAS =============

class DenunciaCreateRequest(SanitizedBaseModel):
    titulo: str
    descripcion: str
    categoria: str  # FRAUDE, ACOSO, SEGURIDAD, CORRUPCION, OTROS
    relacionEmpresa: str  # EMPLEADO, PROVEEDOR, CLIENTE, EXTERNO, ANONIMO
    esAnonima: bool = True
    nombreDenunciante: Optional[str] = None
    emailDenunciante: Optional[str] = None
    telefono: Optional[str] = None


class DenunciaUpdateRequest(SanitizedBaseModel):
    estado: str  # NUEVA, EN_INVESTIGACION, RESUELTA, DESESTIMADA
    comentariosOficial: Optional[str] = None


class PublicDenunciaResponse(BaseModel):
    codigoSeguimiento: str
    categoria: str
    estado: str
    comentariosOficial: Optional[str] = None
    createdAt: str


class AdminDenunciaListItem(BaseModel):
    id: str
    codigoSeguimiento: str
    titulo: str
    categoria: str
    relacionEmpresa: str
    esAnonima: bool
    estado: str
    createdAt: str


class AdminDenunciaDetail(BaseModel):
    id: str
    codigoSeguimiento: str
    titulo: str
    descripcion: str
    categoria: str
    relacionEmpresa: str
    esAnonima: bool
    nombreDenunciante: Optional[str] = None
    emailDenunciante: Optional[str] = None
    telefono: Optional[str] = None
    estado: str
    comentariosOficial: Optional[str] = None
    createdAt: str
    updatedAt: str


# ============= HELPERS =============

async def get_unique_tracking_code() -> str:
    """Genera un código único de seguimiento de 8 caracteres (VMP-COMP-XXXXXX)."""
    chars = string.ascii_uppercase + string.digits
    while True:
        code = "VMP-COMP-" + "".join(secrets.choice(chars) for _ in range(6))
        # Verificar que no exista en BD
        exists = await prisma.compliancereport.find_unique(where={"codigoSeguimiento": code})
        if not exists:
            return code


# ============= ENDPOINTS PÚBLICOS =============

@router.post("/report", response_model=PublicDenunciaResponse)
@rate_limit_public()
async def registrar_denuncia(data: DenunciaCreateRequest, request: Request):
    """
    Registrar una nueva denuncia de manera anónima o identificada.
    Genera un ticket y código único de seguimiento.
    """
    if not data.titulo.strip() or not data.descripcion.strip():
        raise HTTPException(status_code=400, detail="El título y la descripción son requeridos.")

    # Si no es anónima, verificar datos mínimos de contacto
    if not data.esAnonima and not (data.nombreDenunciante or data.emailDenunciante):
        raise HTTPException(
            status_code=400, 
            detail="Para denuncias no anónimas, debes ingresar nombre o email de contacto."
        )

    # Generar código único
    codigo_seguimiento = await get_unique_tracking_code()

    # Guardar en base de datos
    report = await prisma.compliancereport.create(
        data={
            "codigoSeguimiento": codigo_seguimiento,
            "titulo": data.titulo.strip(),
            "descripcion": data.descripcion.strip(),
            "categoria": data.categoria,
            "relacionEmpresa": data.relacionEmpresa,
            "esAnonima": data.esAnonima,
            "nombreDenunciante": None if data.esAnonima else data.nombreDenunciante,
            "emailDenunciante": None if data.esAnonima else data.emailDenunciante,
            "telefono": None if data.esAnonima else data.telefono,
            "estado": "NUEVA"
        }
    )

    # Enviar notificación por correo al Oficial de Cumplimiento (o administrador general)
    try:
        # Se puede configurar un email específico en .env, sino enviar al remitente por defecto o admin
        oficial_email = os.getenv("COMPLIANCE_OFFICER_EMAIL", settings.EMAIL_FROM)
        
        # Renderizar la plantilla HTML
        template = email_service.jinja_env.get_template("email_compliance_oficial.html")
        html_content = template.render(
            report=report,
            date_str=report.createdAt.strftime("%d/%m/%Y %H:%M"),
            admin_url=settings.ADMIN_URL
        )

        await email_service.send_email(
            to_email=oficial_email,
            subject=f"🏛️ ALERTA COMPLIANCE [{codigo_seguimiento}] - Nueva denuncia registrada",
            html_content=html_content
        )
    except Exception as e:
        # No bloquear el registro si falla el correo
        print(f"Error al enviar correo de compliance al Oficial: {e}")
        pass

    return PublicDenunciaResponse(
        codigoSeguimiento=report.codigoSeguimiento,
        categoria=report.categoria,
        estado=report.estado,
        comentariosOficial=report.comentariosOficial,
        createdAt=report.createdAt.isoformat()
    )


@router.get("/report/{codigo_seguimiento}", response_model=PublicDenunciaResponse)
@rate_limit_public()
async def consultar_denuncia(codigo_seguimiento: str, request: Request):
    """
    Consultar el estado y comentarios de seguimiento de una denuncia por su código único.
    """
    report = await prisma.compliancereport.find_unique(where={"codigoSeguimiento": codigo_seguimiento})
    if not report:
        raise HTTPException(status_code=404, detail="Denuncia no encontrada o código inválido.")

    return PublicDenunciaResponse(
        codigoSeguimiento=report.codigoSeguimiento,
        categoria=report.categoria,
        estado=report.estado,
        comentariosOficial=report.comentariosOficial,
        createdAt=report.createdAt.isoformat()
    )


# ============= ENDPOINTS ADMINISTRATIVOS =============

@router.get("/admin/reports", response_model=List[AdminDenunciaListItem])
async def admin_listar_denuncias(current_user=Depends(get_current_user)):
    """
    Obtener listado de todas las denuncias registradas.
    Acceso restringido a administradores.
    """
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos para ver el canal de denuncias.")

    reports = await prisma.compliancereport.find_many(
        order={"createdAt": "desc"}
    )

    return [
        AdminDenunciaListItem(
            id=r.id,
            codigoSeguimiento=r.codigoSeguimiento,
            titulo=r.titulo,
            categoria=r.categoria,
            relacionEmpresa=r.relacionEmpresa,
            esAnonima=r.esAnonima,
            estado=r.estado,
            createdAt=r.createdAt.isoformat()
        )
        for r in reports
    ]


@router.get("/admin/reports/{id}", response_model=AdminDenunciaDetail)
async def admin_detalle_denuncia(id: str, current_user=Depends(get_current_user)):
    """
    Obtener el detalle de una denuncia específica por ID de base de datos.
    """
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos.")

    report = await prisma.compliancereport.find_unique(where={"id": id})
    if not report:
        raise HTTPException(status_code=404, detail="Denuncia no encontrada.")

    return AdminDenunciaDetail(
        id=report.id,
        codigoSeguimiento=report.codigoSeguimiento,
        titulo=report.titulo,
        descripcion=report.descripcion,
        categoria=report.categoria,
        relacionEmpresa=report.relacionEmpresa,
        esAnonima=report.esAnonima,
        nombreDenunciante=report.nombreDenunciante,
        emailDenunciante=report.emailDenunciante,
        telefono=report.telefono,
        estado=report.estado,
        comentariosOficial=report.comentariosOficial,
        createdAt=report.createdAt.isoformat(),
        updatedAt=report.updatedAt.isoformat()
    )


@router.patch("/admin/reports/{id}", response_model=AdminDenunciaDetail)
async def admin_actualizar_denuncia(
    id: str, 
    data: DenunciaUpdateRequest, 
    current_user=Depends(get_current_user)
):
    """
    Actualizar estado y agregar comentarios del Oficial de Cumplimiento.
    """
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos.")

    report = await prisma.compliancereport.find_unique(where={"id": id})
    if not report:
        raise HTTPException(status_code=404, detail="Denuncia no encontrada.")

    # Validar estados válidos
    estados_validos = ["NUEVA", "EN_INVESTIGACION", "RESUELTA", "DESESTIMADA"]
    if data.estado not in estados_validos:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Debe ser uno de {estados_validos}")

    # Actualizar en BD
    updated_report = await prisma.compliancereport.update(
        where={"id": id},
        data={
            "estado": data.estado,
            "comentariosOficial": data.comentariosOficial
        }
    )

    return AdminDenunciaDetail(
        id=updated_report.id,
        codigoSeguimiento=updated_report.codigoSeguimiento,
        titulo=updated_report.titulo,
        descripcion=updated_report.descripcion,
        categoria=updated_report.categoria,
        relacionEmpresa=updated_report.relacionEmpresa,
        esAnonima=updated_report.esAnonima,
        nombreDenunciante=updated_report.nombreDenunciante,
        emailDenunciante=updated_report.emailDenunciante,
        telefono=updated_report.telefono,
        estado=updated_report.estado,
        comentariosOficial=updated_report.comentariosOficial,
        createdAt=updated_report.createdAt.isoformat(),
        updatedAt=updated_report.updatedAt.isoformat()
    )
