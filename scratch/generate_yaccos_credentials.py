import os, sys, qrcode
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image
import fitz

# Output directory
output_dir = '/Users/matias/Desktop/Credenciales_VMP_TRANSPORTE_YACCOS'
artifact_dir = '/Users/matias/.gemini/antigravity/brain/be0298fa-fa80-4c0d-ab29-599f37a05f60'
os.makedirs(output_dir, exist_ok=True)

# Register fonts if available, fallback to Helvetica
try:
    font_dir = '/tmp/premium_fonts'
    bold_path = os.path.join(font_dir, 'Montserrat-Bold.ttf')
    medium_path = os.path.join(font_dir, 'Montserrat-Medium.ttf')
    semibold_path = os.path.join(font_dir, 'Montserrat-SemiBold.ttf')
    pdfmetrics.registerFont(TTFont('Montserrat-Bold', bold_path))
    pdfmetrics.registerFont(TTFont('Montserrat-Medium', medium_path))
    pdfmetrics.registerFont(TTFont('Montserrat-SemiBold', semibold_path))
    FONT_BOLD = 'Montserrat-Bold'
    FONT_SEMIBOLD = 'Montserrat-SemiBold'
    FONT_MEDIUM = 'Montserrat-Medium'
except Exception:
    FONT_BOLD = 'Helvetica-Bold'
    FONT_SEMIBOLD = 'Helvetica-Bold'
    FONT_MEDIUM = 'Helvetica'

def generate_qr_code(data: str, dark_color='#0B172A', light_color='white') -> BytesIO:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color=dark_color, back_color=light_color)
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    return buffer

