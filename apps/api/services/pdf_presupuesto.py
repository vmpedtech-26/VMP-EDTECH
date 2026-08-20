"""
Servicio de generación de PDF para Presupuestos HSE - VMP EDTECH
Estética institucional: navy #060D1A, teal #0D9488, orange #F97316
"""
import os
import json
import logging
from io import BytesIO
from datetime import datetime
from typing import Optional

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas as rl_canvas

try:
    from PIL import Image as PILImage, ImageDraw
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

logger = logging.getLogger(__name__)

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STORAGE_DIR = os.path.join(BASE_DIR, "storage", "presupuestos")
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
COVER_BG_PATH = os.path.join(ASSETS_DIR, "vmp_presupuesto_cover_bg.png")
COVER_SRC_PATH = os.path.join(ASSETS_DIR, "vmp_cover.png")

os.makedirs(STORAGE_DIR, exist_ok=True)
os.makedirs(ASSETS_DIR, exist_ok=True)


def prepare_cover_bg():
    """Prepara la imagen de fondo de la portada si hay fuente disponible."""
    if os.path.exists(COVER_BG_PATH):
        return COVER_BG_PATH
    if not PIL_AVAILABLE or not os.path.exists(COVER_SRC_PATH):
        return None
    try:
        base_img = PILImage.open(COVER_SRC_PATH).convert('RGBA')
        target_w, target_h = 1240, 1754
        img_w, img_h = base_img.size
        scale = max(target_w / img_w, target_h / img_h)
        new_w, new_h = int(img_w * scale), int(img_h * scale)
        resized = base_img.resize((new_w, new_h), PILImage.Resampling.LANCZOS)
        left = (new_w - target_w) // 2
        top = (new_h - target_h) // 2
        cropped = resized.crop((left, top, left + target_w, top + target_h))

        overlay = PILImage.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        for y in range(target_h):
            factor = y / target_h
            if factor < 0.30:
                alpha = int(245 - (factor / 0.30) * 35)
            elif factor < 0.60:
                alpha = int(210 - ((factor - 0.30) / 0.30) * 45)
            elif factor < 0.78:
                alpha = int(165 + ((factor - 0.60) / 0.18) * 75)
            else:
                alpha = int(240 + ((factor - 0.78) / 0.22) * 15)
            draw.line([(0, y), (target_w, y)], fill=(6, 13, 26, alpha))

        final = PILImage.alpha_composite(cropped, overlay)
        final.save(COVER_BG_PATH, 'PNG')
        return COVER_BG_PATH
    except Exception as e:
        logger.warning(f"No se pudo preparar imagen de portada: {e}")
        return None


def draw_cover_background(canvas_obj, doc_obj):
    """Dibuja el fondo de la portada."""
    canvas_obj.saveState()
    bg_path = prepare_cover_bg()
    if bg_path and os.path.exists(bg_path):
        canvas_obj.drawImage(bg_path, 0, 0, width=595.27, height=841.89)
    else:
        canvas_obj.setFillColor(colors.HexColor('#060D1A'))
        canvas_obj.rect(0, 0, 595.27, 841.89, fill=1, stroke=0)

    # Bandas decorativas
    canvas_obj.setFillColor(colors.HexColor('#0D9488'))
    canvas_obj.rect(0, 828, 595.27, 14, fill=1, stroke=0)
    canvas_obj.setFillColor(colors.HexColor('#F97316'))
    canvas_obj.rect(0, 824, 595.27, 4, fill=1, stroke=0)
    canvas_obj.setFillColor(colors.HexColor('#0D9488'))
    canvas_obj.rect(0, 0, 595.27, 12, fill=1, stroke=0)
    canvas_obj.setFillColor(colors.HexColor('#F97316'))
    canvas_obj.rect(0, 12, 595.27, 3, fill=1, stroke=0)
    canvas_obj.restoreState()


