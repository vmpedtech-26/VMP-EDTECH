import os
from datetime import datetime
from io import BytesIO
import qrcode
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.pagesizes import landscape
from reportlab.lib.utils import ImageReader
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
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
    Create a Premium Enterprise Credencial PDF (Front & Back - 595x400 pts)
    Designed with Senior Art Direction standards for high-end corporate delivery.
    """
    buffer = BytesIO()
    
    # Card Canvas Dimensions
    width = 595
    height = 400
    
    c = canvas.Canvas(buffer, pagesize=(width, height))
    
    # Detect if it's the winter driving course
    curso_nombre = credencial_data.get('curso_nombre', '').lower()
    is_invernal = 'invernal' in curso_nombre or 'invierno' in curso_nombre
    
    # Enterprise Colors (Strict brand consistency with vmp-edtech.com)
    DARK_BLUE = (10/255, 17/255, 32/255)      # Deep Navy `#0A1120`
    TEAL = (0/255, 173/255, 181/255)          # Brand Teal `#00ADB5`
    TEXT_DARK = (15/255, 23/255, 42/255)      # Slate Dark `#0F172A`
    GRAY_LIGHT = (248/255, 250/255, 252/255)   # Slate Light `#F8FAFC`
    GRAY_BORDER = (226/255, 232/255, 240/255) # Border Slate `#E2E8F0`
    GRAY_TEXT = (100/255, 116/255, 139/255)   # Muted Gray `#64748B`
    
    # ================= PAGE 1: FRONT =================
    
    # 1. Base Card Container (Rounded PVC Style)
    c.setFillColorRGB(1, 1, 1)
    c.setStrokeColorRGB(*GRAY_BORDER)
    c.setLineWidth(1)
    c.roundRect(12, 12, width - 24, height - 24, 12, fill=1, stroke=1)
    
    # 2. Draw winter driving background if applicable (Subtle Watermark - clipped to card corners)
    if is_invernal:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        bg_path = os.path.abspath(os.path.join(base_dir, "..", "assets", "images", "winter_bg.png"))
        if os.path.exists(bg_path):
            try:
                c.saveState()
                # Define clipping path to match card rounded corners perfectly
                clip_path = c.beginPath()
                clip_path.roundRect(12, 12, width - 24, height - 24, 12)
                c.clipPath(clip_path, stroke=0, fill=0)
                # Draw background image at 16% opacity (vibrant yet clean)
                c.setFillAlpha(0.16)
                c.drawImage(ImageReader(bg_path), 12, 12, width=width-24, height=height-24)
                c.restoreState()
            except Exception as e:
                print(f"Error drawing winter background on page 1: {e}")

    # 3. Floating Brand Header
    header_x, header_y = 16, height - 66
    header_w, header_h = width - 32, 50
    c.setFillColorRGB(*DARK_BLUE)
    c.roundRect(header_x, header_y, header_w, header_h, 8, fill=1, stroke=0)
    
    # Logo Left
    c.setFont("Helvetica-Bold", 18)
    c.setFillColorRGB(1, 1, 1)
    c.drawString(header_x + 20, header_y + 16, "VMP")
    c.setFont("Helvetica", 18)
    c.setFillColorRGB(*TEAL)
    c.drawString(header_x + 64, header_y + 16, "| EDTECH")
    
    # Badge Right
    c.setFont("Helvetica-Bold", 10)
    c.setFillColorRGB(*TEAL)
    c.drawRightString(header_x + header_w - 20, header_y + 26, "CREDENCIAL OFICIAL")
    c.setFont("Helvetica", 8.5)
    c.setFillColorRGB(1, 1, 1)
    c.drawRightString(header_x + header_w - 20, header_y + 12, "Capacitación Vial Profesional")
    
    # 4. Profile Photo Card Container (Modern 3:4 Portrait Ratio)
    photo_x, photo_y = 24, 122
    photo_w, photo_h = 108, 144
    
    # Draw photo frame (Glassmorphism card)
    c.setFillColorRGB(1, 1, 1)
    c.setFillAlpha(0.88)
    c.setStrokeColorRGB(*GRAY_BORDER)
    c.setLineWidth(1)
    c.roundRect(photo_x, photo_y, photo_w, photo_h, 8, fill=1, stroke=1)
    c.setFillAlpha(1.0)
    
    if foto_path and os.path.exists(foto_path):
        try:
            from PIL import Image
            img = Image.open(foto_path)
            
            # Center Crop to 3:4 aspect ratio
            w, h = img.size
            target_ratio = 0.75
            current_ratio = w / h
            if current_ratio > target_ratio:
                # Image is too wide, crop width
                new_w = int(h * target_ratio)
                left = (w - new_w) // 2
                top = 0
                right = left + new_w
                bottom = h
            else:
                # Image is too tall, crop height
                new_h = int(w / target_ratio)
                left = 0
                top = (h - new_h) // 2
                right = w
                bottom = top + new_h
            
            img_cropped = img.crop((left, top, right, bottom))
            
            # Save to temporary buffer
            img_buffer = BytesIO()
            img_cropped.save(img_buffer, format="JPEG", quality=95)
            img_buffer.seek(0)
            
            # Draw the cropped portrait image with a 3pt inner margin
            c.drawImage(ImageReader(img_buffer), photo_x + 3, photo_y + 3, width=photo_w - 6, height=photo_h - 6, mask='auto')
        except Exception as e:
            print(f"Error processing/drawing photo: {e}")
    else:
        # Elegant Vector Silhouette Placeholder for 3:4 Portrait frame
        c.setFillColorRGB(226/255, 232/255, 240/255)
        # Head
        c.circle(photo_x + photo_w/2, photo_y + photo_h/2 + 16, 16, fill=1, stroke=0)
        # Shoulders
        c.roundRect(photo_x + 18, photo_y + 20, photo_w - 36, 36, 10, fill=1, stroke=0)
            
    # 5. Grid-Based Corporate Information Section (Frosted Glassmorphism Panel)
    info_panel_x = 156
    info_panel_y = 134
    info_panel_w = 415
    info_panel_h = 174
    
    c.setFillColorRGB(1, 1, 1)
    c.setFillAlpha(0.88)
    c.setStrokeColorRGB(*GRAY_BORDER)
    c.setLineWidth(1)
    c.roundRect(info_panel_x, info_panel_y, info_panel_w, info_panel_h, 8, fill=1, stroke=1)
    c.setFillAlpha(1.0)
    
    def draw_premium_field(x, y, label, value):
        c.setFont("Helvetica-Bold", 7.5)
        c.setFillColorRGB(*GRAY_TEXT)
        c.drawString(x, y + 14, label)
        c.setFont("Helvetica-Bold", 12)
        c.setFillColorRGB(*TEXT_DARK)
        
        display_value = str(value)
        if label != "PUESTO" and label != "DNI / PSP" and isinstance(value, str):
            display_value = display_value.title()
            
        c.drawString(x, y, display_value)
        
    nombre_completo = credencial_data.get('alumno_nombre', '--- ---')
    partes = nombre_completo.split(' ', 1)
    nombre = partes[0]
    apellido = partes[1] if len(partes) > 1 else ""

    draw_premium_field(176, 248, "APELLIDO", apellido)
    draw_premium_field(376, 248, "NOMBRE", nombre)
    draw_premium_field(176, 196, "DNI / PSP", credencial_data.get('dni', ''))
    draw_premium_field(376, 196, "PUESTO", credencial_data.get('puesto', 'Conductor Profesional'))
    
    # Empresa full row inside the info panel
    empresa_nombre = credencial_data.get('empresa_nombre') or "VMP - EDTECH"
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColorRGB(*GRAY_TEXT)
    c.drawString(176, 160, "EMPRESA")
    c.setFont("Helvetica-Bold", 12.5)
    c.setFillColorRGB(*TEXT_DARK)
    c.drawString(176, 146, empresa_nombre.upper())
    
    # 6. Course Approved Container Card (Glassmorphism style with left accent)
    box_x = 156
    box_y = 68
    box_w = 415
    box_h = 54
    
    c.setFillColorRGB(1, 1, 1)
    c.setFillAlpha(0.90)
    c.setStrokeColorRGB(*GRAY_BORDER)
    c.setLineWidth(1)
    c.roundRect(box_x, box_y, box_w, box_h, 8, fill=1, stroke=1)
    c.setFillAlpha(1.0)
    
    # Left Border Accent (Solid Teal indicator strip)
    c.setFillColorRGB(*TEAL)
    c.roundRect(box_x, box_y, 6, box_h, 2, fill=1, stroke=0)
    
    c.setFont("Helvetica-Bold", 11)
    c.setFillColorRGB(*DARK_BLUE)
    c.drawString(box_x + 20, box_y + 30, credencial_data.get('curso_nombre', 'Conducción Segura').upper())
    
    c.setFont("Helvetica", 8)
    c.setFillColorRGB(*GRAY_TEXT)
    fechas_str = f"Emisión: {credencial_data.get('fecha_emision')}      Vencimiento: {credencial_data.get('fecha_vencimiento') or 'Sin Vencimiento'}"
    c.drawString(box_x + 20, box_y + 14, fechas_str)

    # 7. Signature & Stamp Footer (Clean, balanced layout)
    instructor_nombre = credencial_data.get('instructor_nombre', 'Pedro Orejas')
    instructor_info = credencial_data.get('instructor_info', 'Instructor VMP | Mat. N° 2206823')
    instructor_id = credencial_data.get('instructor_id')

    # Signature Block (Left - aligned under the profile picture)
    sig_y = 20
    if instructor_id:
        try:
            from services.file_upload import get_instructor_signature_path
            sig_path = get_instructor_signature_path(instructor_id)
            if sig_path and os.path.exists(str(sig_path)):
                c.drawImage(ImageReader(str(sig_path)), 24, sig_y + 14, width=80, height=26, mask='auto')
        except Exception as ex:
            print(f"Error drawing signature on front: {ex}")
            
    c.setFont("Helvetica-Bold", 10)
    c.setFillColorRGB(*TEXT_DARK)
    c.drawString(24, sig_y + 12, instructor_nombre)
    c.setFont("Helvetica", 7.5)
    c.setFillColorRGB(*GRAY_TEXT)
    c.drawString(24, sig_y + 2, instructor_info)
    
    # Verification Badge (Right - aligned in official VMP Navy/Teal palette)
    badge_w, badge_h = 180, 26
    badge_x, badge_y = width - 24 - badge_w, sig_y
    c.setFillColorRGB(*TEAL)
    c.setStrokeColorRGB(*TEAL)
    c.roundRect(badge_x, badge_y, badge_w, badge_h, 6, fill=1, stroke=1)
    
    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColorRGB(*DARK_BLUE)
    c.drawCentredString(badge_x + badge_w/2, badge_y + 9, "🛡️ VERIFICADA POR VMP - EDTECH")
    
    # ================= PAGE 2: BACK =================
    c.showPage()
    
    # 1. Base Card Container (Back)
    c.setFillColorRGB(1, 1, 1)
    c.setStrokeColorRGB(*GRAY_BORDER)
    c.setLineWidth(1)
    c.roundRect(12, 12, width - 24, height - 24, 12, fill=1, stroke=1)
    
    # 2. Draw background watermark (clipped to card corners)
    if is_invernal:
        if os.path.exists(bg_path):
            try:
                c.saveState()
                clip_path_back = c.beginPath()
                clip_path_back.roundRect(12, 12, width - 24, height - 24, 12)
                c.clipPath(clip_path_back, stroke=0, fill=0)
                c.setFillAlpha(0.16)
                c.drawImage(ImageReader(bg_path), 12, 12, width=width-24, height=height-24)
                c.restoreState()
            except Exception as e:
                print(f"Error drawing winter background on page 2: {e}")
 
    # 3. Floating Header (Back)
    c.setFillColorRGB(*DARK_BLUE)
    c.roundRect(header_x, header_y, header_w, header_h, 8, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 18)
    c.setFillColorRGB(1, 1, 1)
    c.drawString(header_x + 20, header_y + 16, "VMP")
    c.setFont("Helvetica", 18)
    c.setFillColorRGB(*TEAL)
    c.drawString(header_x + 64, header_y + 16, "| EDTECH")
    c.setFont("Helvetica-Bold", 10)
    c.setFillColorRGB(*TEAL)
    c.drawRightString(header_x + header_w - 20, header_y + 20, "VERIFICACIÓN Y CRITERIOS")

    # 4. Body Content Panel (Back - left side glassmorphism panel)
    left_panel_x = 24
    left_panel_y = 68
    left_panel_w = 352
    left_panel_h = 252
    
    c.setFillColorRGB(1, 1, 1)
    c.setFillAlpha(0.88)
    c.setStrokeColorRGB(*GRAY_BORDER)
    c.roundRect(left_panel_x, left_panel_y, left_panel_w, left_panel_h, 8, fill=1, stroke=1)
    c.setFillAlpha(1.0)
    
    c.setFont("Helvetica", 10.5)
    c.setFillColorRGB(*TEXT_DARK)
    c.drawString(left_panel_x + 20, left_panel_y + 216, "Esta credencial certifica que su titular ha aprobado el curso oficial de:")
    
    c.setFont("Helvetica-Bold", 15)
    c.setFillColorRGB(*DARK_BLUE)
    c.drawString(left_panel_x + 20, left_panel_y + 184, credencial_data.get('curso_nombre', 'Conducción Segura').upper())
    
    # 5. Metadata Badges (Accreditation & Hours) inside left panel
    badge_y = left_panel_y + 90
    badge_w = 146
    badge_h = 48
    
    # Carga Horaria Badge
    c.setFillColorRGB(*GRAY_LIGHT)
    c.setStrokeColorRGB(*GRAY_BORDER)
    c.roundRect(left_panel_x + 20, badge_y, badge_w, badge_h, 6, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColorRGB(*TEAL)
    c.drawString(left_panel_x + 32, badge_y + 30, "CARGA HORARIA")
    c.setFont("Helvetica-Bold", 12)
    c.setFillColorRGB(*TEXT_DARK)
    c.drawString(left_panel_x + 32, badge_y + 12, "8 HORAS")

    # Acreditado por Badge
    c.setFillColorRGB(*GRAY_LIGHT)
    c.setStrokeColorRGB(*GRAY_BORDER)
    c.roundRect(left_panel_x + 186, badge_y, badge_w, badge_h, 6, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColorRGB(*TEAL)
    c.drawString(left_panel_x + 198, badge_y + 30, "ACREDITADO POR")
    c.setFont("Helvetica-Bold", 12)
    c.setFillColorRGB(*TEXT_DARK)
    c.drawString(left_panel_x + 198, badge_y + 12, "VMP - EDTECH")
    
    # 6. Disclaimer Text (Correctly wrapped using Paragraph flowable to prevent overflow)
    disclaimer_text = "• Esta credencial de capacitación profesional es intransferible y no reemplaza a la Licencia Nacional de Conducir."
    disclaimer_style = ParagraphStyle(
        name="DisclaimerStyle",
        fontName="Helvetica-Oblique",
        fontSize=7.5,
        leading=10,
        textColor=GRAY_TEXT,
    )
    p_disclaimer = Paragraph(disclaimer_text, disclaimer_style)
    p_width = 312
    p_disclaimer.wrap(p_width, 60)
    p_disclaimer.drawOn(c, left_panel_x + 20, left_panel_y + 24)
    
    # 7. QR Code Security Card (Right)
    qr_x, qr_y = 392, 68
    qr_w, qr_h = 179, 252
    c.setFillColorRGB(1, 1, 1)
    c.setFillAlpha(0.90)
    c.setStrokeColorRGB(*GRAY_BORDER)
    c.roundRect(qr_x, qr_y, qr_w, qr_h, 8, fill=1, stroke=1)
    c.setFillAlpha(1.0)
    
    qr_url = credencial_data.get('qr_url', '')
    if qr_url:
        qr_buffer = generate_qr_code(qr_url)
        # Position QR perfectly centered in the card
        c.drawImage(ImageReader(qr_buffer), qr_x + (qr_w - 120)/2, qr_y + 80, 120, 120, mask='auto')
        
    c.setFont("Helvetica-Bold", 8)
    c.setFillColorRGB(*GRAY_TEXT)
    c.drawCentredString(qr_x + qr_w/2, qr_y + 45, "ESCANEAR PARA VALIDAR")
    c.setFont("Helvetica", 7)
    c.setFillColorRGB(*GRAY_TEXT)
    c.drawCentredString(qr_x + qr_w/2, qr_y + 30, "Firma Criptográfica HMAC-SHA256")
    
    # 8. Signature Footer (Back)
    if instructor_id:
        try:
            from services.file_upload import get_instructor_signature_path
            sig_path = get_instructor_signature_path(instructor_id)
            if sig_path and os.path.exists(str(sig_path)):
                c.drawImage(ImageReader(str(sig_path)), 24, sig_y + 14, width=80, height=26, mask='auto')
        except Exception as ex:
            print(f"Error drawing signature on back: {ex}")
            
    c.setFont("Helvetica-Bold", 10)
    c.setFillColorRGB(*TEXT_DARK)
    c.drawString(24, sig_y + 12, instructor_nombre)
    c.setFont("Helvetica", 7.5)
    c.setFillColorRGB(*GRAY_TEXT)
    c.drawString(24, sig_y + 2, instructor_info)
    
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
