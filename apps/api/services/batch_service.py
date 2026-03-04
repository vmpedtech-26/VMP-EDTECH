import os
from datetime import datetime
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
import qrcode
from core.database import prisma
from services.credencial_generator import (
    generate_credencial_number,
    create_credencial_pdf,
    save_credencial_pdf,
    generate_qr_code,
    draw_credencial_front,
    draw_credencial_back
)
from core.config import settings

async def generate_batch_pdf_for_course(curso_id: str, emisor_id: str) -> str:
    """
    Generates a single multi-page PDF with all credentials for a specific course.
    Returns the URL of the generated batch PDF.
    """
    # 1. Get all students with approved exams for this course
    # or just list all existing credentials for this course?
    # The user said "recopilar todas las credenciales del curso del momento en PDF".
    # So I'll fetch all credentials assigned to this course.
    
    credenciales = await prisma.credencial.find_many(
        where={"cursoId": curso_id},
        include={
            "alumno": {
                "include": {
                    "fotos": {"where": {"estado": "APROBADA"}},
                    "empresa": True
                }
            },
            "curso": True
        }
    )
    
    if not credenciales:
        raise ValueError("No hay credenciales emitidas para este curso aún.")
        
    buffer = BytesIO()
    
    # ID Card size
    width = 85.60 * mm
    height = 53.98 * mm
    
    c = canvas.Canvas(buffer, pagesize=(width, height))
    
    for cred in credenciales:
        # Prepare data for this page
        alumno = cred.alumno
        curso = cred.curso
        
        # Student photo
        foto_path = None
        if alumno.fotos:
            foto_path = alumno.fotos[0].fotoUrl.replace("/uploads/", "uploads/")

        empresa_name = alumno.empresa.nombre if alumno.empresa else ""

        pdf_data = {
            "numero_credencial": cred.numero,
            "alumno_nombre": f"{alumno.nombre} {alumno.apellido}",
            "dni": alumno.dni,
            "curso_nombre": curso.nombre,
            "curso_codigo": curso.codigo,
            "fecha_emision": cred.fechaEmision.strftime("%d/%m/%Y") if cred.fechaEmision else "",
            "fecha_vencimiento": cred.fechaVencimiento.strftime("%d/%m/%Y") if cred.fechaVencimiento else None,
            "qr_url": cred.qrCodeUrl,
            "puesto": "Conductor",
            "empresa_nombre": empresa_name
        }
        
        # Front Page
        draw_credencial_front(c, pdf_data, width, height, foto_path)
        c.showPage()
        
        # Back Page
        draw_credencial_back(c, pdf_data, width, height)
        c.showPage()
        
    c.save()
    buffer.seek(0)
    
    # Save the batch PDF
    filename = f"batch_{curso_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    file_url = await save_credencial_pdf(buffer.getvalue(), filename)
    
    return file_url
