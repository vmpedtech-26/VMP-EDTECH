import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
gemini_key = os.environ.get("GEMINI_API_KEY")
if not gemini_key:
    print("NO API KEY")
    exit(1)

genai.configure(api_key=gemini_key)

from reportlab.pdfgen import canvas
import tempfile

with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
    c = canvas.Canvas(tmp.name)
    c.drawString(100, 750, "Factura de prueba VMP-EDTECH")
    c.drawString(100, 730, "Razón Social: YPF Combustibles")
    c.drawString(100, 710, "Total: $1500.00")
    c.drawString(100, 690, "CUIT: 30-12345678-9")
    c.save()
    tmp_path = tmp.name

with open(tmp_path, "rb") as f:
    pdf_bytes = f.read()

model = genai.GenerativeModel('gemini-2.5-flash')
try:
    print("Testing native bytes...")
    response = model.generate_content(
        [
            {"mime_type": "application/pdf", "data": pdf_bytes},
            "Extract data"
        ],
    )
    print("Response:", response.text)
except Exception as e:
    print("Error with native bytes:", e)

os.unlink(tmp_path)
