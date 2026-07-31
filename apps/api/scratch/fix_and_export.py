import asyncio
import os
import shutil
from core.database import prisma
from services.credential_service import generate_credential_for_student

async def fix_and_export():
    await prisma.connect()
    try:
        # 1. Corregir Ortografía
        updates = [
            {"old_apellido": "Toneloto", "new_apellido": "Tonelotto"},
            {"old_apellido": "Narambuena", "new_apellido": "Noranbuena"}
        ]
        
        for up in updates:
            user = await prisma.user.find_first(where={"apellido": up["old_apellido"]})
            if user:
                print(f"Corrigiendo {user.nombre} {user.apellido} -> {up['new_apellido']}")
                await prisma.user.update(
                    where={"id": user.id},
                    data={"apellido": up["new_apellido"]}
                )
        
        # 2. Regenerar Credenciales para los 3 (incluyendo Matias Silva)
        users_to_export = ["Matias Silva", "Mia Tonelotto", "Gabriel Noranbuena"]
        desktop_path = "/Users/matias/Desktop"
        vmp_folder = os.path.join(desktop_path, "Credenciales_VMP")
        os.makedirs(vmp_folder, exist_ok=True)
        
        for name in users_to_export:
            nombre, apellido = name.split(" ")
            user = await prisma.user.find_first(
                where={
                    "nombre": {"contains": nombre},
                    "apellido": {"contains": apellido}
                }
            )
            
            if user:
                # Buscar o crear credencial (usamos force=True para regenerar PDF con nombre corregido)
                # Necesitamos un curso ID, usamos el mismo de antes (MDP-001)
                curso = await prisma.curso.find_first(where={"codigo": "MDP-001"})
                if curso:
                    print(f"Regenerando y exportando credencial para {name}...")
                    result = await generate_credential_for_student(
                        alumno_id=user.id,
                        curso_id=curso.id,
                        force=True
                    )
                    
                    # Copiar al escritorio
                    pdf_relative_path = result["pdfUrl"].lstrip("/") # storage/credenciales/VMP-XXXX.pdf
                    # El path real es apps/api/ + pdf_relative_path
                    source_path = os.path.join(os.getcwd(), pdf_relative_path)
                    dest_filename = f"Credencial_{name.replace(' ', '_')}.pdf"
                    dest_path = os.path.join(vmp_folder, dest_filename)
                    
                    if os.path.exists(source_path):
                        shutil.copy2(source_path, dest_path)
                        print(f"Copiado a: {dest_path}")
                    else:
                        print(f"Error: No se encontró el PDF en {source_path}")
            else:
                print(f"Usuario {name} no encontrado para exportar.")
                
        print(f"\n✅ Proceso completado. Las credenciales están en la carpeta 'Credenciales_VMP' en tu escritorio.")
            
    finally:
        await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(fix_and_export())
