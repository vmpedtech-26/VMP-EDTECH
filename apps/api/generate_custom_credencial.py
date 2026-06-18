import asyncio
import sys
import os

# Ensure the app imports work correctly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.credencial_generator import create_credencial_pdf

async def main():
    credencial_data = {
        'curso_nombre': 'Conducción Preventiva',
        'numero_credencial': 'VMP-2026-00892',
        'alumno_nombre': 'HÉCTOR HUGO CATALANO',
        'dni': '16.690.492',
        'puesto': 'Jefe de Obra',
        'empresa_nombre': 'VMP - EDTECH',
        'fecha_emision': '06/06/2026',
        'fecha_vencimiento': '06/06/2028',
        'instructor_nombre': 'Instructor VMP',
        'instructor_info': 'Mat. N° 2206823',
        'qr_url': 'https://vmp-edtech.com/validar/VMP-2026-00892'
    }
    
    foto_path = "/Users/matias/.gemini/antigravity/brain/be0298fa-fa80-4c0d-ab29-599f37a05f60/media__1781616816189.png"
    
    print("Generando PDF...")
    pdf_bytes = await create_credencial_pdf(credencial_data, foto_path)
    
    out_path = "/Users/matias/Desktop/Credencial_Hector_Catalano.pdf"
    with open(out_path, "wb") as f:
        f.write(pdf_bytes)
    
    print(f"Credencial generada en {out_path}")

if __name__ == "__main__":
    asyncio.run(main())
