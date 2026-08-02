 "
import os, sys, qrcode, urllib.request, ssl
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image

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

def draw_vmp_watermark(c, x_center, y_center, text='VMP'):
    c.saveState()
    c.setFillAlpha(0.04)
    c.setFillColorRGB(0/255, 180/255, 182/255)
    c.setFont(FONT_BOLD, 100)
    c.drawCentredString(x_center, y_center, text)
    c.restoreState()

def draw_argentine_flag(c, x, y, width=28, height=18):
    c.saveState()
    h3 = height / 3.0
    c.setFillColorRGB(117/255, 170/255, 219/255)
    c.rect(x, y + 2*h3, width, h3, fill=1, stroke=0)
    c.setFillColorRGB(1, 1, 1)
    c.rect(x, y + h3, width, h3, fill=1, stroke=0)
    c.setFillColorRGB(117/255, 170/255, 219/255)
    c.rect(x, y, width, h3, fill=1, stroke=0)
    c.setStrokeColorRGB(200/255, 205/255, 215/255)
    c.setLineWidth(0.5)
    c.rect(x, y, width, height, fill=0, stroke=1)
    
<truncated 15313 bytes