class PresupuestoCanvas(rl_canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_decorations(self, page_count):
        if self._pageNumber == 1:
            return
        self.saveState()
        self.setFillColor(colors.HexColor('#0F172A'))
        self.setFont("Helvetica-Bold", 8)
        self.drawString(42, 812, "VMP SAS | VMP - EDTECH (CUIT: 30-71936908-8)")
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor('#64748B'))
        numero = getattr(self, '_numero_cotizacion', 'VMP-2026-XXX')
        self.drawRightString(553, 812, f"COTIZACIÓN N.º: {numero} | PROPUESTA ECONÓMICA")
        self.setStrokeColor(colors.HexColor('#0D9488'))
        self.setLineWidth(1.2)
        self.line(42, 804, 553, 804)
        self.setStrokeColor(colors.HexColor('#F97316'))
        self.setLineWidth(0.8)
        self.line(42, 801.5, 553, 801.5)
        self.setStrokeColor(colors.HexColor('#CBD5E1'))
        self.setLineWidth(0.5)
        self.line(42, 38, 553, 38)
        self.setFont("Helvetica-Bold", 7)
        self.setFillColor(colors.HexColor('#0F766E'))
        self.drawString(42, 26, "VMP SAS")
        self.setFont("Helvetica", 6.8)
        self.setFillColor(colors.HexColor('#64748B'))
        self.drawString(82, 26, "• CUIT: 30-71936908-8 • Neuquén • administracion@vmp-edtech.com • www.vmp-edtech.com")
        self.drawRightString(553, 26, f"Página {self._pageNumber} de {page_count}")
        self.restoreState()


