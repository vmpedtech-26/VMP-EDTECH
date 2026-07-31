import asyncio
import os
from core.database import prisma

async def fix_data_and_export_v4():
    await prisma.connect()
    try:
        # Datos extraídos y correcciones del usuario
        students = [
            {
                "nombre": "Matias", 
                "apellido": "Silva", 
                "dni": "36181879", 
                "puesto": "TECNICO HSE",
                "filename": "VMP Credencial - Silva Matias Noel.pdf",
                "foto": "/Users/matias/.gemini/antigravity/scratch/vmp-abril/apps/api/scratch/foto_Matias_0.jpeg"
            },
            {
                "nombre": "Mia", 
                "apellido": "Tonelotto", 
                "dni": "43260462", 
                "puesto": "TECNICO HSE",
                "filename": "VMP Credencial - Tonelotto Mia.pdf",
                "foto": "/Users/matias/.gemini/antigravity/scratch/vmp-abril/apps/api/scratch/foto_Mia_0.jpeg"
            },
            {
                "nombre": "Gabriel", 
                "apellido": "Noranbuena", 
                "dni": "38093151", 
                "puesto": "LIC. HSE",
                "filename": "VMP Credencial - Noranbuena Gabriel.pdf",
                "foto": "/Users/matias/.gemini/antigravity/scratch/vmp-abril/apps/api/scratch/foto_Gabriel_0.jpeg"
            }
        ]
        
        # Fecha de la semana pasada
        fecha_manual = "04/05/2026"
        vencimiento_manual = "04/05/2028"
        desktop_path = "/Users/matias/Desktop"
        
        for s in students:
            # Actualizar DB
            user = await prisma.user.find_first(
                where={
                    "nombre": {"contains": s["nombre"]},
                    "apellido": {"contains": s["apellido"]}
                }
            )
            
            if user:
                await prisma.user.update(
                    where={"id": user.id},
                    data={"dni": s["dni"], "puesto": s["puesto"]}
                )
                
                from services.credencial_generator import create_credencial_pdf
                
                numero = f"VMP-2026-{s['dni'][-5:]}"
                
                pdf_data = {
                    "numero_credencial": numero,
                    "alumno_nombre": f"{user.nombre} {user.apellido}",
                    "dni": s["dni"],
                    "puesto": s["puesto"],
                    "empresa_nombre": "Aguas Const. Forken UTE",
                    "curso_nombre": "Conducción Segura: Flota Liviana",
                    "fecha_emision": fecha_manual,
                    "fecha_vencimiento": vencimiento_manual,
                    "qr_url": f"https://www.vmp-edtech.com/validar/{numero}"
                }
                
                foto_path = s["foto"] if os.path.exists(s["foto"]) else None
                pdf_bytes = await create_credencial_pdf(pdf_data, foto_path)
                
                dest_path = os.path.join(desktop_path, s["filename"])
                with open(dest_path, "wb") as f:
                    f.write(pdf_bytes)
                print(f"✅ Finalizada: {s['nombre']} {s['apellido']} ({s['dni']}) - {s['puesto']}")
                
    finally:
        await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(fix_data_and_export_v4())
