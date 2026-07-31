import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.platypus import Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Subclase de canvas.Canvas para realizar una doble pasada sobre el PDF,
    permitiendo calcular dinámicamente el total de páginas y estampar
    el pie de página 'Página X de Y' junto con decoraciones premium.
    """
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
        # 1. Encabezado elegante (Solo a partir de la página 2)
        if self._pageNumber > 1:
            self.saveState()
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#0D1F3C")) # Navy oscuro
            self.drawString(54, 750, "VMP - EDTECH | Propuesta de Capacitación Vial Presencial")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#0D9488")) # Teal
            self.drawRightString(558, 750, "Conducción Preventiva")
            
            # Línea divisoria superior
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)
            self.restoreState()

        # 2. Pie de página unificado (En todas las páginas)
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(54, 36, "VMP - EDTECH | CUIT 30-71936908-8 | www.vmp-edtech.com")
        
        # Paginado
        page_str = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(558, 36, page_str)
        
        # Línea divisoria inferior
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 48, 558, 48)
        self.restoreState()

def create_proposal_pdf(output_path, logo_path):
    # Inicializar documento. Tamaño carta con márgenes de 0.75" (54 pt)
    # Rango de impresión vertical útil: 54 a 738 (alto total 792)
    # Rango de impresión horizontal útil: 54 a 558 (ancho total 612) -> Ancho útil = 504 pt
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=72,
        bottomMargin=72
    )

    styles = getSampleStyleSheet()

    # Definir paleta de colores corporativos
    navy_dark = colors.HexColor("#0A192F")
    teal_accent = colors.HexColor("#0D9488")
    slate_gray = colors.HexColor("#475569")
    bg_light = colors.HexColor("#F8FAFC")
    border_color = colors.HexColor("#E2E8F0")

    # Definir estilos de párrafo premium
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=navy_dark,
        spaceAfter=15
    )
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=teal_accent,
        spaceAfter=40
    )
    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=navy_dark,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=teal_accent,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=slate_gray,
        spaceAfter=8
    )
    bullet_style = ParagraphStyle(
        'Bullet',
        parent=body_style,
        leftIndent=15,
        bulletIndent=5,
        spaceAfter=5
    )
    callout_style = ParagraphStyle(
        'Callout',
        parent=body_style,
        fontName='Helvetica-Oblique',
        fontSize=10,
        leading=14,
        textColor=navy_dark
    )

    story = []

    # ==========================================
    # PÁGINA 1: PORTADA & CARTA DE PRESENTACIÓN
    # ==========================================
    
    # Cabecera con el logotipo oficial de VMP-EDTECH
    logo_w = 90
    logo_h = 66 # mantiene proporción 1.37
    logo_img = RLImage(logo_path, width=logo_w, height=logo_h)
    
    brand_data = [[
        logo_img,
        Paragraph("<b>VMP - EDTECH</b><br/><font size=8 color='#0D9488'>VIALIDAD Y MANEJO PROFESIONAL</font>", 
                  ParagraphStyle('BrandTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=14, leading=16, textColor=navy_dark, alignment=2))
    ]]
    brand_table = Table(brand_data, colWidths=[150, 354])
    brand_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(brand_table)

    story.append(Spacer(1, 20))

    # Título y Subtítulo principal
    story.append(Paragraph("PROPUESTA DE ALIANZA ESTRATÉGICA Y CAPACITACIÓN CORPORATIVA", title_style))
    story.append(Paragraph("Programa Homologado de Conducción Preventiva y Seguridad Vial<br/><i>Formación Presencial para Flota Cerrada de hasta 15 Alumnos - Validez 24 Meses</i>", subtitle_style))

    story.append(Spacer(1, 10))

    # Cuadro de Metadatos de la Propuesta
    meta_content = [
        [Paragraph("<b>Destinatario:</b>", body_style), Paragraph("<b>AMERICAN ADVISOR</b><br/>Atn. Equipo Directivo / Coordinación de Capacitación<br/>Pasteur Oeste 256, Rawson, San Juan", body_style)],
        [Paragraph("<b>Presentado por:</b>", body_style), Paragraph("<b>VMP - EDTECH</b> (Vialidad y Manejo Profesional)<br/>Especialistas en capacitación técnica y consultoría de alta exigencia", body_style)],
        [Paragraph("<b>Propósito:</b>", body_style), Paragraph("Integración de módulo de capacitación y alianza de servicios en Higiene y Seguridad Laboral en la región de Cuyo", body_style)],
        [Paragraph("<b>Alcance del Grupo:</b>", body_style), Paragraph("Capacitación presencial de <b>flota cerrada de hasta 15 alumnos</b>", body_style)],
        [Paragraph("<b>Fecha:</b>", body_style), Paragraph("Mayo de 2026", body_style)]
    ]
    meta_table = Table(meta_content, colWidths=[100, 404])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_light),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(meta_table)

    story.append(Spacer(1, 20))

    # Carta de Presentación
    story.append(Paragraph("Estimado equipo de American Advisor,", h2_style))
    story.append(Paragraph(
        "Nos dirigimos a ustedes con el propósito de presentarles nuestra propuesta de capacitación corporativa "
        "en Conducción Preventiva. Entendemos la relevancia de American Advisor en la provisión de soluciones "
        "integrales de Medicina Laboral, Higiene y Seguridad en la región de Cuyo, y vemos una oportunidad "
        "clave para complementar su oferta de servicios a través de formación vial de estándar profesional.",
        body_style
    ))
    story.append(Paragraph(
        "Desde VMP - EDTECH, estructuramos programas de formación diseñados bajo las exigencias de "
        "los entornos petroleros, mineros e industriales de alta exigencia. Proponemos una capacitación de "
        "<b>modalidad presencial para un grupo cerrado de hasta 15 alumnos</b>. Esta formación brinda a su organización "
        "una herramienta de prevención técnica de primer nivel, homologada con una <b>vigencia de 24 meses</b> "
        "y respaldada por nuestra plataforma central de certificación y validación instantánea mediante código QR.",
        body_style
    ))

    story.append(PageBreak())

    # ==========================================
    # PÁGINA 2: DETALLES DEL PROGRAMA ACADÉMICO
    # ==========================================
    
    story.append(Paragraph("Detalles Técnicos y Académicos del Programa", h1_style))
    story.append(Paragraph(
        "El programa presencial de <b>Conducción Preventiva</b> (Manejo Defensivo) capacita de forma práctica e interactiva "
        "a choferes de vehículos livianos, utilitarios y flotas corporativas en la mitigación de riesgos viales, "
        "conducción eficiente e intervención ante emergencias.",
        body_style
    ))

    # Ficha Técnica en Tabla
    ficha_data = [
        [Paragraph("<b>Especificación</b>", body_style), Paragraph("<b>Detalle Académico / Operativo</b>", body_style)],
        [Paragraph("<b>Duración total</b>", body_style), Paragraph("8 horas de carga horaria presencial intensiva", body_style)],
        [Paragraph("<b>Modalidad</b>", body_style), Paragraph("<b>Presencial</b> (Teórico-Práctica interactiva dictada en sala/terreno)", body_style)],
        [Paragraph("<b>Dictado del Curso</b>", body_style), Paragraph("Clases dirigidas presencialmente por instructores certificados de VMP - EDTECH", body_style)],
        [Paragraph("<b>Evaluación Final</b>", body_style), Paragraph("Examen teórico-práctico presencial (aprobación mínima requerida de 70%)", body_style)],
        [Paragraph("<b>Alcance del Cupo</b>", body_style), Paragraph("Grupo / Flota cerrada de <b>hasta 15 alumnos</b>", body_style)],
        [Paragraph("<b>Vigencia del Título</b>", body_style), Paragraph("<b>24 meses</b> unificado en todos los programas de la marca", body_style)],
        [Paragraph("<b>Certificación</b>", body_style), Paragraph("Credencial digital premium con código QR dinámico de verificación inmediata", body_style)]
    ]
    ficha_table = Table(ficha_data, colWidths=[150, 354])
    ficha_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (1,0), navy_dark),
        ('TEXTCOLOR', (0,0), (1,0), colors.white),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    # Forzar texto blanco en cabecera de la tabla
    for i in range(2):
        ficha_data[0][i].style.textColor = colors.white
        ficha_data[0][i].style.fontName = 'Helvetica-Bold'
    
    story.append(ficha_table)

    story.append(Spacer(1, 15))

    story.append(Paragraph("Estructura de Contenidos (Temario)", h2_style))
    story.append(Paragraph(
        "El temario del programa presencial está estructurado en 3 módulos dinámicos:",
        body_style
    ))
    story.append(Paragraph("• <b>Módulo 1 - Fundamentos de Seguridad Vial:</b> Análisis del triángulo de seguridad (conductor, vehículo y entorno). Factores de riesgo fundamentales en la vía pública, estadísticas nacionales de siniestralidad vial y marco normativo legal vigente.", bullet_style))
    story.append(Paragraph("• <b>Módulo 2 - Técnicas de Conducción Preventiva:</b> Técnicas profesionales de visión periférica, escaneo de riesgos y distancia de seguimiento/frenado en ruta. Manejo en condiciones climáticas adversas (nieve, hielo, lluvia) y de conducción nocturna.", bullet_style))
    story.append(Paragraph("• <b>Módulo 3 - Emergencias e Intervención:</b> Maniobras de emergencia y evasión controlada de colisiones. Protocolo PAS (Proteger, Alertar, Socorrer) de actuación ante siniestros viales. Primeros auxilios básicos y uso reglamentario de elementos de seguridad activa y pasiva.", bullet_style))

    story.append(Spacer(1, 10))

    story.append(Paragraph("Certificación Digital y Código QR de Validación", h2_style))
    story.append(Paragraph(
        "Cada alumno que aprueba el curso presencial recibe de forma instantánea una credencial digital premium. "
        "Esta credencial contiene un <b>código QR dinámico único</b>. Las empresas clientes de American Advisor "
        "o las autoridades fiscalizadoras podrán escanear el QR desde cualquier celular para verificar al instante "
        "la autenticidad del certificado, la identidad del conductor, la fecha de aprobación y el vencimiento exacto "
        "(a los 24 meses de vigencia operativa). Esto garantiza transparencia absoluta, "
        "elimina falsificaciones viales y eleva el perfil tecnológico de su oferta educativa.",
        body_style
    ))

    story.append(PageBreak())

    # ==========================================
    # PÁGINA 3: PROPUESTA DE ALIANZA B2B
    # ==========================================
    
    story.append(Paragraph("Propuesta de Alianza B2B y Sinergia Regional", h1_style))
    story.append(Paragraph(
        "Concebimos esta alianza bajo un modelo dinámico de beneficio mutuo. VMP - EDTECH provee el "
        "respaldo pedagógico homologado, el material didáctico, los instructores certificados de dictado y la "
        "emisión automatizada de las credenciales con QR. Por su parte, American Advisor actúa como el aliado de "
        "distribución estratégica en la región de Cuyo, comercializando este curso presencial a sus clientes "
        "corporativos mineros, de transporte e industriales en la provincia de San Juan y zonas de influencia.",
        body_style
    ))

    story.append(Paragraph("Condiciones y Modalidad de Flota Cerrada", h2_style))
    story.append(Paragraph(
        "Esta propuesta especial ha sido diseñada específicamente para atender un cupo de <b>hasta 15 alumnos</b>. "
        "Al tratarse de una flota cerrada y presencial, permite a su organización:",
        body_style
    ))
    story.append(Paragraph("• <b>Fechas a Convenir:</b> Posibilidad de acordar la agenda del dictado presencial adaptándonos a la disponibilidad operativa de la empresa o de los conductores matriculados.", bullet_style))
    story.append(Paragraph("• <b>Formación Práctica Directa:</b> Los participantes interactúan directamente en sala con el instructor, realizando análisis de casos locales y dinámicas grupales de prevención.", bullet_style))
    story.append(Paragraph("• <b>Sin Tarifa Pública Externa:</b> Los aranceles financieros de esta capacitación presencial corporativa cerrada se establecerán de manera confidencial en un anexo comercial independiente, ajustado en función del lugar de dictado y viáticos correspondientes.", bullet_style))

    story.append(Spacer(1, 10))

    story.append(Paragraph("Beneficios Exclusivos de la Alianza para American Advisor", h2_style))
    story.append(Paragraph("• <b>Capacitación en Terreno (In-Company):</b> El curso se puede dictar de forma presencial directamente en las instalaciones del Centro Modelo de American Advisor o in-company para sus clientes corporativos, agregando gran dinamismo operativo.", bullet_style))
    story.append(Paragraph("• <b>Fácil de Vender (Sinergia LINTI):</b> Al recibir choferes para exámenes psicofísicos LINTI, su equipo comercial puede ofrecer la Conducción Preventiva como un servicio complementario presencial de valor agregado para las empresas de transporte.", bullet_style))
    story.append(Paragraph("• <b>Soporte y Marca Blanca / Co-branding:</b> Posibilidad de estampar el logotipo de American Advisor de forma conjunta en las credenciales digitales oficiales del sistema de validación.", bullet_style))

    story.append(Spacer(1, 15))

    # Cuadro de Llamado a la Acción y Contacto
    contacto_content = [
        [Paragraph(
            "<b>¡Demos el siguiente paso en conjunto!</b><br/>"
            "Estamos listos para coordinar una reunión de alineación con su equipo comercial y técnico, "
            "donde les mostraremos una demostración de nuestra plataforma centralizada de gestión de alumnos, "
            "los materiales didácticos y el validador QR de credenciales.<br/><br/>"
            "<b>Contacto Directo de Alianzas VMP - EDTECH:</b><br/>"
            "• Email: administracion@vmp-edtech.com<br/>"
            "• Teléfono / WhatsApp: +54 9 299 537 0173<br/>"
            "• Web: www.vmp-edtech.com | CUIT: 30-71936908-8 | Neuquén, Argentina",
            callout_style
        )]
    ]
    contacto_table = Table(contacto_content, colWidths=[504])
    contacto_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_light),
        ('BOX', (0,0), (-1,-1), 1.5, teal_accent),
        ('TOPPADDING', (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('LEFTPADDING', (0,0), (-1,-1), 15),
        ('RIGHTPADDING', (0,0), (-1,-1), 15),
    ]))
    story.append(contacto_table)

    # Generar el PDF final usando el NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"✅ Propuesta PDF comercial presencial sin tarifas generada con éxito en: {output_path}")

if __name__ == "__main__":
    output_pdf = "/Users/matias/Desktop/Propuesta_Comercial_American_Advisor.pdf"
    logo_path = "/Users/matias/Desktop/SISTEMAS & APPS/VMP/01 - Desarrollo (EdTech)/vmp-abril/apps/web/public/images/vmp_official.png"
    create_proposal_pdf(output_pdf, logo_path)
