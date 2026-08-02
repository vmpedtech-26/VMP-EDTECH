import os, sys, qrcode, fitz
from io import BytesIO
from reportlab.lib.pagesizes import landscape
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader

output_dir = '/Users/matias/Desktop/Credenciales_VMP_TRANSPORTE_YACCOS'
artifact_dir = '/Users/matias/.gemini/antigravity/brain/be0298fa-fa80-4c0d-ab29-599f37a05f60'
os.makedirs(output_dir, exist_ok=True)

# Color Palette
navy = HexColor('#0B172A')
cyan = HexColor('#00B4B6')
light_cyan = HexColor('#F0FDFD')
bg_gray = HexColor('#F8FAFC')
gold = HexColor('#F59E0B')
light_yellow = HexColor('#FFFDF0')
text_dark = HexColor('#0F172A')
text_muted = HexColor('#475569')

def build_student_pdf_clean(student):
    pdf_filename = f"Credencial_VMP_{student['file_name']}.pdf"
    pdf_path = os.path.join(output_dir, pdf_filename)

    c = canvas.Canvas(pdf_path, pagesize=(595, 400))

    # ================= PAGE 1 (FRENTE) =================
    # Background
    c.setFillColor(bg_gray)
    c.rect(0, 0, 595, 400, fill=True, stroke=False)

    # Top Header Bar
    c.setFillColor(navy)
    c.rect(0, 335, 595, 65, fill=True, stroke=False)

    # Cyan Accent Bar
    c.setFillColor(cyan)
    c.rect(0, 332, 595, 3, fill=True, stroke=False)

    # Header Text
    c.setFillColor(HexColor('#FFFFFF'))
    c.setFont('Helvetica-Bold', 18)
    c.drawString(30, 358, 'TRANSPORTE YACCOS')

    # Brand Logo Top Right
    c.setFont('Helvetica-Bold', 15)
    c.drawString(420, 360, 'VMP')
    c.setFillColor(cyan)
    c.drawString(460, 360, 'EDTECH')
    c.setFillColor(HexColor('#94A3B8'))
    c.setFont('Helvetica-Bold', 8)
    c.drawString(460, 348, 'CAPACITACIÓN')

    # --- Left Photo Card (Clean Photo without any pills) ---
    c.setFillColor(HexColor('#FFFFFF'))
    c.setStrokeColor(HexColor('#CBD5E1'))
    c.setLineWidth(1)
    c.roundRect(30, 45, 165, 275, 8, fill=True, stroke=True)

    # Student Photo Insertion (Fills photo frame cleanly)
    if os.path.exists(student['photo_path']):
        c.drawImage(student['photo_path'], 34, 49, width=157, height=267, preserveAspectRatio=False)

    # Inner Border Frame around photo
    c.setStrokeColor(HexColor('#00B4B6'))
    c.setLineWidth(1)
    c.roundRect(34, 49, 157, 267, 6, fill=False, stroke=True)

    # --- Right Details Card ---
    # 1. Student Name Container
    c.setFillColor(navy)
    c.roundRect(210, 240, 355, 80, 8, fill=True, stroke=False)
    c.setFillColor(cyan)
    c.setFont('Helvetica-Bold', 9)
    c.drawString(225, 298, 'ALUMNO / OPERARIO CERTIFICADO')
    c.setFillColor(HexColor('#FFFFFF'))
    c.setFont('Helvetica-Bold', 16)
    c.drawString(225, 270, f"{student['apellido'].upper()}, {student['nombre'].upper()}")

    # 2. Credential Info Box
    c.setFillColor(light_cyan)
    c.setStrokeColor(HexColor('#CCFBF1'))
    c.roundRect(210, 140, 355, 90, 8, fill=True, stroke=True)

    # Left Cyan Accent Bar
    c.setFillColor(cyan)
    c.roundRect(210, 140, 6, 90, 3, fill=True, stroke=False)

    c.setFillColor(text_muted)
    c.setFont('Helvetica-Bold', 9)
    c.drawString(228, 208, 'DNI / PASAPORTE:')
    c.setFillColor(text_dark)
    c.setFont('Helvetica-Bold', 12)
    c.drawString(335, 208, student['dni_fmt'])

    c.setFillColor(text_muted)
    c.setFont('Helvetica-Bold', 9)
    c.drawString(228, 185, 'N° CREDENCIAL:')
    c.setFillColor(text_dark)
    c.setFont('Helvetica-Bold', 12)
    c.drawString(335, 185, student['code_display'])

    c.setFillColor(text_muted)
    c.setFont('Helvetica-Bold', 9)
    c.drawString(228, 160, 'EMPRESA:')
    c.setFillColor(navy)
    c.setFont('Helvetica-Bold', 11)
    c.drawString(335, 160, 'TRANSPORTE YACCOS')

    # 3. Course Info Box
    c.setFillColor(HexColor('#FFFFFF'))
    c.setStrokeColor(HexColor('#E2E8F0'))
    c.roundRect(210, 45, 355, 85, 8, fill=True, stroke=True)

    c.setFillColor(cyan)
    c.setFont('Helvetica-Bold', 9)
    c.drawString(225, 110, 'CURSO DE CAPACITACIÓN APROBADO')

    c.setFillColor(navy)
    c.setFont('Helvetica-Bold', 14)
    c.drawString(225, 88, 'Conducción Segura: Flota Liviana')

    c.setFillColor(text_muted)
    c.setFont('Helvetica', 9.5)
    c.drawString(225, 62, f"Fecha Realización: {student['fecha_realizacion']}   |   Vencimiento: {student['fecha_vto']}")

    # Bottom Footer Bar
    c.setFillColor(navy)
    c.rect(0, 0, 595, 28, fill=True, stroke=False)
    c.setFillColor(HexColor('#FFFFFF'))
    c.setFont('Helvetica-Bold', 9.5)
    c.drawCentredString(297, 10, 'www.vmp-edtech.com')

    c.showPage() # End Page 1

    # ================= PAGE 2 (REVERSO) =================
    # Background
    c.setFillColor(bg_gray)
    c.rect(0, 0, 595, 400, fill=True, stroke=False)

    # Top Header Bar
    c.setFillColor(navy)
    c.rect(0, 335, 595, 65, fill=True, stroke=False)
    c.setFillColor(cyan)
    c.rect(0, 332, 595, 3, fill=True, stroke=False)

    c.setFillColor(HexColor('#FFFFFF'))
    c.setFont('Helvetica', 10.5)
    c.drawCentredString(297, 372, 'Esta credencial certifica la aprobación de la capacitación oficial:')
    c.setFillColor(cyan)
    c.setFont('Helvetica-Bold', 14)
    c.drawCentredString(297, 348, 'Conducción Segura: Flota Liviana')

    # Yellow Warning Box
    c.setFillColor(light_yellow)
    c.setStrokeColor(gold)
    c.setLineWidth(1)
    c.roundRect(30, 260, 535, 55, 6, fill=True, stroke=True)
    c.setFillColor(HexColor('#B45309'))
    c.setFont('Helvetica-Bold', 9)
    c.drawCentredString(297, 292, '• Este comprobante no reemplaza a la licencia de conducir,')
    c.drawCentredString(297, 276, 'único documento habilitante y con validez a los efectos legales.')

    # Center QR Container (positioned cleanly from y=95 to y=245)
    c.setFillColor(navy)
    c.roundRect(205, 95, 185, 150, 10, fill=True, stroke=False)

    # Generate QR Code
    qr_url = f"https://www.vmp-edtech.com/validar/{student['code_url']}"
    qr = qrcode.QRCode(version=1, border=1)
    qr.add_data(qr_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color='#0B172A', back_color='white')
    buf = BytesIO()
    qr_img.save(buf, format='PNG')
    buf.seek(0)

    # QR Image inside card (positioned cleanly without overlap)
    c.drawImage(ImageReader(buf), 244, 132, width=107, height=107)

    c.setFillColor(cyan)
    c.setFont('Helvetica-Bold', 7.5)
    c.drawCentredString(297, 118, 'SCAN TO VERIFY  |  VMP')
    c.setFillColor(HexColor('#FFFFFF'))
    c.setFont('Helvetica-Bold', 9)
    c.drawCentredString(297, 103, f"CÓDIGO: {student['code_display_short']}")

    # Instructor Line (Positioned safely BELOW QR card at y=72, no overlap!)
    c.setFillColor(text_muted)
    c.setFont('Helvetica', 8.5)
    c.drawCentredString(297, 72, 'Acreditado por: Pedro Orejas - Instructor VMP | Mat. N° 2206823')

    # Bottom Logos (Positioned safely at y=33)
    if os.path.exists('scratch/logo_p2_0.png'):
        c.drawImage('scratch/logo_p2_0.png', 30, 33, width=535, height=34, preserveAspectRatio=True)

    # Bottom Footer Bar
    c.setFillColor(navy)
    c.rect(0, 0, 595, 26, fill=True, stroke=False)
    c.setFillColor(HexColor('#FFFFFF'))
    c.setFont('Helvetica-Bold', 9.5)
    c.drawCentredString(297, 9, 'www.vmp-edtech.com')

    c.showPage()
    c.save()

    print(f"✅ Generated Clean Vector PDF: {pdf_path}")

    # Export PNG Previews for Artifact
    doc = fitz.open(pdf_path)
    p1_pix = doc[0].get_pixmap(dpi=150)
    p2_pix = doc[1].get_pixmap(dpi=150)

    art_p1 = os.path.join(artifact_dir, f"credencial_vmp_yaccos_{student['file_name'].lower()}_p1.png")
    art_p2 = os.path.join(artifact_dir, f"credencial_vmp_yaccos_{student['file_name'].lower()}_p2.png")
    p1_pix.save(art_p1)
    p2_pix.save(art_p2)
    print(f"  Exported Previews: {art_p1}, {art_p2}")

    return pdf_path

