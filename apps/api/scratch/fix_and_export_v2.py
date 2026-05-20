import asyncio
import os
import shutil
from datetime import datetime
from core.database import prisma
from services.credential_service import generate_credential_for_student

async def fix_and_export_v2():
    await prisma.connect()
    try:
        # Fecha de la semana pasada (según imagen del usuario)
        fecha_manual = "04/05/2026"
        vencimiento_manual = "04/05/2028"
        
        users_to_export = [
            {"nombre": "Matias", "apellido": "Silva", "filename": "VMP Credencial - Silva Matias Noel.pdf"},
            {"nombre": "Mia", "apellido": "Tonelotto", "filename": "VMP Credencial - Tonelotto Mia.pdf"},
            {"nombre": "Gabriel", "apellido": "Noranbuena", "filename": "VMP Credencial - Noranbuena Gabriel.pdf"}
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
                curso = await prisma.curso.find_first(where={"codigo": "MDP-001"})
                if curso:
                    print(f"Regenerando credencial para {user.nombre} {user.apellido}...")
                    
                    # Forzamos los datos del PDF para que coincidan con la imagen
                    # Modificamos temporalmente el servicio o pasamos los datos
                    from services.credencial_generator import create_credencial_pdf, save_credencial_pdf, generate_credencial_number
                    
                    # Generar número si no tiene
                    numero = f"VMP-2026-{user.dni[-5:]}" # Un número ficticio basado en DNI
                    
                    pdf_data = {
                        "numero_credencial": numero,
                        "alumno_nombre": f"{user.nombre} {user.apellido}",
                        "dni": user.dni,
                        "puesto": user.puesto or "TECNICO HSE",
                        "empresa_nombre": "Aguas Const. Forken UTE", # Como en la imagen
                        "curso_nombre": "Conducción Segura: Flota Liviana", # Como en la imagen
                        "fecha_emision": fecha_manual,
                        "fecha_vencimiento": vencimiento_manual,
                        "qr_url": f"https://www.vmp-edtech.com/validar/{numero}"
                    }
                    
                    pdf_bytes = await create_credencial_pdf(pdf_data, None)
                    filename = f"{numero}.pdf"
                    pdf_url = await save_credencial_pdf(pdf_bytes, filename)
                    
                    # Sobrescribir en Escritorio (sueltas)
                    dest_path = os.path.join(desktop_path, u["filename"])
                    with open(dest_path, "wb") as f:
                        f.write(pdf_bytes)
                    print(f"Actualizada: {dest_path}")
            else:
                print(f"Usuario {u['nombre']} no encontrado.")
                
        print(f"\n✅ Credenciales actualizadas directamente en tu escritorio.")
            
    finally:
        await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(fix_and_export_v2())
