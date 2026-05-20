import asyncio
from core.database import prisma
from services.credential_service import generate_credential_for_student

async def generate_test_creds():
    await prisma.connect()
    try:
        # Buscar curso
        curso = await prisma.curso.find_first(where={"codigo": "MDP-001"})
        if not curso:
            print("Curso no encontrado")
            return
            
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
                print(f"Generando credencial para {name}...")
                await generate_credential_for_student(
                    alumno_id=user.id,
                    curso_id=curso.id,
                    force=True
                )
                
        print("✅ Credenciales generadas exitosamente con el puesto 'Tecnico HSE'")
            
    finally:
        await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(generate_test_creds())