def generate_credential_pdf(student, pdf_filename):
    # Dimensions A4 Landscape (842 x 595 pt)
    w, h = 842.0, 595.0
    c = canvas.Canvas(pdf_filename, pagesize=(w, h))

    # ================= PAGE 1 =================
    # Top Accent Header Bar
    c.setFillColorRGB(11/255, 23/255, 42/255) # Dark Navy
    c.rect(0, h - 30, w * 0.4, 30, fill=1, stroke=0)
    c.setFillColorRGB(255/255, 107/255, 0/255) # Bright Orange
    c.rect(w * 0.4, h - 30, w * 0.6, 30, fill=1, stroke=0)

    # Student Photo Container (Left Side)
    photo_x, photo_y, photo_w, photo_h = 45, 240, 240, 300
    if os.path.exists(student['photo_path']):
        c.drawImage(student['photo_path'], photo_x, photo_y, width=photo_w, height=photo_h, preserveAspectRatio=True)
    else:
        c.setStrokeColorRGB(200/255, 200/255, 200/255)
        c.rect(photo_x, photo_y, photo_w, photo_h, fill=0, stroke=1)

    # Credential Code Under Photo
    c.setFont(FONT_BOLD, 22)
    c.setFillColorRGB(255/255, 107/255, 0/255)
    c.drawString(photo_x, photo_y - 25, student['code_prefix'])
    c.setFillColorRGB(11/255, 23/255, 42/255)
    c.drawString(photo_x + 95, photo_y - 25, student['code_num'])

    # Fortezza Logo (Bottom Left)
    c.setFont(FONT_BOLD, 30)
    c.setFillColorRGB(11/255, 23/255, 42/255)
    c.drawString(photo_x, photo_y - 120, 'FORTEZZA')
    c.setFont(FONT_MEDIUM, 14)
    c.setFillColorRGB(255/255, 107/255, 0/255)
    c.drawString(photo_x, photo_y - 140, 'SERVICIOS INTEGRALES')

    # Student Information Table (Right Side)
    start_x = 340
    start_y = h - 90
    line_spacing = 42

    labels_data = [
        ('APELLIDO:', student['apellido'].upper()),
        ('NOMBRE:', student['nombre']),
        ('DNI/PSP:', student['dni']),
        ('EMPRESA:', student['empresa'].upper()),
        ('PUESTO:', student['puesto'])
    ]

    for idx, (label, val) in enumerate(labels_data):
        curr_y = start_y - (idx * line_spacing)
        c.setFont(FONT_BOLD, 18)
        c.setFillColorRGB(11/255, 40/255, 120/255)
        c.drawString(start_x, curr_y, label)
        c.setFont(FONT_BOLD, 20)
        c.setFillColorRGB(11/255, 23/255, 42/255)
        c.drawString(start_x + 130, curr_y, val)
        # Separator Line
        c.setStrokeColorRGB(180/255, 190/255, 205/255)
        c.setLineWidth(1.0)
        c.line(start_x + 130, curr_y - 5, w - 45, curr_y - 5)

    # Dates Section
    dates_y = start_y - (5 * line_spacing) - 10
    c.setFont(FONT_MEDIUM, 14)
    c.setFillColorRGB(40/255, 40/255, 40/255)
    c.drawString(start_x, dates_y, 'Fecha realización del curso:')
    c.setFont(FONT_BOLD, 16)
    c.drawString(w - 140, dates_y, student['fecha_realizacion'])

    c.setFont(FONT_BOLD, 15)
    c.setFillColorRGB(11/255, 23/255, 42/255)
    c.drawString(start_x, dates_y - 25, student['curso_nombre'])
    c.setFont(FONT_MEDIUM, 14)
    c.drawString(w - 230, dates_y - 25, 'Vto:')
    c.setFont(FONT_BOLD, 16)
    c.drawString(w - 190, dates_y - 25, student['fecha_vto'])
    c.setLineWidth(1.5)
    c.line(start_x, dates_y - 35, w - 45, dates_y - 35)

    # Instructor Signature Section (Bottom Right)
    sig_x = w - 220
    sig_y = 110
    c.setFont(FONT_MEDIUM, 14)
    c.setFillColorRGB(40/255, 40/255, 40/255)
    c.drawCentredString(sig_x + 50, sig_y - 20, 'Pedro Orejas')
    c.setFont(FONT_MEDIUM, 12)
    c.drawString(sig_x - 10, sig_y - 38, 'Instructor | Mat. N° 2206823')

    # Bottom Accent Bar (Page 1)
    c.setFillColorRGB(255/255, 107/255, 0/255)
    c.rect(w * 0.35, 0, w * 0.25, 25, fill=1, stroke=0)
    c.setFillColorRGB(11/255, 23/255, 42/255)
    c.rect(w * 0.6, 0, w * 0.4, 25, fill=1, stroke=0)

    c.showPage()

    # ================= PAGE 2 =================
    # Top Header Logo
    c.setFont(FONT_BOLD, 26)
    c.setFillColorRGB(11/255, 23/255, 42/255)
    c.drawString(45, h - 60, 'FORTEZZA')
    c.setFont(FONT_MEDIUM, 12)
    c.setFillColorRGB(255/255, 107/255, 0/255)
    c.drawString(45, h - 75, 'SERVICIOS INTEGRALES')

    # Central Orange Banner Block
    banner_y = h - 330
    banner_h = 200
    c.setFillColorRGB(255/255, 107/255, 0/255)
    c.rect(0, banner_y, w, banner_h, fill=1, stroke=0)

    c.setFont(FONT_MEDIUM, 22)
    c.setFillColorRGB(255/255, 255/255, 255/255)
    curso_name = student['curso_nombre']
    c.drawString(30, banner_y + 140, f'Esta credencial certifica que su titular ha aprobado el curso de {curso_name}.')
    c.drawString(30, banner_y + 80, 'Este comprobante no reemplaza a la licencia de conducir, único documento')
    c.drawString(30, banner_y + 50, 'habilitante y con validez a los efectos legales.')

    # Hours
    c.setFont(FONT_BOLD, 22)
    c.setFillColorRGB(11/255, 23/255, 42/255)
    carga = student['carga_horaria']
    c.drawCentredString(w / 2.0, banner_y - 50, f'Carga horaria: {carga} horas')

    # Real Scannable QR Code (Bottom Center)
    full_code = student['full_code']
    qr_data = f'https://www.vmp-edtech.com/validar/{full_code}'
    qr_buf = generate_qr_code(qr_data)
    qr_img = ImageReader(qr_buf)
    qr_size = 110
    qr_x = (w / 2.0) - (qr_size / 2.0)
    qr_y = 55
    c.drawImage(qr_img, qr_x, qr_y, width=qr_size, height=qr_size)

    c.setFont(FONT_BOLD, 11)
    c.setFillColorRGB(11/255, 23/255, 42/255)
    c.drawCentredString(w / 2.0, qr_y - 14, f'Escanear para validar | Código: {full_code}')

    c.showPage()
    c.save()
    print(f'✅ Generated PDF: {pdf_filename}')

    # Render PNG previews of Page 1 & Page 2
    doc = fitz.open(pdf_filename)
    for idx, page in enumerate(doc):
        pix = page.get_pixmap(dpi=150)
        png_filename = pdf_filename.replace('.pdf', f'_p{idx+1}.png')
        pix.save(png_filename)
        print(f'  Saved PNG Preview: {png_filename}')

