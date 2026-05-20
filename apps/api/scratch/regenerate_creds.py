import asyncio
from core.database import prisma
from services.credential_service import generate_credential_for_student

async def regenerate_creds():
    await prisma.connect()
    try:
        users = ["Matias Silva", "Mia Toneloto", "Gabriel Narambuena"]
        
        for name in users:
            nombre, apellido = name.split(" ")
            user = await prisma.user.find_first(
                where={
                    "nombre": {"contains": nombre},
                    "apellido": {"contains": apellido}
                }
            )
            
            if user:
                # Buscar todas sus credenciales
                creds = await prisma.credencial.find_many(where={"alumnoId": user.id})
                for c in creds:
                    print(f"Regenerando credencial {c.numero} para {name}...")
                    await generate_credential_for_student(
                        alumno_id=user.id,
                        curso_id=c.cursoId,
                        force=True
                    )
            else:
                print(f"Usuario {name} no encontrado para regenerar.")
                
        print("✅ Credenciales regeneradas físicamente con el nuevo puesto.")
            
    finally:
        await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(regenerate_creds())
