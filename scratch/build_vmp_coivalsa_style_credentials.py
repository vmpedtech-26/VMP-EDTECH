import os, sys, qrcode
from PIL import Image, ImageDraw, ImageFont
import fitz

template_pdf = '/Users/matias/.gemini/antigravity/brain/be0298fa-fa80-4c0d-ab29-599f37a05f60/.user_uploaded/media__1785695294284.pdf'
output_dir = '/Users/matias/Desktop/Credenciales_VMP_TRANSPORTE_YACCOS'
artifact_dir = '/Users/matias/.gemini/antigravity/brain/be0298fa-fa80-4c0d-ab29-599f37a05f60'
os.makedirs(output_dir, exist_ok=True)

# Load fonts
try:
    font_bold_lg = ImageFont.truetype('/tmp/premium_fonts/Montserrat-Bold.ttf', 62)
    font_bold_md = ImageFont.truetype('/tmp/premium_fonts/Montserrat-Bold.ttf', 48)
    font_bold_sm = ImageFont.truetype('/tmp/premium_fonts/Montserrat-Bold.ttf', 38)
    font_medium_sm = ImageFont.truetype('/tmp/premium_fonts/Montserrat-Medium.ttf', 38)
except Exception:
    font_bold_lg = ImageFont.load_default()
    font_bold_md = ImageFont.load_default()
    font_bold_sm = ImageFont.load_default()
    font_medium_sm = ImageFont.load_default()

def generate_qr_image(url: str, size: int = 470) -> Image.Image:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=1,
    )
    qr.add_data(url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#0B172A", back_color="white").convert("RGBA")
    qr_img = qr_img.resize((size, size), Image.Resampling.LANCZOS)
    return qr_img

def build_student_credential(student):
    doc = fitz.open(template_pdf)
    scale = 300.0 / 72.0
    matrix = fitz.Matrix(scale, scale)

    # Render base template pages at 300 DPI
    p1_pix = doc[0].get_pixmap(matrix=matrix)
    p2_pix = doc[1].get_pixmap(matrix=matrix)

    p1_img = Image.frombytes('RGB', [p1_pix.width, p1_pix.height], p1_pix.samples).convert('RGBA')
    p2_img = Image.frombytes('RGB', [p2_pix.width, p2_pix.height], p2_pix.samples).convert('RGBA')

    draw1 = ImageDraw.Draw(p1_img)
    draw2 = ImageDraw.Draw(p2_img)

    # ================= PAGE 1 =================
    # 1. Company Name Header (Top Left)
    draw1.rectangle([int(30*scale), int(26*scale), int(260*scale), int(56*scale)], fill='#0B172A')
    draw1.text((int(32*scale), int(29*scale)), 'TRANSPORTE YACCOS', fill='#FFFFFF', font=font_bold_lg)

    # 2. Student Photo (Left Box)
    photo_x = int(31 * scale)
    photo_y = int(94 * scale)
    photo_w = int(175 * scale)
    photo_h = int(245 * scale)

    if os.path.exists(student['photo_path']):
        st_photo = Image.open(student['photo_path']).convert('RGBA')
        # Crop & resize to exact photo frame aspect ratio
        st_photo_ratio = st_photo.width / st_photo.height
        frame_ratio = photo_w / photo_h
        if st_photo_ratio > frame_ratio:
            # wider
            new_w = int(st_photo.height * frame_ratio)
            crop_x = (st_photo.width - new_w) // 2
            st_photo = st_photo.crop((crop_x, 0, crop_x + new_w, st_photo.height))
        else:
            # taller
            new_h = int(st_photo.width / frame_ratio)
            crop_y = (st_photo.height - new_h) // 3 # slightly higher crop for faces
            st_photo = st_photo.crop((0, crop_y, st_photo.width, crop_y + new_h))
        
        st_photo = st_photo.resize((photo_w, photo_h), Image.Resampling.LANCZOS)
        p1_img.paste(st_photo, (photo_x, photo_y))

        # Re-overlay VERIFICADO badge pill at top left of photo
        badge_x = int(37 * scale)
        badge_y = int(101 * scale)
        badge_w = int(90 * scale)
        badge_h = int(16 * scale)
        draw1.rounded_rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], radius=10, fill='#0B172A')
        draw1.text((badge_x + int(12 * scale), badge_y + int(2 * scale)), 'VERIFICADO', fill='#00B4B6', font=font_bold_sm)

    # 3. Student Name (Right Side)
    draw1.rectangle([int(220*scale), int(96*scale), int(560*scale), int(122*scale)], fill='#F7FBFB')
    name_text = f"{student['apellido'].upper()}, {student['nombre'].upper()}"
    draw1.text((int(224*scale), int(97*scale)), name_text, fill='#0B172A', font=font_bold_lg)

    # 4. DNI Value Box
    draw1.rectangle([int(325*scale), int(127*scale), int(480*scale), int(143*scale)], fill='#EDF8F8')
    draw1.text((int(330*scale), int(127*scale)), student['dni'], fill='#0B172A', font=font_bold_md)

    # 5. N° Credencial Value Box
    draw1.rectangle([int(325*scale), int(143*scale), int(480*scale), int(160*scale)], fill='#EDF8F8')
    draw1.text((int(330*scale), int(144*scale)), student['code_display'], fill='#0B172A', font=font_bold_md)

    # 6. Dates
    draw1.rectangle([int(430*scale), int(239*scale), int(555*scale), int(255*scale)], fill='#FFFFFF')
    draw1.text((int(435*scale), int(240*scale)), student['fecha_realizacion'], fill='#0B172A', font=font_bold_md)

    draw1.rectangle([int(430*scale), int(261*scale), int(555*scale), int(277*scale)], fill='#FFFFFF')
    draw1.text((int(435*scale), int(262*scale)), student['fecha_vto'], fill='#0B172A', font=font_bold_md)

    # ================= PAGE 2 =================
    # Real Scannable QR Code
    qr_x = int(241 * scale)
    qr_y = int(166 * scale)
    qr_w = int(113 * scale)
    
    qr_url = f"https://www.vmp-edtech.com/validar/{student['code_url']}"
    qr_img = generate_qr_image(qr_url, size=qr_w)
    p2_img.paste(qr_img, (qr_x, qr_y), qr_img)

    # Credential Code Under QR inside Navy Card
    draw2.rectangle([int(240*scale), int(285*scale), int(355*scale), int(299*scale)], fill='#0B172A')
    code_lbl = f"CÓDIGO: {student['code_display']}"
    draw2.text((int(243*scale), int(286*scale)), code_lbl, fill='#FFFFFF', font=font_bold_sm)

    # Convert RGB images back to PDF
    p1_rgb = p1_img.convert('RGB')
    p2_rgb = p2_img.convert('RGB')

    pdf_path = os.path.join(output_dir, f"Credencial_VMP_{student['file_name']}.pdf")
    png_p1 = os.path.join(output_dir, f"Credencial_VMP_{student['file_name']}_p1.png")
    png_p2 = os.path.join(output_dir, f"Credencial_VMP_{student['file_name']}_p2.png")

    p1_rgb.save(png_p1, 'PNG', quality=100)
    p2_rgb.save(png_p2, 'PNG', quality=100)

    # Save artifact copy PNG
    art_p1 = os.path.join(artifact_dir, f"credencial_vmp_yaccos_{student['file_name'].lower()}_p1.png")
    art_p2 = os.path.join(artifact_dir, f"credencial_vmp_yaccos_{student['file_name'].lower()}_p2.png")
    p1_rgb.save(art_p1, 'PNG')
    p2_rgb.save(art_p2, 'PNG')

    # Save PDF
    p1_rgb.save(pdf_path, 'PDF', save_all=True, append_images=[p2_rgb])
    print(f"✅ Created PDF & PNGs: {pdf_path}")