# Data for 4 TRANSPORTE YACCOS students
students_data = [
    {
        'full_code': 'BLT-RT/1294',
        'code_prefix': 'BLT-RT/',
        'code_num': '1294',
        'apellido': 'Araujo',
        'nombre': 'Rosario Teresa',
        'dni': '18199704',
        'empresa': 'TRANSPORTE YACCOS',
        'puesto': 'Empleado',
        'curso_nombre': 'Conducción Segura: Flota Liviana',
        'fecha_realizacion': '01/08/2026',
        'fecha_vto': '01/08/2028',
        'carga_horaria': '8',
        'photo_path': 'scratch/photos/Rosario_Teresa_Araujo_0.jpeg'
    },
    {
        'full_code': 'BLT-RT/1291',
        'code_prefix': 'BLT-RT/',
        'code_num': '1291',
        'apellido': 'Araujo',
        'nombre': 'Norma Beatriz.',
        'dni': '17377512',
        'empresa': 'TRANSPORTE YACCOS',
        'puesto': 'Empleado',
        'curso_nombre': 'Conducción Segura: Flota Liviana',
        'fecha_realizacion': '01/08/2026',
        'fecha_vto': '01/08/2028',
        'carga_horaria': '8',
        'photo_path': 'scratch/photos/Norma_Beatriz_Araujo_0.jpeg'
    },
    {
        'full_code': 'BLT-RT/1290',
        'code_prefix': 'BLT-RT/',
        'code_num': '1290',
        'apellido': 'Escobar',
        'nombre': 'Gabriel Omario',
        'dni': '17483526',
        'empresa': 'TRANSPORTE YACCOS',
        'puesto': 'Empleado',
        'curso_nombre': 'Conducción Segura: Flota Liviana',
        'fecha_realizacion': '01/08/2026',
        'fecha_vto': '01/08/2028',
        'carga_horaria': '8',
        'photo_path': 'scratch/photos/Gabriel_Omario_Escobar_0.jpeg'
    },
    {
        'full_code': 'BLT-RT/1288',
        'code_prefix': 'BLT-RT/',
        'code_num': '1288',
        'apellido': 'Del Pino',
        'nombre': 'María Silvina',
        'dni': '18393991',
        'empresa': 'TRANSPORTE YACCOS',
        'puesto': 'Empleado',
        'curso_nombre': 'Conducción Segura: Flota Liviana',
        'fecha_realizacion': '01/08/2026',
        'fecha_vto': '01/08/2028',
        'carga_horaria': '8',
        'photo_path': 'scratch/photos/Maria_Silvina_Del_Pino_0.jpeg'
    }
]

for st in students_data:
    fname = f"Credencial_VMP_{st['nombre'].replace(' ', '_')}_{st['apellido'].replace(' ', '_')}.pdf"
    full_pdf_path = os.path.join(output_dir, fname)
    generate_credential_pdf(st, full_pdf_path)
