import os
from datetime import datetime
from io import BytesIO
import qrcode
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.pagesizes import landscape
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
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

def draw_credencial_front(c, data, width, height, foto_path=None):
    slate_900 = HexColor("#0F172A")
    primary_light = HexColor("#5EEAD4")
    slate_600 = HexColor("#475569")
    slate_400 = HexColor("#94A3B8")
    slate_100 = HexColor("#F1F5F9")
    white = HexColor("#FFFFFF")

    # Base Background
    c.setFillColor(white)
    c.rect(0, 0, width, height, fill=1, stroke=0)
    
    # Right column gradient (simulated with light color)
    c.setFillColor(slate_100)
    c.rect(55.6*mm, 0, 30*mm, height - 9*mm, fill=1, stroke=0)
    
    def draw_field(x, y, label, value, large=False):
        c.setFillColor(slate_600)
        c.setFont("Helvetica-Bold", 3.2)
        c.drawString(x, y + 2*mm, label.upper())
        
        c.setStrokeColor(slate_400)
        c.setLineWidth(0.5)
        length = 23*mm
        if label.lower() in ("empresa", "fecha de evaluación"):
            length = 49*mm
        c.line(x, y, x + length, y)
        
        if large:
            c.setFillColor(slate_900)
            c.setFont("Helvetica-Bold", 6.2)
            c.drawString(x, y + 0.5*mm, value.upper())
        else:
            c.setFillColor(slate_900)
            c.setFont("Helvetica-Bold", 5.2)
            c.drawString(x, y + 0.5*mm, value)
            
    left_1 = 4 * mm
    left_2 = 30 * mm
    
    y_row1 = height - 16 * mm
    y_row2 = height - 25 * mm
    y_row3 = height - 34 * mm
    y_row4 = height - 43 * mm

    # Parse full name
    nombre_completo = data.get('alumno_nombre', '')
    parts = nombre_completo.split(' ', 1)
    nombre = parts[0]
    apellido = parts[1] if len(parts) > 1 else ''
    
    draw_field(left_1, y_row1, "Apellido", apellido, True)
    draw_field(left_2, y_row1, "Nombre", nombre, True)
    
    draw_field(left_1, y_row2, "DNI / PSP", data.get('dni', ''))
    draw_field(left_2, y_row2, "Puesto", data.get('puesto', 'Conductor'))
    
    draw_field(left_1, y_row3, "Empresa", data.get('empresa_nombre', ''))
    draw_field(left_1, y_row4, "Fecha de Evaluación", data.get('fecha_emision', ''))

    # Photo Box
    photo_size = 18.5*mm
    photo_x = 61.5*mm
    photo_y = height - 29.5*mm 
    
    # border & bg
    c.setFillColor(white)
    c.setStrokeColor(white)
    c.setLineWidth(1)
    c.roundRect(photo_x - 1*mm, photo_y - 1*mm, photo_size + 2*mm, photo_size + 2*mm, 1*mm, fill=1, stroke=1)
    
    if foto_path and os.path.exists(foto_path):
        try:
            c.drawImage(foto_path, photo_x, photo_y, photo_size, photo_size, mask='auto', preserveAspectRatio=True)
        except Exception:
            c.setFillColor(slate_100)
            c.roundRect(photo_x, photo_y, photo_size, photo_size, 0.5*mm, fill=1, stroke=0)
    else:
        c.setFillColor(slate_100)
        c.roundRect(photo_x, photo_y, photo_size, photo_size, 0.5*mm, fill=1, stroke=0)

    # Signature
    sig_y = 6*mm
    sig_x = 61.5*mm
    sig_w = 20*mm
    sig_h = 10*mm
    
    try:
        sig_path = os.path.join(os.path.dirname(__file__), "..", "assets", "signature_clean.png")
        if os.path.exists(sig_path):
            c.drawImage(sig_path, sig_x, sig_y + 3*mm, width=sig_w, height=sig_h, mask='auto', preserveAspectRatio=True)
    except:
        pass
    
    # Signature line & text
    c.setStrokeColor(slate_400)
    c.setLineWidth(0.5)
    c.line(sig_x - 1*mm, sig_y + 3*mm, sig_x + sig_w + 1*mm, sig_y + 3*mm)
    
    c.setFillColor(slate_900)
    c.setFont("Helvetica-Bold", 3.2)
    c.drawCentredString(sig_x + sig_w/2, sig_y + 1.5*mm, "Pedro Orejas")
    c.setFillColor(slate_600)
    c.setFont("Helvetica-Bold", 2.3)
    c.drawCentredString(sig_x + sig_w/2, sig_y, "Instructor VMP | Mat. N° 2206825")

    # Header
    header_h = 9 * mm
    c.setFillColor(slate_900)
    c.rect(0, height - header_h, width, header_h, fill=1, stroke=0)

    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(4 * mm, height - 6 * mm, "VMP")
    c.setFillColor(slate_600)
    c.setFont("Helvetica", 9)
    c.drawString(11.5 * mm, height - 6 * mm, "|")
    c.setFillColor(primary_light)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(13 * mm, height - 6 * mm, "EDTECH")

    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 3.5)
    c.drawRightString(width - 4 * mm, height - 3.8 * mm, "CREDENCIAL OFICIAL")
    c.setFillColor(primary_light)
    c.drawRightString(width - 4 * mm, height - 5.5 * mm, "CAPACITACIÓN VIAL PROFESIONAL")

