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
    generate_qr_code
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
                    "fotos": {"where": {"estado": "APROBADA"}}
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
        
        # Background - Brand Teal (#3AAFA9)
        c.setFillColorRGB(0.227, 0.686, 0.662)
        c.rect(0, 0, width, height, fill=1, stroke=0)
        
        # White text
        c.setFillColorRGB(1, 1, 1)
        
        # Logo area
        c.setFont("Helvetica-Bold", 8)
        c.drawString(5*mm, 48*mm, "VMP - EDTECH")
        c.setFont("Helvetica", 6)
        c.drawString(5*mm, 45*mm, "Credencial Profesional")
        
        # Student photo
        foto_path = None
        if alumno.fotos:
            foto_path = alumno.fotos[0].fotoUrl.replace("/uploads/", "uploads/")
            
        if foto_path and os.path.exists(foto_path):
            try:
                c.drawImage(foto_path, 60*mm, 28*mm, 20*mm, 25*mm, mask='auto')
            except Exception:
                pass
                
        # Nombre del alumno
        c.setFont("Helvetica-Bold", 12)
        c.drawString(5*mm, 35*mm, f"{alumno.nombre} {alumno.apellido}")
        
        # DNI
        c.setFont("Helvetica", 8)
        c.drawString(5*mm, 31*mm, f"DNI: {alumno.dni}")
        
        # Curso
        c.setFont("Helvetica-Bold", 9)
        c.drawString(5*mm, 26*mm, f"Curso: {curso.nombre}")
        c.setFont("Helvetica", 7)
        c.drawString(5*mm, 23*mm, f"Código: {curso.codigo}")
        
        # Fechas
        c.setFont("Helvetica", 7)
        c.drawString(5*mm, 17*mm, f"Emisión: {cred.fechaEmision.strftime('%d/%m/%Y')}")
        
        if cred.fechaVencimiento:
            c.drawString(5*mm, 14*mm, f"Vence: {cred.fechaVencimiento.strftime('%d/%m/%Y')}")
            
        # Número de credencial
        c.setFont("Helvetica-Bold", 6)
        c.drawString(5*mm, 3*mm, cred.numero)
        
        # QR Code
        qr_buffer = generate_qr_code(cred.qrCodeUrl)
        c.drawImage(qr_buffer, 62*mm, 3*mm, 20*mm, 20*mm, mask='auto')
        
        # New page for next credential
        c.showPage()
        
    c.save()
    buffer.seek(0)
    
    # Save the batch PDF
    filename = f"batch_{curso_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    file_url = await save_credencial_pdf(buffer.getvalue(), filename)
    
    return file_url
