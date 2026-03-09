"""
Generador de credenciales VMP - Diseño definitivo.

Cambios respecto a versiones anteriores:
  - Foto: "cover" con clipping redondeado (llena el marco sin distorsión)
  - Franja inferior espejo de la superior (ambas caras)
  - Sócalo inferior: logo VMP · bandera Argentina · logotipo YPF
  - Textos: "CREDENCIAL VÁLIDA" y "CAPACITACIÓN CONDUCCIÓN PREVENTIVA"
"""
import os
from io import BytesIO
import qrcode
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from core.config import settings

# ─── Dimensiones ──────────────────────────────────────────────────────────────
CARD_W = 85.60 * mm
CARD_H = 53.98 * mm
HDR_H  = 9.0 * mm       # franja superior
FTR_H  = 6.5 * mm       # franja inferior (simétrica, ligeramente más delgada)
RIBBON = 0.7 * mm       # cinta teal de separación

# ─── Paleta ───────────────────────────────────────────────────────────────────
SLATE_900 = HexColor("#0F172A")
SLATE_800 = HexColor("#1E293B")
SLATE_600 = HexColor("#475569")
SLATE_400 = HexColor("#94A3B8")
SLATE_100 = HexColor("#F1F5F9")
TEAL      = HexColor("#5EEAD4")
TEAL_D    = HexColor("#2D9E93")
WHITE     = HexColor("#FFFFFF")
AMBER     = HexColor("#D97706")
ARG_BLUE  = HexColor("#74ACDF")
YPF_BLUE  = HexColor("#00326F")
YPF_GOLD  = HexColor("#F6B40E")
SUN_GOLD  = HexColor("#F6AC19")


# ════════════════════════════════════════════════════════════════════════════════
#  HELPERS
# ════════════════════════════════════════════════════════════════════════════════

def generate_credencial_number(year: int, sequential: int) -> str:
    return f"VMP-{year}-{sequential:05d}"


def generate_qr_code(data: str) -> BytesIO:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=1,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf


def _clip_rounded_rect(c, x, y, w, h, r):
    """Crea un clip path de rectángulo redondeado."""
    p = c.beginPath()
    p.moveTo(x + r, y)
    p.lineTo(x + w - r, y)
    p.arcTo(x + w - 2*r, y, x + w, y + 2*r, startAng=-90, extent=90)
    p.lineTo(x + w, y + h - r)
    p.arcTo(x + w - 2*r, y + h - 2*r, x + w, y + h, startAng=0, extent=90)
    p.lineTo(x + r, y + h)
    p.arcTo(x, y + h - 2*r, x + 2*r, y + h, startAng=90, extent=90)
    p.lineTo(x, y + r)
    p.arcTo(x, y, x + 2*r, y + 2*r, startAng=180, extent=90)
    p.close()
    c.clipPath(p, stroke=0, fill=0)


def _draw_photo_cover(c, foto_path, px, py, pw, ph, radius=1.2*mm):
    """Dibuja la foto en modo 'cover': llena el marco, recorta el exceso, esquinas redondeadas."""
    if foto_path and os.path.exists(foto_path):
        try:
            reader = ImageReader(foto_path)
            iw, ih = reader.getSize()          # píxeles
            # Escala "cover": llenar ambas dimensiones, recortar el exceso
            scale = max(pw / iw, ph / ih)
            draw_w = iw * scale
            draw_h = ih * scale
            offset_x = (pw - draw_w) / 2
            offset_y = (ph - draw_h) / 2

            c.saveState()
            _clip_rounded_rect(c, px, py, pw, ph, radius)
            c.drawImage(foto_path,
                        px + offset_x, py + offset_y,
                        draw_w, draw_h,
                        mask="auto")
            c.restoreState()
            return
        except Exception:
            pass

    # Placeholder si no hay foto
    c.setFillColor(SLATE_100)
    c.roundRect(px, py, pw, ph, radius, fill=1, stroke=0)
    # Silueta simple
    c.setFillColor(SLATE_400)
    c.circle(px + pw/2, py + ph * 0.63, pw * 0.18, fill=1, stroke=0)
    c.ellipse(px + pw*0.1, py - ph*0.05,
              px + pw*0.9, py + ph * 0.45, fill=1, stroke=0)


