import asyncio
from core.database import prisma

async def list_last_credentials():
    await prisma.connect()
    try:
        credenciales = await prisma.credencial.find_many(
            take=3,
            order={"createdAt": "desc"},
            include={"alumno": True, "curso": True}
        )
        
        print("--- Últimas 3 Credenciales ---")
        for c in credenciales:
            print(f"ID: {c.id}")
            print(f"Número: {c.numero}")
            print(f"Alumno: {c.alumno.nombre} {c.alumno.apellido} (DNI: {c.alumno.dni})")
            print(f"Curso: {c.curso.nombre}")
            print(f"Emisión: {c.fechaEmision}")
            print(f"Vencimiento: {c.fechaVencimiento}")
            print("-" * 30)
            
    finally:
        await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(list_last_credentials())
