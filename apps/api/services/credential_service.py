"""
Servicio centralizado de generación de credenciales.
Reutilizado por examenes.py, inscripciones.py y credenciales.py
"""
import os
from datetime import datetime
from dateutil.relativedelta import relativedelta
from core.database import prisma
from core.config import settings
from services.credencial_generator import (
    generate_credencial_number,
    create_credencial_pdf,
    save_credencial_pdf
)


async def generate_credential_for_student(
    alumno_id: str,
    curso_id: str,
    emisor_id: str | None = None,
    force: bool = False,
) -> dict:
    """
    Genera una credencial PDF con QR para un alumno en un curso.
    
    Args:
        alumno_id: ID del alumno
        curso_id: ID del curso
        emisor_id: ID del instructor/admin que emite (None para auto-gen)
        force: Si True, genera incluso si ya existe una
        
    Returns:
        dict con la credencial creada y la URL del PDF
        
    Raises:
        ValueError si el alumno o curso no existen, o si ya existe credencial
    """
    # Verificar alumno
    alumno = await prisma.user.find_unique(where={"id": alumno_id})
    if not alumno:
        raise ValueError("Alumno no encontrado")
    
    # Verificar curso
    curso = await prisma.curso.find_unique(where={"id": curso_id})
    if not curso:
        raise ValueError("Curso no encontrado")
    
    # Verificar duplicados
    if not force:
        existing = await prisma.credencial.find_first(
            where={
                "alumnoId": alumno_id,
                "cursoId": curso_id
            }
        )
        if existing:
            return {
                "credencial": existing,
                "pdfUrl": existing.pdfUrl,
                "already_existed": True
            }
    
    # Buscar foto aprobada del alumno
    foto_path = None
    try:
        foto_credencial = await prisma.fotocredencial.find_first(
            where={
                "alumnoId": alumno_id,
                "estado": "APROBADA"
            }
        )
        if foto_credencial and foto_credencial.fotoUrl:
            foto_path = foto_credencial.fotoUrl.replace("/uploads/", "uploads/")
    except Exception:
        pass  # Si no hay foto, continuar sin ella
    
    # Generar número de credencial único
    year = datetime.now().year
    count = await prisma.credencial.count()
    numero_credencial = generate_credencial_number(year, count + 1)
    
    # Calcular fecha de vencimiento
    fecha_vencimiento = None
    if curso.vigenciaMeses:
        fecha_vencimiento = datetime.now() + relativedelta(months=curso.vigenciaMeses)
    else:
        fecha_vencimiento = datetime.now() + relativedelta(years=2)  # Default: 2 años
    
    # Construir URL de verificación pública
    frontend_url = settings.ADMIN_URL
    qr_url = f"{frontend_url}/validar/{numero_credencial}"
    
    # Preparar datos del PDF
    pdf_data = {
        "numero_credencial": numero_credencial,
        "alumno_nombre": f"{alumno.nombre} {alumno.apellido}",
        "dni": alumno.dni,
        "curso_nombre": curso.nombre,
        "curso_codigo": curso.codigo,
        "fecha_emision": datetime.now().strftime("%d/%m/%Y"),
        "fecha_vencimiento": fecha_vencimiento.strftime("%d/%m/%Y") if fecha_vencimiento else None,
        "qr_url": qr_url
    }
    
    # Generar PDF
    pdf_bytes = await create_credencial_pdf(pdf_data, foto_path)
    filename = f"{numero_credencial}.pdf"
    pdf_url = await save_credencial_pdf(pdf_bytes, filename)
    
    # Crear registro en BD
    credencial = await prisma.credencial.create(
        data={
            "numero": numero_credencial,
            "alumnoId": alumno_id,
            "cursoId": curso_id,
            "pdfUrl": pdf_url,
            "qrCodeUrl": qr_url,
            "fechaEmision": datetime.now(),
            "fechaVencimiento": fecha_vencimiento,
        }
    )
    
    return {
        "credencial": credencial,
        "pdfUrl": pdf_url,
        "already_existed": False
    }