def _draw_field(c, x, y, label, value, large=False, line_len=None):
    c.setFillColor(TEAL_D)
    c.setFont("Helvetica-Bold", 3.2)
    label_y = y + 3.5*mm if large else y + 2.5*mm
    c.drawString(x, label_y, label.upper())

    c.setStrokeColor(SLATE_400)
    c.setLineWidth(0.5)
    length = line_len if line_len else (49*mm if label.lower() == "empresa" else 23*mm)
    c.line(x, y, x + length, y)

    if large:
        c.setFillColor(SLATE_900)
        c.setFont("Helvetica-Bold", 7.0)
        c.drawString(x, y + 0.5*mm, value.upper())
    else:
        c.setFillColor(SLATE_900)
        c.setFont("Helvetica-Bold", 5.2)
        c.drawString(x, y + 0.5*mm, value)


def _draw_argentina_flag(c, cx, cy, w, h):
    """Bandera argentina: 3 franjas + sol."""
    s = h / 3
    # Franja superior azul
    c.setFillColor(ARG_BLUE)
    c.rect(cx - w/2, cy - h/2 + 2*s, w, s, fill=1, stroke=0)
    # Franja blanca
    c.setFillColor(WHITE)
    c.rect(cx - w/2, cy - h/2 + s,   w, s, fill=1, stroke=0)
    # Franja inferior azul
    c.setFillColor(ARG_BLUE)
    c.rect(cx - w/2, cy - h/2,        w, s, fill=1, stroke=0)
    # Sol de Mayo
    c.setFillColor(SUN_GOLD)
    sun_r = s * 0.38
    c.circle(cx, cy, sun_r, fill=1, stroke=0)
    # Rayos del sol (8 rectas)
    import math
    c.setStrokeColor(SUN_GOLD)
    c.setLineWidth(0.3)
    ray_len = sun_r * 0.8
    for i in range(8):
        angle = math.radians(i * 45)
        x1 = cx + math.cos(angle) * (sun_r + 0.3*mm)
        y1 = cy + math.sin(angle) * (sun_r + 0.3*mm)
        x2 = cx + math.cos(angle) * (sun_r + ray_len)
        y2 = cy + math.sin(angle) * (sun_r + ray_len)
        c.line(x1, y1, x2, y2)


def _draw_ypf_logo(c, cx, cy, size):
    """Logotipo YPF: diamante azul con texto blanco."""
    s = size / 2
    # Diamante (cuadrado rotado 45°)
    c.saveState()
    c.translate(cx, cy)
    c.rotate(45)
    c.setFillColor(YPF_BLUE)
    c.rect(-s, -s, size, size, fill=1, stroke=0)
    # Borde dorado fino
    c.setStrokeColor(YPF_GOLD)
    c.setLineWidth(0.25)
    c.rect(-s, -s, size, size, fill=0, stroke=1)
    c.restoreState()
    # Texto YPF blanco encima
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", size * 0.32)
    c.drawCentredString(cx, cy - size * 0.12, "YPF")


def _draw_vmp_logo(c, cx, cy, size):
    """Logo VMP: cuadro teal con 'V' blanco + texto 'VMP'."""
    badge_s = size
    bx = cx - badge_s / 2
    by = cy - badge_s / 2
    # Badge cuadrado redondeado
    c.setFillColor(TEAL)
    c.roundRect(bx, by, badge_s, badge_s, 0.8*mm, fill=1, stroke=0)
    # "V" interior
    c.setFillColor(SLATE_900)
    c.setFont("Helvetica-Bold", size * 0.55)
    c.drawCentredString(cx, by + size * 0.18, "V")
    # Texto "VMP" a la derecha del badge
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", size * 0.5)
    c.drawString(cx + badge_s * 0.65, by + size * 0.22, "VMP")


def _draw_header(c, w, h, front=True):
    """Franja superior: fondo oscuro + cinta teal inferior."""
    c.setFillColor(SLATE_900)
    c.rect(0, h - HDR_H, w, HDR_H, fill=1, stroke=0)
    # Cinta teal bajo el header
    c.setFillColor(TEAL)
    c.rect(0, h - HDR_H - RIBBON, w, RIBBON, fill=1, stroke=0)

    # Logo izquierdo: VMP | EDTECH
    badge_s = 4.5 * mm
    bx, by = 4*mm, h - HDR_H + (HDR_H - badge_s) / 2
    c.setFillColor(TEAL)
    c.roundRect(bx, by, badge_s, badge_s, 0.7*mm, fill=1, stroke=0)
    c.setFillColor(SLATE_900)
    c.setFont("Helvetica-Bold", 5)
    c.drawCentredString(bx + badge_s/2, by + 1.1*mm, "V")
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawString(bx + badge_s + 1.5*mm, h - HDR_H + 2.5*mm, "VMP")
    c.setFillColor(SLATE_600)
    c.setFont("Helvetica", 8.5)
    c.drawString(bx + badge_s + 9.5*mm, h - HDR_H + 2.5*mm, "|")
    c.setFillColor(TEAL)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawString(bx + badge_s + 12*mm, h - HDR_H + 2.5*mm, "EDTECH")

    # Textos derecha
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 3.5)
    c.drawRightString(w - 4*mm, h - 3.8*mm, "CREDENCIAL VÁLIDA")
    c.setFillColor(TEAL)
    c.setFont("Helvetica-Bold", 3.5)
    c.drawRightString(w - 4*mm, h - 5.6*mm, "CAPACITACIÓN CONDUCCIÓN PREVENTIVA")


