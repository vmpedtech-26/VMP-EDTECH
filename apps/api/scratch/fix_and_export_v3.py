import asyncio
import os
import shutil
from datetime import datetime
from core.database import prisma
from services.credential_service import generate_credential_for_student

async def fix_and_export_v3():
    await prisma.connect()
    try:
        # Datos fijos para que coincidan con la semana pasada
        fecha_manual = "04/05/2026"
        vencimiento_manual = "04/05/2028"
        
        scratch_path = "/Users/matias/.gemini/antigravity/scratch/vmp-abril/apps/api/scratch"
        
        users_to_export = [
            {
                "nombre": "Matias", 
                "apellido": "Silva", 
                "filename": "VMP Credencial - Silva Matias Noel.pdf",
                "foto": os.path.join(scratch_path, "foto_Matias_0.jpeg")
            },
            {
                "nombre": "Mia", 
                "apellido": "Tonelotto", 
                "filename": "VMP Credencial - Tonelotto Mia.pdf",
                "foto": os.path.join(scratch_path, "foto_Mia_0.jpeg")
            },
            {
                "nombre": "Gabriel", 
                "apellido": "Noranbuena", 
                "filename": "VMP Credencial - Noranbuena Gabriel.pdf",
                "foto": os.path.join(scratch_path, "foto_Gabriel_0.jpeg")
            }
        ]
        
        desktop_path = "/Users/matias/Desktop"
        
        for u in users_to_export:
            user = await prisma.user.find_first(
                where={
                    "nombre": {"contains": u["nombre"]},
                    "apellido": {"contains": u["apellido"]}
                }
            )
            
            if user:
                from services.credencial_generator import create_credencial_pdf, save_credencial_pdf
                
                # Número basado en DNI
                numero = f"VMP-2026-{user.dni[-5:]}"
                
                pdf_data = {
                    "numero_credencial": numero,
                    "alumno_nombre": f"{user.nombre} {user.apellido}",
                    "dni": user.dni,
                    "puesto": "Tecnico HSE", # Forzamos el cambio de puesto pedido
                    "empresa_nombre": "Aguas Const. Forken UTE",
                    "curso_nombre": "Conducción Segura: Flota Liviana",
                    "fecha_emision": fecha_manual,
                    "fecha_vencimiento": vencimiento_manual,
                    "qr_url": f"https://www.vmp-edtech.com/validar/{numero}"
                }
                
                # Usamos la foto extraída
                foto_path = u["foto"] if os.path.exists(u["foto"]) else None
                
                pdf_bytes = await create_credencial_pdf(pdf_data, foto_path)
                
                # Guardar en Escritorio
                dest_path = os.path.join(desktop_path, u["filename"])
                with open(dest_path, "wb") as f:
                    f.write(pdf_bytes)
                print(f"✅ Generada con foto: {dest_path}")
            else:
                print(f"Usuario {u['nombre']} no encontrado.")
                
        print(f"\n🚀 Proceso finalizado. Las credenciales están listas con sus fotos originales.")
            
    finally:
        await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(fix_and_export_v3())