def generar_pdf_presupuesto(data: dict) -> bytes:
    """
    Genera el PDF del presupuesto HSE y retorna bytes.
    
    data keys:
      numero_cotizacion, cliente_nombre, cliente_cuit,
      recurso_nombre, recurso_titulo, recurso_matricula,
      fecha_emision, fecha_desde, fecha_hasta, jornadas,
      horario, lugar, importe_neto, iva, total,
      items (list of dicts: codigo, concepto, unidad, cantidad, precio_unitario, importe),
      alcance_texto, entregables_texto, exclusiones_texto, condiciones_texto
    """
    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=42, rightMargin=42,
        topMargin=46, bottomMargin=46
    )

    styles = getSampleStyleSheet()
    C_NAVY = colors.HexColor('#060D1A')
    C_TEAL = colors.HexColor('#0D9488')
    C_DARK_TEAL = colors.HexColor('#0F766E')
    C_CYAN = colors.HexColor('#2DD4BF')
    C_LIGHT_TEAL = colors.HexColor('#F0FDFA')
    C_ORANGE = colors.HexColor('#F97316')
    C_DARK = colors.HexColor('#1E293B')
    C_SLATE = colors.HexColor('#475569')
    C_BORDER = colors.HexColor('#CBD5E1')
    C_BG_BOX = colors.HexColor('#F8FAFC')
    C_CARD_COVER = colors.HexColor('#08101E')

    s_cover_brand = ParagraphStyle('CB', fontName='Helvetica-Bold', fontSize=26, leading=30, textColor=C_CYAN)
    s_cover_subbrand = ParagraphStyle('CSB', fontName='Helvetica-Bold', fontSize=8.5, leading=12, textColor=colors.HexColor('#94A3B8'))
    s_cover_title = ParagraphStyle('CT', fontName='Helvetica-Bold', fontSize=18, leading=22, textColor=colors.white)
    s_cover_subtitle = ParagraphStyle('CS', fontName='Helvetica', fontSize=10, leading=14, textColor=colors.HexColor('#E2E8F0'))
    s_cover_tag = ParagraphStyle('CTG', fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=C_ORANGE)

    body = ParagraphStyle('Body', fontName='Helvetica', fontSize=7.5, leading=11, textColor=C_DARK, spaceBefore=1.5, spaceAfter=2.5)
    bullet = ParagraphStyle('Bullet', parent=body, leftIndent=10, firstLineIndent=-6, spaceBefore=1, spaceAfter=1.5)
    table_cell = ParagraphStyle('TC', fontName='Helvetica', fontSize=7.2, leading=9.6, textColor=C_DARK)
    table_cell_bold = ParagraphStyle('TCB', parent=table_cell, fontName='Helvetica-Bold', textColor=C_NAVY)
    table_header = ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=7.2, leading=9.6, textColor=colors.white)

    numero = data.get('numero_cotizacion', 'VMP-2026-XXX')
    cliente_nombre = data.get('cliente_nombre', '')
    cliente_cuit = data.get('cliente_cuit', '')
    recurso_nombre = data.get('recurso_nombre', '')
    recurso_titulo = data.get('recurso_titulo', 'Técnico en Higiene y Seguridad')
    recurso_matricula = data.get('recurso_matricula', '')
    fecha_emision = data.get('fecha_emision', datetime.now().strftime('%d/%m/%Y'))
    fecha_desde = data.get('fecha_desde', '')
    fecha_hasta = data.get('fecha_hasta', '')
    jornadas = data.get('jornadas', 1)
    horario = data.get('horario', '09:00 a 18:00 hs')
    lugar = data.get('lugar', 'Neuquén')
    importe_neto = data.get('importe_neto', 0.0)
    iva = data.get('iva', 0.0)
    total = data.get('total', 0.0)
    items = data.get('items', [])
    alcance = data.get('alcance_texto', '') or DEFAULT_ALCANCE
    entregables = data.get('entregables_texto', '') or DEFAULT_ENTREGABLES
    exclusiones = data.get('exclusiones_texto', '') or DEFAULT_EXCLUSIONES
    condiciones = data.get('condiciones_texto', '') or DEFAULT_CONDICIONES

    def make_header_banner(title_text):
        p = Paragraph(f"<b>{title_text.upper()}</b>", ParagraphStyle('Bann', fontName='Helvetica-Bold', fontSize=9.2, leading=11.5, textColor=C_NAVY))
        t = Table([[p]], colWidths=[511])
        t.setStyle(TableStyle([
            ('LINELEFT', (0,0), (0,0), 3.5, C_TEAL),
            ('TOPPADDING', (0,0), (-1,-1), 2.5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ]))
        return t

    story = []

    # ─── PÁGINA 1: PORTADA ───
    story.append(Spacer(1, 35))
    story.append(Paragraph("VMP SAS", s_cover_brand))
    story.append(Paragraph("UNIDAD DE NEGOCIOS: VMP - EDTECH | SERVICIOS TÉCNICOS & CAPACITACIÓN HSE", s_cover_subbrand))
    story.append(Spacer(1, 24))

    title_block = [
        [Paragraph("PROPUESTA ECONÓMICA Y TÉCNICA", s_cover_title)],
        [Paragraph("SERVICIO TÉCNICO ESPECIALIZADO EN HIGIENE Y SEGURIDAD", ParagraphStyle('CoverSubTitle2', parent=s_cover_title, fontSize=13.5, leading=17.5, textColor=C_CYAN))],
        [Paragraph("Asignación de Recurso Técnico Profesional Matriculado en Campo", s_cover_subtitle)],
        [Paragraph(f"CLIENTE DESTINATARIO: {cliente_nombre} (CUIT: {cliente_cuit})", s_cover_tag)],
        [Paragraph(f"Presupuesto Oficial N.º: <b>{numero}</b> | Fecha de Emisión: <b>{fecha_emision}</b> | Validez: <b>5 días</b>",
                   ParagraphStyle('CML', parent=body, fontSize=8, leading=11, textColor=colors.HexColor('#E2E8F0')))],
    ]
    t_title = Table(title_block, colWidths=[495])
    t_title.setStyle(TableStyle([
        ('LINELEFT', (0,0), (0,-1), 3.5, C_CYAN),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_title)
    story.append(Spacer(1, 145))

    resumen = [
        [Paragraph("<b>Prestador del Servicio:</b>", ParagraphStyle('P1', parent=table_cell, textColor=colors.HexColor('#94A3B8'))),
         Paragraph("<b>VMP SAS</b> (CUIT: <b>30-71936908-8</b>) • División <b>VMP - EDTECH</b>", ParagraphStyle('P2', parent=table_cell, textColor=colors.white))],
        [Paragraph("<b>Empresa Contratante:</b>", ParagraphStyle('P1', parent=table_cell, textColor=colors.HexColor('#94A3B8'))),
         Paragraph(f"<b>{cliente_nombre}</b> (CUIT: <b>{cliente_cuit}</b>)", ParagraphStyle('P2', parent=table_cell, textColor=colors.white))],
        [Paragraph("<b>Recurso Técnico Asignado:</b>", ParagraphStyle('P1', parent=table_cell, textColor=colors.HexColor('#94A3B8'))),
         Paragraph(f"<b>{recurso_nombre}</b> — {recurso_titulo} (Matrícula {recurso_matricula})", ParagraphStyle('P2', parent=table_cell, textColor=C_CYAN))],
        [Paragraph("<b>Período y Dedicación:</b>", ParagraphStyle('P1', parent=table_cell, textColor=colors.HexColor('#94A3B8'))),
         Paragraph(f"Desde <b>{fecha_desde}</b> hasta <b>{fecha_hasta}</b> ({jornadas} jornadas de 8 hs - Presencial)", ParagraphStyle('P2', parent=table_cell, textColor=colors.white))],
        [Paragraph("<b>Lugar de Prestación:</b>", ParagraphStyle('P1', parent=table_cell, textColor=colors.HexColor('#94A3B8'))),
         Paragraph(f"{lugar}", ParagraphStyle('P2', parent=table_cell, textColor=colors.white))],
        [Paragraph("<b>Importe Total de la Oferta:</b>", ParagraphStyle('P1', parent=table_cell, textColor=colors.HexColor('#94A3B8'))),
         Paragraph(f"<b>$ {importe_neto:,.2f} + IVA ($ {iva:,.2f}) = $ {total:,.2f} FINAL</b>",
                   ParagraphStyle('P3', parent=table_cell, textColor=C_ORANGE, fontName='Helvetica-Bold'))],
    ]
    t_resumen = Table(resumen, colWidths=[130, 365])
    t_resumen.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_CARD_COVER),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#1E293B')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('LINEBELOW', (0,0), (-1,-2), 0.4, colors.HexColor('#132138')),
    ]))
    story.append(t_resumen)
    story.append(PageBreak())

    # ─── PÁGINA 2: DATOS, RECURSO, ALCANCE ───
    story.append(make_header_banner("1. Datos de las Partes y Condiciones Iniciales"))
    story.append(Spacer(1, 3))
    partes_data = [
        [Paragraph("<b>Prestador:</b>", table_cell_bold), Paragraph("VMP SAS — CUIT: 30-71936908-8 (VMP - EDTECH)", table_cell),
         Paragraph("<b>Fecha:</b>", table_cell_bold), Paragraph(fecha_emision, table_cell)],
        [Paragraph("<b>Contratante:</b>", table_cell_bold), Paragraph(f"{cliente_nombre} — CUIT: {cliente_cuit}", table_cell),
         Paragraph("<b>Vigencia:</b>", table_cell_bold), Paragraph("5 días corridos", table_cell)],
        [Paragraph("<b>Lugar:</b>", table_cell_bold), Paragraph(lugar, table_cell),
         Paragraph("<b>Período:</b>", table_cell_bold), Paragraph(f"{fecha_desde} al {fecha_hasta}", table_cell)],
    ]
    t_partes = Table(partes_data, colWidths=[70, 235, 55, 151])
    t_partes.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_BG_BOX),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_partes)
    story.append(Spacer(1, 5))

    story.append(make_header_banner("2. Recurso Técnico Asignado"))
    story.append(Spacer(1, 3))
    recurso_data = [
        [Paragraph("<b>Recurso:</b>", table_cell_bold), Paragraph(recurso_nombre, table_cell)],
        [Paragraph("<b>Título/Cargo:</b>", table_cell_bold), Paragraph(recurso_titulo, table_cell)],
        [Paragraph("<b>Matrícula:</b>", table_cell_bold), Paragraph(recurso_matricula, table_cell)],
    ]
    t_recurso = Table(recurso_data, colWidths=[120, 391])
    t_recurso.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_LIGHT_TEAL),
        ('BOX', (0,0), (-1,-1), 1, C_TEAL),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#99F6E4')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_recurso)
    story.append(Spacer(1, 5))

    story.append(make_header_banner("3. Modalidad y Dedicación"))
    story.append(Spacer(1, 3))
    ded_data = [
        [Paragraph(f"<b>Jornadas:</b> {jornadas} días", table_cell), Paragraph(f"<b>Horario:</b> {horario}", table_cell)],
        [Paragraph("<b>Modalidad:</b> Presencial", table_cell), Paragraph(f"<b>Lugar:</b> {lugar}", table_cell)]
    ]
    t_ded = Table(ded_data, colWidths=[255, 256])
    t_ded.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_BG_BOX),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_ded)
    story.append(Spacer(1, 5))

    story.append(make_header_banner("4. Alcance Técnico del Servicio"))
    story.append(Spacer(1, 2))
    for line in alcance.strip().split('\n'):
        if line.strip():
            story.append(Paragraph(line.strip(), bullet if line.strip().startswith('•') else body))
    story.append(Spacer(1, 5))

    story.append(make_header_banner("5. Entregables"))
    story.append(Spacer(1, 2))
    for line in entregables.strip().split('\n'):
        if line.strip():
            story.append(Paragraph(line.strip(), body))

    story.append(PageBreak())

    # ─── PÁGINA 3: PROPUESTA ECONÓMICA ───
    story.append(make_header_banner("6. Propuesta Económica y Cuadro Tarifario"))
    story.append(Spacer(1, 3))

    econ_header = [
        Paragraph("Código / Concepto", table_header),
        Paragraph("Unidad", table_header),
        Paragraph("Cant.", table_header),
        Paragraph("P. Unitario", table_header),
        Paragraph("Importe Neto", table_header)
    ]
    econ_rows = []
    for item in items:
        precio = item.get('precio_unitario', 0)
        importe = item.get('importe', 0)
        econ_rows.append([
            Paragraph(f"<b>[{item.get('codigo', '')}]</b> {item.get('concepto', '')}", table_cell),
            Paragraph(item.get('unidad', ''), table_cell),
            Paragraph(str(item.get('cantidad', '')), table_cell),
            Paragraph(f"$ {precio:,.2f}", ParagraphStyle('TR', parent=table_cell, alignment=TA_RIGHT)),
            Paragraph(f"<b>$ {importe:,.2f}</b>", ParagraphStyle('TRB', parent=table_cell_bold, alignment=TA_RIGHT)) if importe > 0
            else Paragraph("$ N/A", ParagraphStyle('TR', parent=table_cell, alignment=TA_RIGHT))
        ])

    t_econ = Table([econ_header] + econ_rows, colWidths=[210, 75, 50, 90, 86])
    t_econ.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_NAVY),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_BG_BOX])
    ]))
    story.append(t_econ)
    story.append(Spacer(1, 4))

    totales = [
        [Paragraph("<b>SUBTOTAL NETO:</b>", ParagraphStyle('TL', parent=table_cell, alignment=TA_RIGHT)),
         Paragraph(f"<b>$ {importe_neto:,.2f}</b>", ParagraphStyle('TR', parent=table_cell_bold, alignment=TA_RIGHT))],
        [Paragraph("<b>I.V.A. (21%):</b>", ParagraphStyle('TL', parent=table_cell, alignment=TA_RIGHT)),
         Paragraph(f"<b>$ {iva:,.2f}</b>", ParagraphStyle('TR', parent=table_cell_bold, alignment=TA_RIGHT))],
        [Paragraph("<b>TOTAL FINAL (Pesos Argentinos):</b>",
                   ParagraphStyle('TLT', parent=table_cell_bold, alignment=TA_RIGHT, textColor=C_DARK_TEAL, fontSize=8.5)),
         Paragraph(f"<b>$ {total:,.2f}</b>",
                   ParagraphStyle('TRT', parent=table_cell_bold, alignment=TA_RIGHT, textColor=C_ORANGE, fontSize=9.5))],
    ]
    t_totales = Table(totales, colWidths=[390, 121])
    t_totales.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-2), C_BG_BOX),
        ('BACKGROUND', (0,-1), (-1,-1), C_LIGHT_TEAL),
        ('BOX', (0,0), (-1,-1), 1, C_TEAL),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_totales)
    story.append(Spacer(1, 6))

    story.append(make_header_banner("7. Exclusiones"))
    story.append(Spacer(1, 2))
    for line in exclusiones.strip().split('\n'):
        if line.strip():
            story.append(Paragraph(line.strip(), body))

    story.append(PageBreak())

    # ─── PÁGINA 4: CONDICIONES Y FIRMAS ───
    story.append(make_header_banner("8. Condiciones Comerciales"))
    story.append(Spacer(1, 2))
    for line in condiciones.strip().split('\n'):
        if line.strip():
            story.append(Paragraph(line.strip(), body))
    story.append(Spacer(1, 10))

    story.append(make_header_banner("9. Conformidad y Aceptación"))
    story.append(Spacer(1, 2))
    story.append(Paragraph(
        "La aceptación de la presente propuesta implica conformidad total con el alcance, dedicación, cuadro tarifario y condiciones expresadas.",
        body
    ))
    story.append(Spacer(1, 10))

    firmas = [
        [Paragraph(f"<b>EMITIDO POR:</b><br/><b>VMP SAS (CUIT: 30-71936908-8)</b><br/>División VMP - EDTECH",
                   ParagraphStyle('F1', parent=table_cell, alignment=TA_CENTER)),
         Paragraph(f"<b>ACEPTADO POR:</b><br/><b>{cliente_nombre} (CUIT: {cliente_cuit})</b><br/>Representante Autorizado",
                   ParagraphStyle('F2', parent=table_cell, alignment=TA_CENTER))],
        [Paragraph("<br/><br/><br/>____________________________________________<br/><b>Firma / Aclaración:</b> VMP SAS<br/><b>Fecha:</b> " + fecha_emision,
                   ParagraphStyle('F3', parent=table_cell, alignment=TA_CENTER)),
         Paragraph("<br/><br/><br/>____________________________________________<br/><b>Firma / Aclaración:</b><br/><b>Fecha:</b> _____ / _____ / 2026",
                   ParagraphStyle('F4', parent=table_cell, alignment=TA_CENTER))],
    ]
    t_firmas = Table(firmas, colWidths=[248, 248])
    t_firmas.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_BG_BOX),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_firmas)
    story.append(Spacer(1, 10))

    contacto = Paragraph(
        "<b>VMP SAS | VMP - EDTECH</b> • Consultoría HSE, Formación Técnica & Plataforma LMS Cloud<br/>"
        "<b>Bases Operativas:</b> Neuquén Capital • General Roca • Añelo • CABA • Cobertura Nacional<br/>"
        "<b>Contacto:</b> administracion@vmp-edtech.com | contacto@vmp-sas.com • <b>Web:</b> www.vmp-edtech.com",
        ParagraphStyle('Cont', parent=body, fontSize=7, leading=9.5, textColor=C_SLATE, alignment=TA_CENTER)
    )
    t_contacto = Table([[contacto]], colWidths=[511])
    t_contacto.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_LIGHT_TEAL),
        ('BOX', (0,0), (-1,-1), 1, C_TEAL),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_contacto)

    # Build
    def first_page(c, d):
        draw_cover_background(c, d)
        c._numero_cotizacion = numero

    def later_pages(c, d):
        c._numero_cotizacion = numero

    canvasmaker_factory = type('CM', (PresupuestoCanvas,), {})

    doc.build(story, canvasmaker=canvasmaker_factory, onFirstPage=first_page, onLaterPages=later_pages)
    return buffer.getvalue()


