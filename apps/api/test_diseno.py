"""Test rápido del nuevo diseño de credencial."""
import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.credencial_generator import create_credencial_pdf, save_credencial_pdf
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Simular settings mínimo
class FakeSettings:
    STORAGE_PATH = os.path.join(os.path.dirname(__file__), "storage")

import services.credencial_generator as cg
cg.settings = FakeSettings()

# También patch en save
from core import config as cfg_mod
cfg_mod.settings.STORAGE_PATH = FakeSettings.STORAGE_PATH

async def main():
    data = {
        "numero_credencial": "VMP-2026-00099",
        "alumno_nombre": "JORGE PEDRO HECK",
        "dni": "14.872.757",
        "curso_nombre": "Conducción Segura: Flota Liviana",
        "curso_codigo": "CSF-01",
        "fecha_emision": "05/03/2026",
        "fecha_vencimiento": "05/03/2027",
        "qr_url": "https://vmp-edtech.com/validar/VMP-2026-00099",
        "puesto": "Conductor",
        "empresa_nombre": "Aguas Const. Forken UTE",
    }

    # Buscar foto real si existe
    foto_path = None
    uploads = os.path.join(os.path.dirname(__file__), "storage", "uploads", "credenciales")
    if os.path.exists(uploads):
        fotos = [f for f in os.listdir(uploads) if f.endswith(('.jpg', '.jpeg', '.png'))]
        if fotos:
            foto_path = os.path.join(uploads, fotos[0])
            print(f"Usando foto: {fotos[0]}")

    pdf_bytes = await create_credencial_pdf(data, foto_path)
    out = os.path.join(os.path.dirname(__file__), "storage", "test_nuevo_diseno.pdf")
    with open(out, "wb") as f:
        f.write(pdf_bytes)
    print(f"✓ PDF generado: {out}")
    return out

if __name__ == "__main__":
    result = asyncio.run(main())
    import subprocess
    subprocess.run(["open", result])