students_data = [
    {
        'file_name': 'Rosario_Teresa_Araujo',
        'apellido': 'Araujo',
        'nombre': 'Rosario Teresa',
        'dni': '18199704',
        'code_display': 'BLT-RT/1294',
        'code_url': 'BLT-RT-1294',
        'fecha_realizacion': '01/08/2026',
        'fecha_vto': '01/08/2028',
        'photo_path': 'scratch/photos/Rosario_Teresa_Araujo_0.jpeg'
    },
    {
        'file_name': 'Norma_Beatriz_Araujo',
        'apellido': 'Araujo',
        'nombre': 'Norma Beatriz',
        'dni': '17377512',
        'code_display': 'BLT-RT/1291',
        'code_url': 'BLT-RT-1291',
        'fecha_realizacion': '01/08/2026',
        'fecha_vto': '01/08/2028',
        'photo_path': 'scratch/photos/Norma_Beatriz_Araujo_0.jpeg'
    },
    {
        'file_name': 'Gabriel_Omario_Escobar',
        'apellido': 'Escobar',
        'nombre': 'Gabriel Omario',
        'dni': '17483526',
        'code_display': 'BLT-RT/1290',
        'code_url': 'BLT-RT-1290',
        'fecha_realizacion': '01/08/2026',
        'fecha_vto': '01/08/2028',
        'photo_path': 'scratch/photos/Gabriel_Omario_Escobar_0.jpeg'
    },
    {
        'file_name': 'Maria_Silvina_Del_Pino',
        'apellido': 'Del Pino',
        'nombre': 'María Silvina',
        'dni': '18393991',
        'code_display': 'BLT-RT/1288',
        'code_url': 'BLT-RT-1288',
        'fecha_realizacion': '01/08/2026',
        'fecha_vto': '01/08/2028',
        'photo_path': 'scratch/photos/Maria_Silvina_Del_Pino_0.jpeg'
    }
]

for st in students_data:
    build_student_credential(st)