def _draw_footer(c, w, front=True):
    """Franja inferior: cinta teal en el borde superior + franja oscura limpia."""
    # Cinta teal en la cima del footer (espejo del header)
    c.setFillColor(TEAL)
    c.rect(0, FTR_H, w, RIBBON, fill=1, stroke=0)
    # Fondo oscuro del footer — sin logotipos, diseño limpio
    c.setFillColor(SLATE_900)
    c.rect(0, 0, w, FTR_H, fill=1, stroke=0)


def _draw_left_bar(c, h):
    """Barra decorativa izquierda (entre footer y header)."""
    bar_y = FTR_H + RIBBON
    bar_h = h - HDR_H - RIBBON - FTR_H - RIBBON
    c.setFillColor(TEAL)
    c.rect(0, bar_y, 1.5*mm, bar_h, fill=1, stroke=0)
    c.setFillColor(SLATE_900)
    c.rect(1.5*mm, bar_y, 0.4*mm, bar_h, fill=1, stroke=0)


# ════════════════════════════════════════════════════════════════════════════════
#  FRENTE
# ════════════════════════════════════════════════════════════════════════════════

def draw_credencial_front(c, data, w, h, foto_path=None):
    # ── Fondo ─────────────────────────────────────────────────────────────────
    c.setFillColor(WHITE)
    c.rect(0, 0, w, h, fill=1, stroke=0)

    # Columna derecha levemente diferenciada
    c.setFillColor(HexColor("#F8FAFC"))
    c.rect(55.6*mm, FTR_H + RIBBON, 30*mm, h - HDR_H - RIBBON - FTR_H - RIBBON, fill=1, stroke=0)

    # Watermark VMP muy sutil
    c.saveState()
    c.translate(28*mm, h/2 - 5*mm)
    c.rotate(35)
    c.setFont("Helvetica-Bold", 56)
    c.setFillColor(HexColor("#F1F5F9"))
    c.drawCentredString(0, 0, "VMP")
    c.restoreState()

    # ── Estructuras ───────────────────────────────────────────────────────────
    _draw_left_bar(c, h)
    _draw_header(c, w, h, front=True)
    _draw_footer(c, w, front=True)

    # ── Campos de datos ───────────────────────────────────────────────────────
    left_1 = 4 * mm
    left_2 = 30 * mm

    # Filas: empezamos un poco más abajo del header (+ribbon)
    content_top = h - HDR_H - RIBBON
    y_row1 = content_top - 8 * mm
    y_row2 = content_top - 17 * mm
    y_row3 = content_top - 26 * mm
    y_row4 = content_top - 34.5 * mm

    nombre_completo = data.get("alumno_nombre", "")
    parts = nombre_completo.split(" ", 1)
    nombre   = parts[0]
    apellido = parts[1] if len(parts) > 1 else ""

    _draw_field(c, left_1, y_row1, "Apellido",        apellido, large=True)
    _draw_field(c, left_2, y_row1, "Nombre",          nombre,   large=True)
    _draw_field(c, left_1, y_row2, "DNI / PSP",       data.get("dni", ""))
    _draw_field(c, left_2, y_row2, "Puesto",           data.get("puesto", "Conductor"))
    _draw_field(c, left_1, y_row3, "Empresa",          data.get("empresa_nombre", ""))
    _draw_field(c, left_1, y_row4, "Fecha de Emisión", data.get("fecha_emision", ""))
    _draw_field(c, left_2, y_row4, "Vto.",             data.get("fecha_vencimiento", ""))

    # ── Foto ──────────────────────────────────────────────────────────────────
    photo_size = 18 * mm
    photo_x = 62 * mm
    photo_y = content_top - photo_size - 1 * mm

    # Sombra
    c.setFillColor(HexColor("#CBD5E1"))
    c.roundRect(photo_x + 0.6*mm, photo_y - 0.6*mm, photo_size, photo_size, 1.2*mm, fill=1, stroke=0)

    # Foto con cover fill y bordes redondeados
    _draw_photo_cover(c, foto_path, photo_x, photo_y, photo_size, photo_size, radius=1.2*mm)

    # Marco sobre la foto
    c.setStrokeColor(TEAL_D)
    c.setLineWidth(0.8)
    c.setFillColor(HexColor("#00000000"))
    c.roundRect(photo_x, photo_y, photo_size, photo_size, 1.2*mm, fill=0, stroke=1)

    # ── Firma ─────────────────────────────────────────────────────────────────
    sig_y = FTR_H + RIBBON + 2.5 * mm
    sig_x = 62 * mm
    sig_w = 20 * mm
    sig_h = 9 * mm

    try:
        sig_path = os.path.join(os.path.dirname(__file__), "..", "assets", "signature_clean.png")
        if os.path.exists(sig_path):
            c.drawImage(sig_path, sig_x, sig_y + 3*mm, width=sig_w, height=sig_h,
                        mask="auto", preserveAspectRatio=True)
    except Exception:
        pass

    c.setStrokeColor(SLATE_400)
    c.setLineWidth(0.5)
    c.line(sig_x - 1*mm, sig_y + 3.2*mm, sig_x + sig_w + 1*mm, sig_y + 3.2*mm)

    c.setFillColor(SLATE_900)
    c.setFont("Helvetica-Bold", 3.2)
    c.drawCentredString(sig_x + sig_w/2, sig_y + 1.5*mm, "Pedro Orejas")
    c.setFillColor(SLATE_600)
    c.setFont("Helvetica-Bold", 2.3)
    c.drawCentredString(sig_x + sig_w/2, sig_y, "Instructor VMP | Mat. N° 2206825")


