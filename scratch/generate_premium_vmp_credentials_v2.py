import os, sys, fitz, qrcode, math
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

template_pdf = '/Users/matias/.gemini/antigravity/brain/be0298fa-fa80-4c0d-ab29-599f37a05f60/.user_uploaded/media__1785695294284.pdf'
output_dir = '/Users/matias/Desktop/Credenciales_VMP_TRANSPORTE_YACCOS'
artifact_dir = '/Users/matias/.gemini/antigravity/brain/be0298fa-fa80-4c0d-ab29-599f37a05f60'
os.makedirs(output_dir, exist_ok=True)

def generate_qr_bytes(url: str) -> bytes:
    qr = qrcode.QRCode(version=1, border=1)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color='#0B172A', back_color='white')
    buf = BytesIO()
    img.save(buf, format='PNG')
    return buf.getvalue()

def create_guilloche_overlay(w_pt=595, h_pt=400) -> bytes:
    scale = 4.0
    w = int(w_pt * scale)
    h = int(h_pt * scale)
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Guilloché Security Wave Mesh
    mesh_color = (0, 180, 182, 18) # subtle cyan wave
    for i in range(-200, w + 200, 50):
        points = []
        for y in range(0, h, 8):
            x = i + math.sin(y * 0.015 + i * 0.03) * 22 + math.cos(y * 0.008) * 15
            points.append((x, y))
        draw.line(points, fill=mesh_color, width=2)

    # 2. Gold Metallic Holographic Seal (Page 1 Bottom Right / Center)
    seal_x = int(525 * scale)
    seal_y = int(320 * scale)
    r = int(34 * scale)

    # Outer serrated gold starburst points
    num_points = 24
    star_points = []
    for i in range(num_points):
        angle = i * (2 * math.pi / num_points)
        r_curr = r if i % 2 == 0 else r - 6
        px = seal_x + r_curr * math.cos(angle)
        py = seal_y + r_curr * math.sin(angle)
        star_points.append((px, py))
    draw.polygon(star_points, fill='#D4AF37', outline='#B8860B')

    # Inner Gold Circles
    draw.ellipse([seal_x - r + 8, seal_y - r + 8, seal_x + r - 8, seal_y + r - 8], fill='#FFFDF0', outline='#B8860B', width=3)
    draw.ellipse([seal_x - r + 14, seal_y - r + 14, seal_x + r - 14, seal_y + r - 14], outline='#D4AF37', width=2)

    # Seal Text
    try:
        font_seal = ImageFont.truetype('/tmp/premium_fonts/Montserrat-Bold.ttf', int(4.5 * scale))
    except Exception:
        font_seal = ImageFont.load_default()

    draw.text((seal_x - int(18*scale), seal_y - int(10*scale)), "SELLO OFICIAL", fill='#0B172A', font=font_seal)
    draw.text((seal_x - int(16*scale), seal_y - int(3*scale)), "★ VMP EDTECH ★", fill='#00B4B6', font=font_seal)
    draw.text((seal_x - int(19*scale), seal_y + int(4*scale)), "ISO 9001 ACREDITADO", fill='#B8860B', font=font_seal)

    buf = BytesIO()
    img.save(buf, format='PNG')
    return buf.getvalue()