students_data = [
    {
        'file_name': 'Rosario_Teresa_Araujo',
        'apellido': 'Araujo',
        'nombre': 'Rosario Teresa',
        'dni': '18199704',
        'dni_fmt': '18.199.704',
        'code_display': 'BLT-RT/1294  (VMP-2026-1294)',
        'code_display_short': 'VMP-2026-1294',
        'code_url': 'VMP-2026-1294',
        'fecha_realizacion': '01/08/2026',
        'fecha_vto': '01/08/2028',
        'photo_path': 'scratch/photos/Rosario_Teresa_Araujo_0.jpeg'
    },
    {
        'file_name': 'Norma_Beatriz_Araujo',
        'apellido': 'Araujo',
        'nombre': 'Norma Beatriz',
        'dni': '17377512',
        'dni_fmt': '17.377.512',
        'code_display': 'BLT-RT/1291  (VMP-2026-1291)',
        'code_display_short': 'VMP-2026-1291',
        'code_url': 'VMP-2026-1291',
        'fecha_realizacion': '01/08/2026',
        'fecha_vto': '01/08/2028',
        'photo_path': 'scratch/photos/Norma_Beatriz_Araujo_0.jpeg'
    },
    {
        'file_name': 'Gabriel_Omario_Escobar',
        'apellido': 'Escobar',
        'nombre': 'Gabriel Omario',
        'dni': '17483526',
        'dni_fmt': '17.483.526',
        'code_display': 'BLT-RT/1290  (VMP-2026-1290)',
        'code_display_short': 'VMP-2026-1290',
        'code_url': 'VMP-2026-1290',
        'fecha_realizacion': '01/08/2026',
        'fecha_vto': '01/08/2028',
        'photo_path': 'scratch/photos/Gabriel_Omario_Escobar_0.jpeg'
    },
    {
        'file_name': 'Maria_Silvina_Del_Pino',
        'apellido': 'Del Pino',
        'nombre': 'María Silvina',
        'dni': '18393991',
        'dni_fmt': '18.393.991',
        'code_display': 'BLT-RT/1288  (VMP-2026-1288)',
        'code_display_short': 'VMP-2026-1288',
        'code_url': 'VMP-2026-1288',
        'fecha_realizacion': '01/08/2026',
        'fecha_vto': '01/08/2028',
        'photo_path': 'scratch/photos/Maria_Silvina_Del_Pino_0.jpeg'
    }
]

pdf_files = []
for st in students_data:
    pdf_files.append(build_student_pdf_clean(st))

# Master Combined PDF
master_doc = fitz.open()
for p in pdf_files:
    sub_doc = fitz.open(p)
    master_doc.insert_pdf(sub_doc)

master_pdf_path = os.path.join(output_dir, 'Credenciales_VMP_TRANSPORTE_YACCOS_COMPLETO.pdf')
master_doc.save(master_pdf_path)
print(f"🎉 Created Clean Master Combined PDF (8 pages): {master_pdf_path}")
