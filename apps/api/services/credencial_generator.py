import os
from datetime import datetime
from io import BytesIO
import qrcode
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.pagesizes import landscape
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

async def create_credencial_pdf(credencial_data: dict, foto_path: str = None) -> bytes:
    """
    Create Credencial PDF based on the Official VMP Format (Front & Back - 595x400 pts)
    """
    buffer = BytesIO()
    
    # Official Format Dimensions
    width = 595
    height = 400
    
    c = canvas.Canvas(buffer, pagesize=(width, height))
    
    # Detect if it's the winter driving course to apply the organic mountain theme
    curso_nombre = credencial_data.get('curso_nombre', '').lower()
    is_invernal = 'invernal' in curso_nombre or 'invierno' in curso_nombre
    
    # Colors
    if is_invernal:
        DARK_BLUE = (27/255, 54/255, 47/255)      # Forest Green `#1B362F`
        TEAL = (91/255, 140/255, 122/255)       # Moss Green `#5B8C7A`
        TEXT_DARK = (20/255, 35/255, 32/255)     # Deep Slate Green `#142320`
    else:
        DARK_BLUE = (13/255, 27/255, 62/255)      # Classic VMP Dark Blue
        TEAL = (0/255, 173/255, 181/255)          # Classic VMP Teal
        TEXT_DARK = (15/255, 28/255, 52/255)      # Classic VMP Text Dark
        
    LIGHT_GRAY = (240/255, 245/255, 250/255)
    GRAY_TEXT = (100/255, 116/255, 139/255)
    
    # ================= PAGE 1: FRONT =================
    # Draw winter driving background if applicable
    if is_invernal:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        bg_path = os.path.abspath(os.path.join(base_dir, "..", "assets", "images", "winter_bg.png"))
        if os.path.exists(bg_path):
            try:
                # Dibujar imagen de fondo de la Patagonia
                c.drawImage(ImageReader(bg_path), 0, 0, width=width, height=height)
                # Capa de claridad semi-transparente para legibilidad de textos
                c.setFillColorRGB(248/255, 249/255, 250/255)
                c.setFillAlpha(0.85)
                c.rect(0, 0, width, height, fill=1, stroke=0)
                c.setFillAlpha(1.0)
            except Exception as e:
                print(f"Error drawing winter background on page 1: {e}")

    # --- HEADER ---
    c.setFillColorRGB(*DARK_BLUE)
    c.rect(0, height - 70, width, 70, fill=1, stroke=0)
    
    c.setFont("Helvetica-Bold", 32)
    c.setFillColorRGB(1, 1, 1)
    c.drawString(35, height - 45, "VMP")
    c.setFont("Helvetica", 32)
    c.setFillColorRGB(*TEAL)
    c.drawString(108, height - 45, "| EDTECH")
    
    c.setFont("Helvetica-Bold", 14)
    c.setFillColorRGB(*TEAL)
    c.drawRightString(width - 35, height - 35, "CREDENCIAL OFICIAL")
    c.setFont("Helvetica", 11)
    c.setFillColorRGB(1, 1, 1)
    c.drawRightString(width - 35, height - 52, "Capacitación Vial Profesional")
    
    c.setFillColorRGB(*TEAL)
    c.rect(0, height - 78, width, 8, fill=1, stroke=0)
    
    # Photo with Border (Fill/Cover mode using PIL for perfect cropping)
    photo_x, photo_y = 35, height - 235
    photo_w, photo_h = 145, 145
    
    if foto_path and os.path.exists(foto_path):
        try:
            from PIL import Image
            img = Image.open(foto_path)
            
            # Center Crop to Square
            w, h = img.size
            size = min(w, h)
            left = (w - size) / 2
            top = (h - size) / 2
            right = (w + size) / 2
            bottom = (h + size) / 2
            
            img_cropped = img.crop((left, top, right, bottom))
            
            # Save to temporary buffer
            img_buffer = BytesIO()
            img_cropped.save(img_buffer, format="JPEG", quality=95)
            img_buffer.seek(0)
            
            # Draw the square image
            c.drawImage(ImageReader(img_buffer), photo_x, photo_y, width=photo_w, height=photo_h, mask='auto')
        except Exception as e:
            print(f"Error processing/drawing photo: {e}")
            
    # Photo Border (Drawn on top)
    c.setStrokeColorRGB(*DARK_BLUE)
    c.setLineWidth(3)
    c.rect(photo_x, photo_y, photo_w, photo_h, fill=0, stroke=1)
            
    info_x = 210
    col2_x = 390
    
    def draw_field(x, y, label, value, line_w=150):
        c.setFont("Helvetica-Bold", 9)
        c.setFillColorRGB(*TEAL)
        c.drawString(x, y + 22, label)
        c.setFont("Helvetica-Bold", 20)
        c.setFillColorRGB(*TEXT_DARK)
        
        # Don't use .title() for PUESTO to preserve acronyms like HSE
        display_value = str(value)
        if label != "PUESTO" and label != "DNI / PSP" and isinstance(value, str):
            display_value = display_value.title()
            
        c.drawString(x, y + 2, display_value)
        c.setStrokeColorRGB(0.8, 0.8, 0.8)
        c.setLineWidth(1)
        c.line(x, y - 5, x + line_w, y - 5)

    nombre_completo = credencial_data.get('alumno_nombre', '--- ---')
    partes = nombre_completo.split(' ', 1)
    nombre = partes[0]
    apellido = partes[1] if len(partes) > 1 else ""

    draw_field(info_x, height - 135, "APELLIDO", apellido, 160)
    draw_field(col2_x, height - 135, "NOMBRE", nombre, 140)
    draw_field(info_x, height - 185, "DNI / PSP", credencial_data.get('dni', ''), 160)
    draw_field(col2_x, height - 185, "PUESTO", credencial_data.get('puesto', 'Tecnico HSE'), 140)
    
    c.setFont("Helvetica-Bold", 9)
    c.setFillColorRGB(*TEAL)
    c.drawString(info_x, height - 215, "EMPRESA")
    c.setFont("Helvetica-Bold", 22)
    c.setFillColorRGB(*TEXT_DARK)
    c.drawString(info_x, height - 238, (credencial_data.get('empresa_nombre') or "Aguas Const. Forken UTE"))
    c.setStrokeColorRGB(0.8, 0.8, 0.8)
    c.line(info_x, height - 245, width - 35, height - 245)

    box_y = 85
    c.setFillColorRGB(*LIGHT_GRAY)
    c.rect(210, box_y, width - 245, 55, fill=1, stroke=0)
    c.setFillColorRGB(*TEAL)
    c.rect(210, box_y, 8, 55, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 10)
    c.setFillColorRGB(*TEAL)
    c.drawString(230, box_y + 38, "CURSO APROBADO")
    c.setFont("Helvetica-Bold", 18)
    c.setFillColorRGB(*TEXT_DARK)
    c.drawString(230, box_y + 20, credencial_data.get('curso_nombre', 'Conducción Segura: Flota Liviana'))
    c.setFont("Helvetica", 11)
    c.setFillColorRGB(*GRAY_TEXT)
    fechas = f"Realización: {credencial_data.get('fecha_emision')}   Vto: {credencial_data.get('fecha_vencimiento') or '---'}"
    c.drawString(230, box_y + 5, fechas)

    instructor_nombre = credencial_data.get('instructor_nombre', 'Pedro Orejas')
    instructor_info = credencial_data.get('instructor_info', 'Instructor VMP | Mat. N° 2206823')
    instructor_id = credencial_data.get('instructor_id')

    # --- FOOTER ---
    c.setStrokeColorRGB(0.8, 0.8, 0.8)
    c.setLineWidth(1)
    c.line(35, 65, width - 35, 65)
    
    # Draw Instructor Signature if exists
    if instructor_id:
        try:
            from services.file_upload import get_instructor_signature_path
            sig_path = get_instructor_signature_path(instructor_id)
            if sig_path and os.path.exists(str(sig_path)):
                c.drawImage(ImageReader(str(sig_path)), 45, 50, width=90, height=35, mask='auto')
        except Exception as ex:
            print(f"Error drawing signature on front: {ex}")
            
    c.setFont("Helvetica-Bold", 18)
    c.setFillColorRGB(*TEXT_DARK)
    c.drawString(40, 42, instructor_nombre)
    c.setFont("Helvetica", 11)
    c.setFillColorRGB(*GRAY_TEXT)
    c.drawString(40, 28, instructor_info)
    
    badge_w, badge_h = 200, 35
    badge_x, badge_y = width - 35 - badge_w, 20
    c.setFillColorRGB(*DARK_BLUE)
    c.roundRect(badge_x, badge_y, badge_w, badge_h, 5, fill=1, stroke=0)
    c.setFillColorRGB(*TEAL)
    c.setFont("Helvetica-Bold", 24)
    c.drawString(badge_x + 12, badge_y + 10, "•")
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(badge_x + 28, badge_y + 13, "CAPACITACIÓN APROBADA")
    
    c.showPage() # ================= PAGE 2: BACK =================
    
    # Draw winter driving background if applicable
    if is_invernal:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        bg_path = os.path.abspath(os.path.join(base_dir, "..", "assets", "images", "winter_bg.png"))
        if os.path.exists(bg_path):
            try:
                # Dibujar imagen de fondo de la Patagonia
                c.drawImage(ImageReader(bg_path), 0, 0, width=width, height=height)
                # Capa de claridad semi-transparente
                c.setFillColorRGB(248/255, 249/255, 250/255)
                c.setFillAlpha(0.85)
                c.rect(0, 0, width, height, fill=1, stroke=0)
                c.setFillAlpha(1.0)
            except Exception as e:
                print(f"Error drawing winter background on page 2: {e}")

    # --- HEADER (Back) ---
    c.setFillColorRGB(*DARK_BLUE)
    c.rect(0, height - 70, width, 70, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 32)
    c.setFillColorRGB(1, 1, 1)
    c.drawString(35, height - 45, "VMP")
    c.setFont("Helvetica", 32)
    c.setFillColorRGB(*TEAL)
    c.drawString(108, height - 45, "| EDTECH")
    c.setFont("Helvetica-Bold", 14)
    c.setFillColorRGB(*TEAL)
    c.drawRightString(width - 35, height - 35, "CREDENCIAL OFICIAL")
    c.setFillColorRGB(*TEAL)
    c.rect(0, height - 78, width, 8, fill=1, stroke=0)

    # --- BODY (Back) ---
    c.setFont("Helvetica", 14)
    c.setFillColorRGB(*TEXT_DARK)
    c.drawString(35, height - 130, "Esta credencial certifica que su titular ha aprobado el curso de:")
    
    c.setFont("Helvetica-Bold", 22)
    c.setFillColorRGB(*TEXT_DARK)
    c.drawString(35, height - 170, credencial_data.get('curso_nombre', 'Conducción Segura: Flota Liviana'))
    
    c.setFont("Helvetica", 10)
    c.setFillColorRGB(*GRAY_TEXT)
    disclaimer = "• Este comprobante no reemplaza a la licencia de conducir, único documento habilitante y con validez a los efectos legales."
    c.drawString(35, height - 210, disclaimer)
    
    # Carga Horaria Box
    c.setFillColorRGB(*LIGHT_GRAY)
    c.roundRect(35, height - 280, 150, 45, 5, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 10)
    c.setFillColorRGB(*TEAL)
    c.drawString(45, height - 250, "CARGA HORARIA")
    c.setFont("Helvetica-Bold", 16)
    c.setFillColorRGB(*TEXT_DARK)
    c.drawString(45, height - 272, "8 HORAS")
    
    # Accreditation
    c.setFont("Helvetica-Bold", 10)
    c.setFillColorRGB(*TEAL)
    c.drawString(210, height - 250, "Acreditado por")
    c.setFont("Helvetica-Bold", 16)
    c.setFillColorRGB(*TEXT_DARK)
    c.drawString(210, height - 272, "VMP - EDTECH")
    
    # QR Code on the back
    qr_url = credencial_data.get('qr_url', '')
    if qr_url:
        qr_buffer = generate_qr_code(qr_url)
        c.drawImage(ImageReader(qr_buffer), width - 110, height - 285, 75, 75, mask='auto')

    # --- FOOTER (Back) ---
    c.setStrokeColorRGB(0.8, 0.8, 0.8)
    c.setLineWidth(1)
    c.line(35, 65, width - 35, 65)
    
    # Draw Instructor Signature if exists
    if instructor_id:
        try:
            from services.file_upload import get_instructor_signature_path
            sig_path = get_instructor_signature_path(instructor_id)
            if sig_path and os.path.exists(str(sig_path)):
                c.drawImage(ImageReader(str(sig_path)), 45, 50, width=90, height=35, mask='auto')
        except Exception as ex:
            print(f"Error drawing signature on back: {ex}")
            
    c.setFont("Helvetica-Bold", 18)
    c.setFillColorRGB(*TEXT_DARK)
    c.drawString(40, 42, instructor_nombre)
    c.setFont("Helvetica", 11)
    c.setFillColorRGB(*GRAY_TEXT)
    c.drawString(40, 28, instructor_info)

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