def draw_credencial_back(c, data, width, height):
    slate_900 = HexColor("#0F172A")
    primary_light = HexColor("#5EEAD4")
    primary_dark = HexColor("#2D9E93")
    slate_800 = HexColor("#1E293B")
    slate_600 = HexColor("#475569")
    slate_400 = HexColor("#94A3B8")
    slate_100 = HexColor("#F1F5F9")
    white = HexColor("#FFFFFF")

    c.setFillColor(white)
    c.rect(0, 0, width, height, fill=1, stroke=0)
    
    # Header
    header_h = 9 * mm
    c.setFillColor(slate_900)
    c.rect(0, height - header_h, width, header_h, fill=1, stroke=0)

    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(4 * mm, height - 6 * mm, "VMP")
    c.setFillColor(slate_600)
    c.setFont("Helvetica", 9)
    c.drawString(11.5 * mm, height - 6 * mm, "|")
    c.setFillColor(primary_light)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(13 * mm, height - 6 * mm, "EDTECH")

    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 3.5)
    c.drawRightString(width - 4 * mm, height - 3.8 * mm, "CREDENCIAL OFICIAL")
    c.setFillColor(primary_light)
    c.drawRightString(width - 4 * mm, height - 5.5 * mm, "CAPACITACIÓN VIAL PROFESIONAL")

    # Texts
    c.setFillColor(slate_900)
    c.setFont("Helvetica-Bold", 5)
    c.drawCentredString(width/2, height - 16 * mm, "Esta credencial certifica que su titular ha aprobado la capacitación de:")
    
    c.setFillColor(primary_dark)
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(width/2, height - 21 * mm, data.get('curso_nombre', ''))

    # Warning Box
    box_w = 75*mm
    box_h = 7*mm
    box_y = height - 32*mm
    box_x = (width - box_w) / 2
    
    c.setFillColor(HexColor("#FFFBEB"))
    c.roundRect(box_x, box_y, box_w, box_h, 1*mm, fill=1, stroke=0)
    c.setFillColor(HexColor("#F59E0B"))
    c.roundRect(box_x, box_y, 2*mm, box_h, 1*mm, fill=1, stroke=0)
    
    c.setFillColor(HexColor("#92400E"))
    c.setFont("Helvetica", 3.5)
    c.drawString(box_x + 9*mm, box_y + 3*mm, "Este comprobante no reemplaza a la licencia de conducir, único documento habilitante")
    c.drawString(box_x + 9*mm, box_y + 1.5*mm, "y con validez a los efectos legales.")
    
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(HexColor("#F59E0B"))
    c.drawString(box_x + 4*mm, box_y + 1.8*mm, "!")

    # Carga Horaria & Qr
    foot_y = 3*mm
    c.setStrokeColor(slate_100)
    c.setLineWidth(0.5)
    c.line(4*mm, foot_y + 10*mm, width - 4*mm, foot_y + 10*mm)
    
    ch_box_w = 16*mm
    ch_box_h = 7*mm
    ch_box_x = 4*mm
    
    c.setFillColor(slate_100)
    c.setStrokeColor(slate_400)
    c.setLineWidth(0.3)
    c.roundRect(ch_box_x, foot_y + 1*mm, ch_box_w, ch_box_h, 1.5*mm, fill=1, stroke=1)
    
    c.setFillColor(slate_600)
    c.setFont("Helvetica-Bold", 3)
    c.drawCentredString(ch_box_x + ch_box_w/2, foot_y + 5.5*mm, "CARGA HORARIA")
    c.setFillColor(slate_900)
    c.setFont("Helvetica-Bold", 7)
    c.drawCentredString(ch_box_x + ch_box_w/2, foot_y + 2.5*mm, "8 HORAS")
    
    # Signature reverse
    sig2_w = 16*mm
    sig2_h = 8*mm
    sig2_x = 36*mm
    sig2_y = foot_y + 1*mm
    
    c.setFillColor(slate_400)
    c.setFont("Helvetica-Bold", 3)
    c.drawCentredString(sig2_x + sig2_w/2, sig2_y + 6.5*mm, "ACREDITADO POR")
    
    try:
        sig_path = os.path.join(os.path.dirname(__file__), "..", "assets", "signature_clean.png")
        if os.path.exists(sig_path):
            c.drawImage(sig_path, sig2_x, sig2_y + 1.5*mm, width=sig2_w, height=sig2_h, mask='auto', preserveAspectRatio=True)
    except:
        pass
    
    c.setFillColor(slate_900)
    c.setFont("Helvetica-Bold", 2.8)
    c.drawCentredString(sig2_x + sig2_w/2, sig2_y + 0.5*mm, "Pedro Orejas")
    c.setFillColor(slate_600)
    c.setFont("Helvetica-Bold", 1.8)
    c.drawCentredString(sig2_x + sig2_w/2, sig2_y, "Instructor VMP | Mat. N° 2206825")
    
    # QR instead of Logos to enable Validation
    if data.get('qr_url'):
        qr_buffer = generate_qr_code(data['qr_url'])
        qr_size = 10*mm
        qr_x = width - 4*mm - qr_size
        c.drawImage(ImageReader(qr_buffer), qr_x, foot_y, qr_size, qr_size, mask='auto', preserveAspectRatio=True)
    c.setFillColor(slate_800)
    c.setFont("Helvetica-Bold", 2.5)
    c.drawRightString(width - 4*mm, foot_y + 10.5*mm, f"N°: {data.get('numero_credencial', '')}")

async def create_credencial_pdf(credencial_data: dict, foto_path: str = None) -> bytes:
    """Create a 2-page PDF credencial matching the HTML design"""
    buffer = BytesIO()
    width = 85.60 * mm
    height = 53.98 * mm
    c = canvas.Canvas(buffer, pagesize=(width, height))
    
    # Front Page
    draw_credencial_front(c, credencial_data, width, height, foto_path)
    c.showPage()
    
    # Back Page
    draw_credencial_back(c, credencial_data, width, height)
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