def process_student_pdf_v2(student):
    doc = fitz.open(template_pdf)
    guilloche_bytes = create_guilloche_overlay(595, 400)

    # ---------------- PAGE 1 (FRENTE) ----------------
    p1 = doc[0]

    # Insert Guilloché & Metallic Seal overlay
    p1.insert_image(fitz.Rect(0, 0, 595, 400), stream=guilloche_bytes)

    # 1. Header Company Name
    p1.add_redact_annot(fitz.Rect(30, 26, 260, 56), fill=(11/255, 23/255, 42/255))

    # 2. Student Photo Area
    photo_rect = fitz.Rect(31, 94, 206, 339)
    p1.add_redact_annot(photo_rect, fill=(1, 1, 1))

    # 3. Student Name
    p1.add_redact_annot(fitz.Rect(220, 96, 560, 122), fill=(247/255, 251/255, 251/255))

    # 4. DNI Value
    p1.add_redact_annot(fitz.Rect(325, 127, 480, 143), fill=(237/255, 248/255, 248/255))

    # 5. N° Credencial Value
    p1.add_redact_annot(fitz.Rect(325, 143, 480, 160), fill=(237/255, 248/255, 248/255))

    # 6. Fecha Realización
    p1.add_redact_annot(fitz.Rect(430, 239, 555, 255), fill=(1, 1, 1))

    # 7. Fecha Vencimiento
    p1.add_redact_annot(fitz.Rect(430, 261, 555, 277), fill=(1, 1, 1))

    p1.apply_redactions()

    # Insert Photo with Executive Frame
    if os.path.exists(student['photo_path']):
        p1.insert_image(photo_rect, filename=student['photo_path'])

    # Dual-Border Photo Frame Overlay
    frame_outer = fitz.Rect(30, 93, 207, 340)
    p1.draw_rect(frame_outer, color=(11/255, 23/255, 42/255), width=1.5)
    frame_inner = fitz.Rect(31.5, 94.5, 205.5, 338.5)
    p1.draw_rect(frame_inner, color=(0, 180/255, 182/255), width=0.75)

    # Top VERIFICADO badge
    badge_rect = fitz.Rect(37, 101, 127, 117)
    p1.add_redact_annot(badge_rect, fill=(11/255, 23/255, 42/255))
    p1.apply_redactions()
    p1.insert_text(fitz.Point(45, 113), 'VERIFICADO', fontname='hebo', fontsize=9, color=(0, 180/255, 182/255))

    # Bottom Active Status Pill on Photo
    status_pill = fitz.Rect(40, 318, 197, 333)
    p1.add_redact_annot(status_pill, fill=(11/255, 23/255, 42/255))
    p1.apply_redactions()
    p1.insert_text(fitz.Point(46, 329), 'ESTADO: ACTIVO & ACREDITADO', fontname='hebo', fontsize=7.5, color=(1, 1, 1))

    # Insert Header Text
    p1.insert_text(fitz.Point(32, 48), 'TRANSPORTE YACCOS', fontname='hebo', fontsize=18, color=(1, 1, 1))

    # Insert Student Name
    name_str = f"{student['apellido'].upper()}, {student['nombre'].upper()}"
    p1.insert_text(fitz.Point(224, 116), name_str, fontname='hebo', fontsize=15, color=(11/255, 23/255, 42/255))

    # Insert DNI (Monospaced style spacing)
    p1.insert_text(fitz.Point(330, 138), student['dni'], fontname='hebo', fontsize=11, color=(11/255, 23/255, 42/255))

    # Insert N° Credencial
    p1.insert_text(fitz.Point(330, 154), student['code_display'], fontname='hebo', fontsize=11, color=(11/255, 23/255, 42/255))

    # Insert Fechas
    p1.insert_text(fitz.Point(435, 250), student['fecha_realizacion'], fontname='hebo', fontsize=11, color=(11/255, 23/255, 42/255))
    p1.insert_text(fitz.Point(435, 272), student['fecha_vto'], fontname='hebo', fontsize=11, color=(11/255, 23/255, 42/255))

    # Microtext Security Line under right card
    p1.insert_text(fitz.Point(241, 288), "• VMP EDTECH CAPACITACIÓN OFICIAL YACCOS • ACREDITADO POR PEDRO OREJAS MAT 2206823 •", fontname='helv', fontsize=4.5, color=(100/255, 116/255, 139/255))

    # ---------------- PAGE 2 (REVERSO) ----------------
    p2 = doc[1]

    # Insert Guilloché overlay on Page 2
    p2.insert_image(fitz.Rect(0, 0, 595, 400), stream=guilloche_bytes)

    # Redact QR area inside navy card
    p2.add_redact_annot(fitz.Rect(238, 165, 356, 299), fill=(11/255, 23/255, 42/255))
    p2.apply_redactions()

    # Generate QR image bytes
    qr_url = f"https://www.vmp-edtech.com/validar/{student['code_url']}"
    qr_bytes = generate_qr_bytes(qr_url)

    # Insert QR Image
    p2.insert_image(fitz.Rect(240, 167, 354, 281), stream=qr_bytes)

    # Insert Code text
    p2.insert_text(fitz.Point(243, 295), f"CÓDIGO: {student['code_display']}", fontname='hebo', fontsize=9.5, color=(1, 1, 1))

    # Apple / Google Wallet Integration Badge on Page 2
    p2.insert_text(fitz.Point(215, 312), "📲 Credencial Digital compatible con Apple Wallet & Google Wallet", fontname='helv', fontsize=7, color=(100/255, 116/255, 139/255))

    # Save output single 2-page PDF
    out_pdf = os.path.join(output_dir, f"Credencial_VMP_{student['file_name']}.pdf")
    doc.save(out_pdf)
    print(f"✅ Created Premium 2-Page Vector PDF: {out_pdf}")

    # Export PNG previews at 150 DPI for artifact carousel
    p1_pix = p1.get_pixmap(dpi=150)
    p2_pix = p2.get_pixmap(dpi=150)

    art_p1 = os.path.join(artifact_dir, f"credencial_vmp_yaccos_{student['file_name'].lower()}_p1.png")
    art_p2 = os.path.join(artifact_dir, f"credencial_vmp_yaccos_{student['file_name'].lower()}_p2.png")
    p1_pix.save(art_p1)
    p2_pix.save(art_p2)
    print(f"  Exported PNG Previews: {art_p1}, {art_p2}")

    return out_pdf

students_data = [
    {
        'file_name': 'Rosario_Teresa_Araujo',
        'apellido': 'Araujo',
        'nombre': 'Rosario Teresa',
        'dni': '18199704',
        'code_display': 'BLT-RT/1294',
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
        'code_display': 'BLT-RT/1291',
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
        'code_display': 'BLT-RT/1290',
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
        'code_display': 'BLT-RT/1288',
        'code_url': 'VMP-2026-1288',
        'fecha_realizacion': '01/08/2026',
        'fecha_vto': '01/08/2028',
        'photo_path': 'scratch/photos/Maria_Silvina_Del_Pino_0.jpeg'
    }
]

# Generate individual 2-page PDFs
pdf_files = []
for st in students_data:
    pdf_files.append(process_student_pdf_v2(st))

# Master Combined PDF
master_doc = fitz.open()
for p in pdf_files:
    sub_doc = fitz.open(p)
    master_doc.insert_pdf(sub_doc)

master_pdf_path = os.path.join(output_dir, 'Credenciales_VMP_TRANSPORTE_YACCOS_COMPLETO.pdf')
master_doc.save(master_pdf_path)
print(f"🎉 Created Premium Master Combined PDF (8 pages): {master_pdf_path}")
