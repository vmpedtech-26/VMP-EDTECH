import os
from datetime import datetime
from io import BytesIO
import qrcode
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.pagesizes import landscape
from core.config import settings

def generate_credencial_number(year: int, sequential: int) -> str:
    """Generate unique credencial number: VMP-2026-00123"""
    return f"VMP-{year}-{sequential:05d}"

def generate_qr_code(data: str) -> BytesIO:
    """Generate QR code image"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=1,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    return buffer

def create_credencial_pdf(credencial_data: dict) -> bytes:
    """
    Create Credencial PDF in ID card format (85.60 x 53.98 mm)
    
    credencial_data should contain:
    - numero_credencial: str
    - alumno_nombre: str
    - dni: str
    - curso_nombre: str
    - curso_codigo: str
    - fecha_emision: str (DD/MM/YYYY)
    - fecha_vencimiento: str or None (DD/MM/YYYY)
    - qr_url: str
    """
    
    buffer = BytesIO()
    
    # ID Card size
    width = 85.60 * mm
    height = 53.98 * mm
    
    c = canvas.Canvas(buffer, pagesize=(width, height))
    
    # Background gradient effect (simplified as solid color)
    c.setFillColorRGB(0.12, 0.25, 0.69)  # Primary blue
    c.rect(0, 0, width, height, fill=1, stroke=0)
    
    # White text
    c.setFillColorRGB(1, 1, 1)
    
    # Logo area (top-left)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(5*mm, 48*mm, "VMP SERVICIOS")
    c.setFont("Helvetica", 6)
    c.drawString(5*mm, 45*mm, "Credencial Profesional")
    
    # Nombre del alumno
    c.setFont("Helvetica-Bold", 12)
    c.drawString(5*mm, 35*mm, credencial_data['alumno_nombre'])
    
    # DNI
    c.setFont("Helvetica", 8)
    c.drawString(5*mm, 31*mm, f"DNI: {credencial_data['dni']}")
    
    # Curso
    c.setFont("Helvetica-Bold", 9)
    c.drawString(5*mm, 26*mm, f"Curso: {credencial_data['curso_nombre']}")
    c.setFont("Helvetica", 7)
    c.drawString(5*mm, 23*mm, f"Código: {credencial_data['curso_codigo']}")
    
    # Fechas
    c.setFont("Helvetica", 7)
    c.drawString(5*mm, 17*mm, f"Emisión: {credencial_data['fecha_emision']}")
    
    if credencial_data.get('fecha_vencimiento'):
        c.drawString(5*mm, 14*mm, f"Vence: {credencial_data['fecha_vencimiento']}")
    
    # Número de credencial
    c.setFont("Helvetica-Bold", 6)
    c.drawString(5*mm, 3*mm, credencial_data['numero_credencial'])
    
    # QR Code (bottom-right)
    qr_buffer = generate_qr_code(credencial_data['qr_url'])
    c.drawImage(qr_buffer, 62*mm, 3*mm, 20*mm, 20*mm, mask='auto')
    
    c.save()
    buffer.seek(0)
    
    return buffer.getvalue()

async def save_credencial_pdf(pdf_bytes: bytes, filename: str) -> str:
    """Save PDF to storage and return URL"""
    storage_path = os.path.join(settings.STORAGE_PATH, "credenciales")
    os.makedirs(storage_path, exist_ok=True)
    
    file_path = os.path.join(storage_path, filename)
    
    with open(file_path, 'wb') as f:
        f.write(pdf_bytes)
    
    # Return relative URL (for production, this would be S3 URL)
    return f"/storage/credenciales/{filename}"