# ─── TEXTOS DEFAULT ───
DEFAULT_ALCANCE = """• Relevamiento de condiciones generales de Seguridad e Higiene en frentes de trabajo.
• Inspecciones periódicas de condiciones y actos inseguros en locación.
• Identificación, registro y comunicación formal de desvíos detectados.
• Seguimiento y verificación de implementación de acciones correctivas.
• Control documental de Seguridad e Higiene de personal propio y contratistas.
• Verificación del uso adecuado y estado de Elementos de Protección Personal (EPP).
• Participación en charlas de 5 minutos y reuniones de seguridad.
• Elaboración de informes técnicos, checklists y reportes de inspección.
• Reporte directo a la persona designada por el cliente."""

DEFAULT_ENTREGABLES = """• Informes de inspección según estándar del cliente.
• Registro de hallazgos y matriz de no conformidades.
• Seguimiento de acciones correctivas con estado de cierre.
• Reporte consolidado de actividades al finalizar el período."""

DEFAULT_EXCLUSIONES = """• Traslados extraordinarios fuera del área urbana acordada.
• Alojamiento, comidas y viáticos no expresamente incluidos.
• Exámenes médicos extraordinarios o certificaciones adicionales exigidas posteriormente.
• EPP de alto riesgo no previsto en el alcance inicial.
• Horas o jornadas adicionales fuera de lo contratado (se cotizan según cuadro tarifario)."""

DEFAULT_CONDICIONES = """• Facturación contra certificación/remito conformado por el cliente.
• Plazo y forma de pago: a convenir (transferencia bancaria a cuenta VMP SAS).
• Moneda: Pesos Argentinos. Importes netos más IVA 21%.
• Vigencia de la oferta: 5 días corridos desde su emisión.
• Servicios adicionales facturados según cuadro tarifario."""
