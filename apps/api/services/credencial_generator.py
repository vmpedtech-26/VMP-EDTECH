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
    Create Credencial PDF matching the Premium Redesigned Layout (Front & Back - 595x400 pts)
    """
    buffer = BytesIO()
    
    # Official Format Dimensions
    width = 595
    height = 400
    
    c = canvas.Canvas(buffer, pagesize=(width, height))
    
    # Detect if it's the winter driving course to apply the organic mountain theme
    curso_nombre = (credencial_data.get('curso_nombre') or '').lower()
    is_invernal = 'invernal' in curso_nombre or 'invierno' in curso_nombre
    
    # Colors (Maintain classic VMP-EDTECH branding colors)
    DARK_BLUE = (10/255, 17/255, 32/255)      # Navy `#0A1120`
    TEAL = (0/255, 173/255, 181/255)          # Teal `#00ADB5`
    TEXT_DARK = (15/255, 23/255, 42/255)      # Slate Dark `#0F172A`
    GRAY_LIGHT = (248/255, 250/255, 252/255)   # Slate Light `#F8FAFC`
    GRAY_BORDER = (226/255, 232/255, 240/255) # Border Slate `#E2E8F0`
    GRAY_TEXT = (100/255, 116/255, 139/255)   # Muted Gray `#64748B`
    LIGHT_GRAY = (240/255, 245/255, 250/255)
    
    # ================= PAGE 1: FRONT =================
    
    # 1. Base Card Container (Rounded PVC Style with clip path to prevent image bleed)
    c.saveState()
    card_clip = c.beginPath()
    card_clip.roundRect(12, 12, width - 24, height - 24, 12)
    c.clipPath(card_clip, stroke=0, fill=0)
    
    # Draw card white background
    c.setFillColorRGB(1, 1, 1)
    c.rect(12, 12, width - 24, height - 24, fill=1, stroke=0)
    
    # Draw winter driving background if applicable (subtle watermark at 18% opacity)
    if is_invernal:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        bg_path = os.path.abspath(os.path.join(base_dir, "..", "assets", "images", "winter_bg.png"))
        if os.path.exists(bg_path):
            try:
                c.saveState()
                c.setFillAlpha(0.28)
                c.drawImage(ImageReader(bg_path), 12, 12, width=width-24, height=height-24)
                c.restoreState()
            except Exception as e:
                print(f"Error drawing winter background on page 1: {e}")
                
    # --- HEADER ---
    c.setFillColorRGB(*DARK_BLUE)
    c.rect(12, 312, width - 24, 76, fill=1, stroke=0)
    
    # Bottom teal accent line in header
    c.setFillColorRGB(*TEAL)
    c.rect(12, 306, width - 24, 6, fill=1, stroke=0)
    
    # Shield Icon Container
    c.setFillColorRGB(*TEAL)
    c.roundRect(26, 332, 28, 28, 6, fill=1, stroke=0)
    
    # Draw Shield Vector inside icon container
    c.setStrokeColorRGB(1, 1, 1)
    c.setLineWidth(1.5)
    shield_path = c.beginPath()
    shield_path.moveTo(35, 350)
    shield_path.lineTo(45, 350)
    shield_path.lineTo(45, 344)
    shield_path.lineTo(40, 338)
    shield_path.lineTo(35, 344)
    shield_path.close()
    c.drawPath(shield_path, fill=0, stroke=1)
    
    # Logo Text
    c.setFont("Helvetica-Bold", 15)
    c.setFillColorRGB(1, 1, 1)
    c.drawString(64, 348, "VMP")
    c.setFont("Helvetica", 15)
    c.drawString(102, 348, "|")
    c.setFont("Helvetica-Bold", 15)
    c.drawString(112, 348, "EDTECH")
    
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColorRGB(200/255, 210/255, 220/255)
    c.drawString(64, 336, "VIALIDAD Y MANEJO PROFESIONAL")
    
    # Right Side Header Text
    c.setFont("Helvetica-Bold", 9.5)
    c.setFillColorRGB(*TEAL)
    c.drawRightString(width - 24, 350, "CREDENCIAL OFICIAL")
    
    c.setFont("Helvetica-Bold", 8)
    c.setFillColorRGB(200/255, 210/255, 220/255)
    numero_credencial = credencial_data.get('numero_credencial') or ''
    cred_num_str = numero_credencial.replace('VMP-', 'CR-')
    c.drawRightString(width - 24, 338, f"N° {cred_num_str}")
    
    # --- LEFT COLUMN ---
    # Photo Frame (Portrait)
    photo_x, photo_y = 24, 172
    photo_w, photo_h = 96, 132
    c.setFillColorRGB(*LIGHT_GRAY)
    c.setStrokeColorRGB(*DARK_BLUE)
    c.setLineWidth(1.5)
    c.roundRect(photo_x, photo_y, photo_w, photo_h, 8, fill=1, stroke=1)
    
    if foto_path and os.path.exists(foto_path):
        try:
            from PIL import Image
            img = Image.open(foto_path)
            w, h = img.size
            target_ratio = photo_w / photo_h
            current_ratio = w / h
            if current_ratio > target_ratio:
                new_w = int(h * target_ratio)
                left = (w - new_w) // 2
                top = 0
                right = left + new_w
                bottom = h
            else:
                new_h = int(w / target_ratio)
                left = 0
                top = (h - new_h) // 2
                right = w
                bottom = top + new_h
            img_cropped = img.crop((left, top, right, bottom))
            
            img_buffer = BytesIO()
            img_cropped.save(img_buffer, format="JPEG", quality=95)
            img_buffer.seek(0)
            
            c.saveState()
            photo_clip = c.beginPath()
            photo_clip.roundRect(photo_x + 3, photo_y + 3, photo_w - 6, photo_h - 6, 6)
            c.clipPath(photo_clip, stroke=0, fill=0)
            c.drawImage(ImageReader(img_buffer), photo_x + 3, photo_y + 3, width=photo_w - 6, height=photo_h - 6, mask='auto')
            c.restoreState()
        except Exception as e:
            print(f"Error drawing photo: {e}")
    else:
        # Silhouette Placeholder
        c.setFillColorRGB(180/255, 190/255, 200/255)
        c.circle(photo_x + photo_w/2, photo_y + photo_h/2 + 10, 14, fill=1, stroke=0)
        c.roundRect(photo_x + 18, photo_y + 40, photo_w - 36, 26, 8, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 8)
        c.setFillColorRGB(140/255, 150/255, 160/255)
        c.drawCentredString(photo_x + photo_w/2, photo_y + 18, "FOTO")
        
    # Vertical Industry Badges
    badges = [
        ("🔥 GAS & OIL", 148),
        ("🚚 TRANSPORTE", 126),
        ("⛰️ MINERÍA", 104)
    ]
    for label, by in badges:
        c.setFillColorRGB(*DARK_BLUE)
        c.roundRect(photo_x, by, photo_w, 18, 4, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 7)
        c.setFillColorRGB(1, 1, 1)
        c.drawCentredString(photo_x + photo_w/2, by + 5.5, label)
        
    # --- RIGHT COLUMN ---
    # Titular Container
    titular_x, titular_y = 134, 202
    titular_w, titular_w_total = 437, 437
    titular_h = 102
    c.setFillColorRGB(*DARK_BLUE)
    c.roundRect(titular_x, titular_y, titular_w_total, titular_h, 8, fill=1, stroke=0)
    
    # Inside Titular
    c.setFont("Helvetica-Bold", 8)
    c.setFillColorRGB(*TEAL)
    c.drawString(titular_x + 20, titular_y + 80, "TITULAR")
    
    nombre_completo = credencial_data.get('alumno_nombre') or '--- ---'
    partes = nombre_completo.split(' ', 1)
    nombre = partes[0]
    apellido = partes[1] if len(partes) > 1 else ""
    
    c.setFont("Helvetica-Bold", 32)
    c.setFillColorRGB(1, 1, 1)
    c.drawString(titular_x + 20, titular_y + 44, (apellido or '').upper())
    
    c.setFont("Helvetica-Bold", 20)
    c.setFillColorRGB(1, 1, 1)
    c.drawString(titular_x + 20, titular_y + 18, nombre)
    
    # Grid Row 1 (DNI / PSP & PUESTO)
    box_y = 150
    box_h = 42
    
    # DNI / PSP Box
    c.setFillColorRGB(1, 1, 1)
    c.setStrokeColorRGB(*GRAY_BORDER)
    c.setLineWidth(1)
    c.roundRect(134, box_y, 213, box_h, 6, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColorRGB(*TEAL)
    c.drawString(146, box_y + 26, "DNI / PSP")
    c.setFont("Helvetica-Bold", 12.5)
    c.setFillColorRGB(*TEXT_DARK)
    c.drawString(146, box_y + 10, credencial_data.get('dni') or '')
    
    # PUESTO Box
    c.setFillColorRGB(1, 1, 1)
    c.setStrokeColorRGB(*GRAY_BORDER)
    c.roundRect(357, box_y, 214, box_h, 6, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColorRGB(*TEAL)
    c.drawString(369, box_y + 26, "PUESTO")
    c.setFont("Helvetica-Bold", 11.5)
    c.setFillColorRGB(*TEXT_DARK)
    c.drawString(369, box_y + 10, credencial_data.get('puesto') or 'Conductor Profesional')
    
    # Grid Row 2 (EMPRESA)
    emp_y = 102
    emp_h = 40
    c.setFillColorRGB(1, 1, 1)
    c.setStrokeColorRGB(*GRAY_BORDER)
    c.roundRect(134, emp_y, 437, emp_h, 6, fill=1, stroke=1)
    
    # Factory Icon
    c.setStrokeColorRGB(*TEAL)
    c.setLineWidth(1.5)
    icon_path = c.beginPath()
    icon_path.moveTo(148, emp_y + 12)
    icon_path.lineTo(148, emp_y + 26)
    icon_path.lineTo(153, emp_y + 26)
    icon_path.lineTo(153, emp_y + 20)
    icon_path.lineTo(158, emp_y + 20)
    icon_path.lineTo(158, emp_y + 26)
    icon_path.lineTo(163, emp_y + 26)
    icon_path.lineTo(163, emp_y + 12)
    icon_path.close()
    c.drawPath(icon_path, fill=0, stroke=1)
    
    c.setFillColorRGB(*TEAL)
    c.rect(150, emp_y + 15, 2, 2, fill=1, stroke=0)
    c.rect(160, emp_y + 15, 2, 2, fill=1, stroke=0)
    
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColorRGB(*TEAL)
    c.drawString(172, emp_y + 25, "EMPRESA")
    
    empresa_nombre = credencial_data.get('empresa_nombre') or "VMP - EDTECH"
    c.setFont("Helvetica-Bold", 12)
    c.setFillColorRGB(*TEXT_DARK)
    c.drawString(172, emp_y + 9, empresa_nombre.upper())
    
    # --- COURSE APPROVED PANEL ---
    course_panel_x = 24
    course_panel_y = 48
    course_panel_w = 547
    course_panel_h = 48
    
    c.setFillColorRGB(1, 1, 1)
    c.setStrokeColorRGB(*GRAY_BORDER)
    c.roundRect(course_panel_x, course_panel_y, course_panel_w, course_panel_h, 6, fill=1, stroke=1)
    
    # Teal side indicator
    c.setFillColorRGB(*TEAL)
    c.roundRect(course_panel_x, course_panel_y, 6, course_panel_h, 2, fill=1, stroke=0)
    
    # Course Info Text
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColorRGB(*TEAL)
    c.drawString(40, course_panel_y + 34, "CURSO APROBADO")
    c.setFont("Helvetica-Bold", 13)
    c.setFillColorRGB(*TEXT_DARK)
    c.drawString(40, course_panel_y + 19, (credencial_data.get('curso_nombre') or 'Conducción Segura').upper())
    
    c.setFont("Helvetica", 8)
    c.setFillColorRGB(*GRAY_TEXT)
    realizacion_str = f"Realización: {credencial_data.get('fecha_emision') or ''}   ·   8 horas"
    c.drawString(40, course_panel_y + 7, realizacion_str)
    
    # Vigente Pill
    pill_x, pill_y = width - 24 - 80 - 12, course_panel_y + 24
    c.setStrokeColorRGB(*TEAL)
    c.setFillColorRGB(240/255, 250/255, 250/255) # Light Teal background
    c.roundRect(pill_x, pill_y, 80, 16, 8, fill=1, stroke=1)
    
    c.setFillColorRGB(*TEAL)
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(pill_x + 40, pill_y + 4.5, "• VIGENTE")
    
    # Expiration Date below pill
    c.setFont("Helvetica", 8.5)
    c.setFillColorRGB(*GRAY_TEXT)
    c.drawRightString(width - 84 - 12, course_panel_y + 8, "Vto: ")
    
    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColorRGB(220/255, 38/255, 38/255) # Red-600
    vencimiento_str = credencial_data.get('fecha_vencimiento') or '---'
    c.drawRightString(width - 24 - 12, course_panel_y + 8, vencimiento_str)
    
    # --- FOOTER BAR ---
    c.setFillColorRGB(*DARK_BLUE)
    c.rect(12, 12, width - 24, 26, fill=1, stroke=0)
    
    instructor_nombre = credencial_data.get('instructor_nombre') or 'Pedro Orejas'
    instructor_info = credencial_data.get('instructor_info') or 'Instructor VMP | Mat. N° 2206823'
    instructor_id = credencial_data.get('instructor_id')
    
    c.setFont("Helvetica-Bold", 9)
    c.setFillColorRGB(1, 1, 1)
    c.drawString(24, 21, instructor_nombre)
    
    c.setFont("Helvetica", 7.5)
    c.setFillColorRGB(200/255, 210/255, 220/255)
    c.drawString(110, 21, instructor_info)
    
    # Teal Status Pill Button in Footer
    btn_x, btn_y = width - 24 - 170, 15
    c.setFillColorRGB(*TEAL)
    c.roundRect(btn_x, btn_y, 170, 20, 4, fill=1, stroke=0)
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawCentredString(btn_x + 85, btn_y + 6, "✓ CAPACITACIÓN APROBADA")
    
    c.restoreState() # Restore original canvas state
    
    # ================= PAGE 2: BACK =================
    c.showPage()
    
    # Card Border and Clip Path
    c.saveState()
    c.clipPath(card_clip, stroke=0, fill=0)
    
    # Draw card white background
    c.setFillColorRGB(1, 1, 1)
    c.rect(12, 12, width - 24, height - 24, fill=1, stroke=0)
    
    # Background watermark
    if is_invernal:
        if os.path.exists(bg_path):
            try:
                c.saveState()
                c.setFillAlpha(0.28)
                c.drawImage(ImageReader(bg_path), 12, 12, width=width-24, height=height-24)
                c.restoreState()
            except Exception as e:
                print(f"Error drawing winter background on page 2: {e}")
                
    # --- HEADER (Back) ---
    c.setFillColorRGB(*DARK_BLUE)
    c.rect(12, 312, width - 24, 76, fill=1, stroke=0)
    
    c.setFillColorRGB(*TEAL)
    c.rect(12, 306, width - 24, 6, fill=1, stroke=0)
    
    # Shield Icon Container
    c.roundRect(26, 332, 28, 28, 6, fill=1, stroke=0)
    c.setStrokeColorRGB(1, 1, 1)
    c.setLineWidth(1.5)
    c.drawPath(shield_path, fill=0, stroke=1)
    
    # Logo Text
    c.setFont("Helvetica-Bold", 15)
    c.setFillColorRGB(1, 1, 1)
    c.drawString(64, 348, "VMP")
    c.setFont("Helvetica", 15)
    c.drawString(102, 348, "|")
    c.setFont("Helvetica-Bold", 15)
    c.drawString(112, 348, "EDTECH")
    
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColorRGB(200/255, 210/255, 220/255)
    c.drawString(64, 336, "CAPACITACIÓN VIAL PROFESIONAL")
    
    c.setFont("Helvetica-Bold", 9.5)
    c.setFillColorRGB(*TEAL)
    c.drawRightString(width - 24, 345, "CREDENCIAL OFICIAL")
    
    # --- BODY CONTENT (Back) ---
    c.setFont("Helvetica", 10.5)
    c.setFillColorRGB(*TEXT_DARK)
    c.drawString(24, 284, "Esta credencial certifica que su titular ha aprobado satisfactoriamente el curso de:")
    
    # Course Name Box (Back)
    c.setFillColorRGB(*DARK_BLUE)
    c.roundRect(24, 222, 384, 52, 6, fill=1, stroke=0)
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(39, 241, (credencial_data.get('curso_nombre') or 'Conducción Segura').upper())
    
    # Disclaimers / Bullets
    disc_style = ParagraphStyle(
        name="DiscStyleBack",
        fontName="Helvetica",
        fontSize=7.5,
        leading=10.5,
        textColor=GRAY_TEXT,
    )
    disc_text = (
        "• Este comprobante no reemplaza a la licencia de conducir, único documento habilitante con validez legal.<br/>"
        "• Válido exclusivamente para actividades en las industrias habilitadas por VMP EDTECH."
    )
    p_disc = Paragraph(disc_text, disc_style)
    p_disc.wrap(384, 50)
    p_disc.drawOn(c, 24, 168)
    
    # Grid of 3 boxes
    grid_y = 110
    grid_h = 40
    
    # Carga Horaria
    c.setFillColorRGB(1, 1, 1)
    c.setStrokeColorRGB(*GRAY_BORDER)
    c.setLineWidth(1)
    c.roundRect(24, grid_y, 115, grid_h, 6, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 7)
    c.setFillColorRGB(*TEAL)
    c.drawString(34, grid_y + 25, "CARGA HORARIA")
    c.setFont("Helvetica-Bold", 11.5)
    c.setFillColorRGB(*TEXT_DARK)
    c.drawString(34, grid_y + 9, "8 hs")
    
    # Acreditado por
    c.setFillColorRGB(1, 1, 1)
    c.setStrokeColorRGB(*GRAY_BORDER)
    c.roundRect(149, grid_y, 115, grid_h, 6, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 7)
    c.setFillColorRGB(*TEAL)
    c.drawString(159, grid_y + 25, "ACREDITADO POR")
    c.setFont("Helvetica-Bold", 10)
    c.setFillColorRGB(*TEXT_DARK)
    c.drawString(159, grid_y + 9, "VMP - EDTECH")
    
    # CUIT
    c.setFillColorRGB(1, 1, 1)
    c.setStrokeColorRGB(*GRAY_BORDER)
    c.roundRect(274, grid_y, 134, grid_h, 6, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 7)
    c.setFillColorRGB(*TEAL)
    c.drawString(284, grid_y + 25, "CUIT")
    c.setFont("Helvetica-Bold", 10)
    c.setFillColorRGB(*TEXT_DARK)
    c.drawString(284, grid_y + 9, "30-71936908-8")
    
    # QR Code Container Panel (Right)
    qr_box_x, qr_box_y = 418, 110
    qr_box_w, qr_box_h = 153, 190
    
    c.setFillColorRGB(1, 1, 1)
    c.setStrokeColorRGB(*GRAY_BORDER)
    c.roundRect(qr_box_x, qr_box_y, qr_box_w, qr_box_h, 8, fill=1, stroke=1)
    
    # QR Code
    qr_url = credencial_data.get('qr_url') or ''
    if qr_url:
        qr_buffer = generate_qr_code(qr_url)
        c.drawImage(ImageReader(qr_buffer), qr_box_x + (qr_box_w - 110)/2, qr_box_y + 54, 110, 110, mask='auto')
        
    c.setFont("Helvetica-Bold", 8)
    c.setFillColorRGB(*GRAY_TEXT)
    c.drawCentredString(qr_box_x + qr_box_w/2, qr_box_y + 34, "VERIFICAR EN")
    c.setFont("Helvetica-Bold", 9)
    c.setFillColorRGB(*DARK_BLUE)
    c.drawCentredString(qr_box_x + qr_box_w/2, qr_box_y + 18, "vmp-edtech.com/validar")
    
    # Instructor Signature on the back
    if instructor_id:
        try:
            from services.file_upload import get_instructor_signature_path
            sig_path = get_instructor_signature_path(instructor_id)
            if sig_path and os.path.exists(str(sig_path)):
                c.drawImage(ImageReader(str(sig_path)), 24, 52, width=90, height=35, mask='auto')
        except Exception as ex:
            print(f"Error drawing signature on back: {ex}")
            
    # --- FOOTER BAR (Back) ---
    c.setFillColorRGB(*DARK_BLUE)
    c.rect(12, 12, width - 24, 26, fill=1, stroke=0)
    
    c.setFont("Helvetica-Bold", 9)
    c.setFillColorRGB(1, 1, 1)
    c.drawString(24, 21, instructor_nombre)
    
    c.setFont("Helvetica", 7.5)
    c.setFillColorRGB(200/255, 210/255, 220/255)
    c.drawString(110, 21, instructor_info)
    
    # Right-aligned footer details (Back page)
    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColorRGB(200/255, 210/255, 220/255)
    c.drawRightString(width - 24, 25, cred_num_str)
    
    c.setFont("Helvetica", 7)
    c.setFillColorRGB(170/255, 180/255, 190/255)
    c.drawRightString(width - 24, 15, "administracion@vmp-edtech.com")
    
    c.restoreState() # Restore original canvas state
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
