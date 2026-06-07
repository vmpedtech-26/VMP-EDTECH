import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.platypus import Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    NumberedCanvas to handle two-pass rendering for professional page numbering
    and headers/footers with premium VMP design aesthetics.
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
        # 1. Elegant Header (From page 2 onwards)
        if self._pageNumber > 1:
            self.saveState()
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#0D1F3C")) # Deep Navy
            self.drawString(54, 750, "VMP - EDTECH | Contrato Marco B2B & Programa de Cumplimiento")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#0D9488")) # Teal
            self.drawRightString(558, 750, "Ley 27.401")
            
            # Divider Line
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)
            self.restoreState()

        # 2. Unified Footer (On all pages)
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(54, 36, "VMP - EDTECH | CUIT 30-71936908-8 | www.vmp-edtech.com")
        
        # Page Numbering
        page_str = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(558, 36, page_str)
        
        # Divider Line
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 48, 558, 48)
        self.restoreState()

def create_contract_pdf(output_path, logo_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=72,
        bottomMargin=72
    )

    styles = getSampleStyleSheet()

    # VMP Corporate Palette
    navy_dark = colors.HexColor("#0A192F")
    teal_accent = colors.HexColor("#0D9488")
    slate_gray = colors.HexColor("#475569")
    bg_light = colors.HexColor("#F8FAFC")
    border_color = colors.HexColor("#E2E8F0")

    # Premium Paragraph Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=28,
        textColor=navy_dark,
        spaceAfter=15
    )
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=teal_accent,
        spaceAfter=40
    )
    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
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
        fontSize=9,
        leading=13,
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
        fontSize=9.5,
        leading=13.5,
        textColor=navy_dark
    )

    story = []

    # ==========================================
    # PAGE 1: COVER & DOCUMENT DETAILS
    # ==========================================
    
    # Official logo header
    logo_w = 90
    logo_h = 66 # maintains 1.37 ratio
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

    # Title & Subtitle
    story.append(Paragraph("CONTRATO MARCO B2B Y PROGRAMA DE CUMPLIMIENTO", title_style))
    story.append(Paragraph("<i>Estructura Normativa y Licenciamiento Corporativo para Sectores de Alta Regulación en Argentina (Minería, Energía e Industria Pesada)</i>", subtitle_style))

    story.append(Spacer(1, 10))

    # Metadata Table
    meta_content = [
        [Paragraph("<b>Tipo de Documento:</b>", body_style), Paragraph("Contrato de Licencia SaaS, Niveles de Servicio (SLA) y Programa de Integridad Corporativa (Ley 27.401)", body_style)],
        [Paragraph("<b>Prestador:</b>", body_style), Paragraph("<b>VMP - EDTECH</b> (Vialidad y Manejo Profesional)<br/>CUIT 30-71936908-8 | Neuquén, Argentina", body_style)],
        [Paragraph("<b>Estructura Cambiaria:</b>", body_style), Paragraph("Precios nominados en <b>Dólares Estadounidenses (USD)</b> liquidados al tipo de cambio <b>Dólar MEP</b>", body_style)],
        [Paragraph("<b>Soporte Técnico (SLA):</b>", body_style), Paragraph("Esquema flexible con ventanas de mantenimiento y actualizaciones cada <b>dos (2) semanas</b>", body_style)],
        [Paragraph("<b>Gobernanza / Compliance:</b>", body_style), Paragraph("Oficial de Cumplimiento Híbrido (Interno/Externo) bajo <b>Ley 27.401</b>", body_style)]
    ]
    meta_table = Table(meta_content, colWidths=[130, 374])
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

    # Intro letter
    story.append(Paragraph("Marco de Gobernanza de VMP - EDTECH", h2_style))
    story.append(Paragraph(
        "El presente documento consolida las políticas y contratos marco de VMP - EDTECH destinados a mitigar "
        "los riesgos legales, fiscales y operativos del negocio. A través de este esquema, VMP garantiza un entorno "
        "de control interno auditado, asegurando la transparencia y la validez legal de las certificaciones técnicas emitidas. "
        "Este marco es indispensable para dar cumplimiento a los procesos de debida diligencia de clientes corporativos del sector minero y energético.",
        body_style
    ))

    story.append(PageBreak())

    # ==========================================
    # PAGE 2: SECCIÓN I - CONTRATO MARCO B2B
    # ==========================================
    
    story.append(Paragraph("SECCIÓN I: Contrato de Licencia SaaS y Servicios de Capacitación", h1_style))
    story.append(Paragraph(
        "A continuación se detallan las cláusulas generales reguladoras del servicio de licenciamiento corporativo (SaaS) "
        "para la capacitación de choferes y flotas cerradas en empresas:",
        body_style
    ))

    # Clauses
    story.append(Paragraph("<b>Cláusula 1: Objeto y Licenciamiento Nominativo</b>", h2_style))
    story.append(Paragraph(
        "El Prestador otorga una licencia de uso de su plataforma de aprendizaje a distancia (e-learning) a favor del Cliente. "
        "Las licencias de acceso a los cursos técnicos son **estrictamente nominativas** (asociadas al CUIL y DNI de cada conductor/operario de El Cliente). "
        "Queda prohibida la compartición de accesos. En industrias reguladas, la capacitación técnica (ej. Seguridad e Higiene en Minería) "
        "tiene carácter de declaración jurada de cumplimiento de normas de seguridad laboral, por lo que el acceso compartido "
        "compromete la validez jurídica de la certificación.",
        body_style
    ))

    story.append(Paragraph("<b>Cláusula 2: Condiciones Económicas y Cláusula Cambiaria</b>", h2_style))
    story.append(Paragraph(
        "Los precios de los planes anuales de capacitación y licencias corporativas se fijan de mutuo acuerdo en **Dólares Estadounidenses (USD)**. "
        "Las facturas emitidas (tipo Factura A) serán expresadas en USD y podrán ser canceladas en Pesos Argentinos (ARS) al tipo de cambio "
        "<b>Dólar MEP</b> (o cotización de referencia acordada) de la fecha de facturación. "
        "En caso de que El Cliente sea agente de retención impositiva (IVA/Ganancias/Ingresos Brutos), deberá entregar a El Prestador "
        "los correspondientes comprobantes de retención dentro de los 5 días hábiles posteriores al pago.",
        body_style
    ))

    story.append(Paragraph("<b>Cláusula 3: Acuerdo de Nivel de Servicio (SLA) y Mantenimiento Flexible</b>", h2_style))
    story.append(Paragraph(
        "Se pacta un esquema de soporte y actualización flexible adaptado a las directrices operativas de El Prestador:",
        body_style
    ))
    story.append(Paragraph("• <b>Actualizaciones y Mantenimiento:</b> El Prestador ejecutará tareas de mantenimiento programado, mejoras de seguridad y actualizaciones de cursos en ciclos de <b>dos (2) semanas</b>.", bullet_style))
    story.append(Paragraph("• <b>Tiempos de Respuesta de Soporte:</b><br/>"
                           "  - <i>Consultas Administrativas / Altas de Alumnos:</i> Resolución en un plazo máximo de 5 días hábiles.<br/>"
                           "  - <i>Incidencias Técnicas Generales:</i> Resolución en un plazo máximo de 3 días hábiles.<br/>"
                           "  - <i>Fallas Bloqueantes de la Plataforma:</i> Atención prioritaria en menos de 24 horas.", bullet_style))

    story.append(PageBreak())

    # ==========================================
    # PAGE 3: SECCIÓN II - COMPLIANCE & INTEGRITY
    # ==========================================
    
    story.append(Paragraph("SECCIÓN II: Programa de Integridad bajo Ley 27.401", h1_style))
    story.append(Paragraph(
        "La <b>Ley 27.401 de Responsabilidad Penal de las Personas Jurídicas</b> en Argentina establece que contar con un "
        "Programa de Integridad adecuado es un requisito indispensable para presentarse en licitaciones nacionales y "
        "un estándar de homologación obligatorio (due diligence) para ser proveedor de grandes operadoras.",
        body_style
    ))

    story.append(Paragraph("<b>1. Estructura Híbrida del Oficial de Cumplimiento</b>", h2_style))
    story.append(Paragraph(
        "VMP - EDTECH adopta un enfoque híbrido para garantizar independencia técnica y eficiencia de costes:",
        body_style
    ))
    story.append(Paragraph("• <b>Rol Interno (Punto de Contacto):</b> Se designará un directivo interno de la empresa (ej. Director de Operaciones o CFO) como el receptor interno y enlace de cumplimiento.", bullet_style))
    story.append(Paragraph("• <b>Soporte Externo (Auditoría):</b> Se contratará un servicio externo de asesoramiento legal especializado en Compliance corporativo. Este estudio externo auditará semestralmente los logs de auditoría de la plataforma, evaluará denuncias complejas de forma independiente y actualizará las matrices de riesgo de la empresa ante cambios regulatorios en Argentina.", bullet_style))

    story.append(Paragraph("<b>2. Registro Criptográfico e Integración SSO</b>", h2_style))
    story.append(Paragraph(
        "• <b>Integridad de Certificados (QR):</b> Cada certificado técnico emitido se guarda junto con un hash inmutable de validación en la base de datos de control interno, garantizando que los datos no puedan ser alterados retroactivamente.<br/>"
        "• <b>Control de Accesos Integrado (SSO):</b> Se habilita el soporte para <b>Single Sign-On (SSO)</b> (protocolos SAML 2.0 u OpenID Connect). Cuando las mineras dan de baja a un contratista en su Active Directory corporativo, el sistema de VMP bloquea de inmediato su acceso a los cursos técnicos e-learning obligatorios, mitigando el riesgo de accesos no autorizados a material confidencial.",
        body_style
    ))

    story.append(Spacer(1, 15))

    # Callout Box for Code of Ethics commitment
    compromiso_content = [
        [Paragraph(
            "<b>CÓDIGO DE ÉTICA Y CONDUCTA COMERCIAL - TOLERANCIA CERO A LA CORRUPCIÓN</b><br/>"
            "En VMP - EDTECH no toleramos ninguna conducta ética cuestionable bajo ninguna circunstancia. Queda estrictamente prohibido prometer, ofrecer, dar, solicitar o aceptar, directa o indirectamente, cualquier pago de facilitación, soborno, retorno de dinero o regalo de valor indebido a funcionarios públicos nacionales, provinciales o municipales, así como a empleados y gerentes de compras de empresas privadas del sector minero e industrial.<br/><br/>"
            "<b>Canal de Denuncias Seguro y Confidencial:</b><br/>"
            "• Email institucional: compliance@vmp-edtech.com<br/>"
            "• Garantía de No Represalias para denunciantes de buena fe.",
            callout_style
        )]
    ]
    compromiso_table = Table(compromiso_content, colWidths=[504])
    compromiso_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_light),
        ('BOX', (0,0), (-1,-1), 1.5, teal_accent),
        ('TOPPADDING', (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('LEFTPADDING', (0,0), (-1,-1), 15),
        ('RIGHTPADDING', (0,0), (-1,-1), 15),
    ]))
    story.append(compromiso_table)

    # Build PDF with NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"✅ Contrato PDF B2B y Compliance generado con éxito en: {output_path}")

if __name__ == "__main__":
    output_pdf = "/Users/matias/Desktop/Contrato_B2B_y_Compliance_VMP.pdf"
    logo_path = "/Users/matias/Desktop/SISTEMAS & APPS/VMP/01 - Desarrollo (EdTech)/vmp-abril/apps/web/public/images/vmp_official.png"
    create_contract_pdf(output_pdf, logo_path)