# ════════════════════════════════════════════════════════════════════════════════
#  DORSO
# ════════════════════════════════════════════════════════════════════════════════

def draw_credencial_back(c, data, w, h):
    # ── Fondo ─────────────────────────────────────────────────────────────────
    c.setFillColor(WHITE)
    c.rect(0, 0, w, h, fill=1, stroke=0)

    # Watermark EDTECH
    c.saveState()
    c.translate(w/2, h/2 - 4*mm)
    c.rotate(30)
    c.setFont("Helvetica-Bold", 48)
    c.setFillColor(HexColor("#F1F5F9"))
    c.drawCentredString(0, 0, "EDTECH")
    c.restoreState()

    # ── Estructuras ───────────────────────────────────────────────────────────
    # Barra izquierda con teal oscuro en reverso
    bar_y = FTR_H + RIBBON
    bar_h = h - HDR_H - RIBBON - FTR_H - RIBBON
    c.setFillColor(TEAL_D)
    c.rect(0, bar_y, 1.5*mm, bar_h, fill=1, stroke=0)
    c.setFillColor(SLATE_900)
    c.rect(1.5*mm, bar_y, 0.4*mm, bar_h, fill=1, stroke=0)

    _draw_header(c, w, h, front=False)
    _draw_footer(c, w, front=False)

    # ── Contenido central ─────────────────────────────────────────────────────
    content_top = h - HDR_H - RIBBON
    content_bot = FTR_H + RIBBON

    cx = w / 2
    c.setFillColor(SLATE_900)
    c.setFont("Helvetica-Bold", 4.5)
    c.drawCentredString(cx, content_top - 7*mm,
                        "Esta credencial certifica que su titular ha aprobado la capacitación de:")

    c.setFillColor(TEAL_D)
    c.setFont("Helvetica-Bold", 8)
    curso = data.get("curso_nombre", "")
    c.drawCentredString(cx, content_top - 13.5*mm, curso)

    # Línea separadora
    c.setStrokeColor(SLATE_100)
    c.setLineWidth(0.4)
    c.line(4*mm, content_top - 17*mm, w - 4*mm, content_top - 17*mm)

    # Warning Box
    box_w = w - 8*mm
    box_h = 7*mm
    box_y = content_top - 26*mm
    box_x = 4*mm

    c.setFillColor(HexColor("#FFFBEB"))
    c.roundRect(box_x, box_y, box_w, box_h, 1*mm, fill=1, stroke=0)
    c.setFillColor(HexColor("#F59E0B"))
    c.roundRect(box_x, box_y, 1.8*mm, box_h, 0.8*mm, fill=1, stroke=0)

    c.setFillColor(HexColor("#92400E"))
    c.setFont("Helvetica", 3.2)
    c.drawString(box_x + 8*mm, box_y + 3.8*mm,
                 "Este comprobante no reemplaza a la licencia de conducir, único documento habilitante")
    c.drawString(box_x + 8*mm, box_y + 1.5*mm,
                 "y con validez a los efectos legales.")
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(HexColor("#F59E0B"))
    c.drawString(box_x + 3.5*mm, box_y + 1.6*mm, "!")

    # ── Footer de datos (entre warning y sócalo) ──────────────────────────────
    foot_area_y = content_bot + 1.5*mm    # margen sobre el sócalo

    # Separator
    c.setStrokeColor(SLATE_100)
    c.setLineWidth(0.4)
    c.line(4*mm, foot_area_y + 10.5*mm, w - 4*mm, foot_area_y + 10.5*mm)

    # Carga horaria
    ch_x = 4*mm
    c.setFillColor(SLATE_100)
    c.setStrokeColor(SLATE_400)
    c.setLineWidth(0.3)
    c.roundRect(ch_x, foot_area_y + 1*mm, 16*mm, 7*mm, 1.5*mm, fill=1, stroke=1)
    c.setFillColor(SLATE_600)
    c.setFont("Helvetica-Bold", 3)
    c.drawCentredString(ch_x + 8*mm, foot_area_y + 5.6*mm, "CARGA HORARIA")
    c.setFillColor(SLATE_900)
    c.setFont("Helvetica-Bold", 7)
    c.drawCentredString(ch_x + 8*mm, foot_area_y + 2.5*mm, "8 HORAS")

    # Firma dorso
    sig2_x = 26*mm
    sig2_w = 16*mm
    sig2_h = 7*mm
    c.setFillColor(SLATE_400)
    c.setFont("Helvetica-Bold", 2.8)
    c.drawCentredString(sig2_x + sig2_w/2, foot_area_y + 9*mm, "ACREDITADO POR")
    try:
        sig_path = os.path.join(os.path.dirname(__file__), "..", "assets", "signature_clean.png")
        if os.path.exists(sig_path):
            c.drawImage(sig_path, sig2_x, foot_area_y + 1.5*mm,
                        width=sig2_w, height=sig2_h, mask="auto", preserveAspectRatio=True)
    except Exception:
        pass
    c.setFillColor(SLATE_900)
    c.setFont("Helvetica-Bold", 2.8)
    c.drawCentredString(sig2_x + sig2_w/2, foot_area_y + 0.5*mm, "Pedro Orejas")

    # Fechas
    dates_x = 48*mm
    c.setFillColor(SLATE_600)
    c.setFont("Helvetica", 2.8)
    c.drawString(dates_x, foot_area_y + 6.5*mm, f"EMISIÓN  {data.get('fecha_emision', '')}")
    c.setFillColor(AMBER)
    c.setFont("Helvetica-Bold", 2.8)
    c.drawString(dates_x, foot_area_y + 3.8*mm, f"VENCE    {data.get('fecha_vencimiento', '')}")

    # QR
    if data.get("qr_url"):
        qr_buf = generate_qr_code(data["qr_url"])
        qr_size = 9.5*mm
        qr_x = w - 4*mm - qr_size
        c.drawImage(ImageReader(qr_buf), qr_x, foot_area_y, qr_size, qr_size,
                    mask="auto", preserveAspectRatio=True)
    c.setFillColor(SLATE_800)
    c.setFont("Helvetica-Bold", 2.5)
    c.drawRightString(w - 4*mm, foot_area_y + 11.2*mm,
                      f"N°: {data.get('numero_credencial', '')}")


# ════════════════════════════════════════════════════════════════════════════════
#  API PÚBLICA
# ════════════════════════════════════════════════════════════════════════════════

async def create_credencial_pdf(credencial_data: dict, foto_path: str = None) -> bytes:
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=(CARD_W, CARD_H))
    draw_credencial_front(c, credencial_data, CARD_W, CARD_H, foto_path)
    c.showPage()
    draw_credencial_back(c, credencial_data, CARD_W, CARD_H)
    c.save()
    buffer.seek(0)
    return buffer.getvalue()


async def save_credencial_pdf(pdf_bytes: bytes, filename: str) -> str:
    storage_path = os.path.join(settings.STORAGE_PATH, "credenciales")
    os.makedirs(storage_path, exist_ok=True)
    file_path = os.path.join(storage_path, filename)
    with open(file_path, "wb") as f:
        f.write(pdf_bytes)
    return f"/storage/credenciales/{filename}"
