import asyncio
import os
import sys

# Agregar el directorio raíz al path para importar
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.credencial_generator import create_credencial_pdf

async def main():
    pdf_data = {
        "numero_credencial": "VMP-2026-00045",
        "alumno_nombre": "Carlos Rodríguez",
        "dni": "28.456.789",
        "curso_nombre": "Capacitación Manejo Invernal",
        "curso_codigo": "MAN-INV",
        "fecha_emision": "08/06/2026",
        "fecha_vencimiento": "08/06/2027",
        "puesto": "Conductor Profesional 4x4",
        "qr_url": "http://localhost:3000/validar/VMP-2026-00045",
        "instructor_nombre": "Pedro Orejas",
        "instructor_info": "Instructor VMP | Mat. N° 2206823",
        "instructor_id": None,
        "empresa_nombre": "Logística del Sur S.A."
    }
    
    # Intentar buscar alguna foto de prueba si existe
    foto_path = None
    
    print("Generating sample winter driving credential PDF...")
    pdf_bytes = await create_credencial_pdf(pdf_data, foto_path)
    
    desktop_path = "/Users/matias/Desktop/credencial_manejo_invernal_ejemplo.pdf"
    with open(desktop_path, "wb") as f:
        f.write(pdf_bytes)
        
    print(f"Sample PDF successfully saved to: {desktop_path}")

if __name__ == "__main__":
    asyncio.run(main())
