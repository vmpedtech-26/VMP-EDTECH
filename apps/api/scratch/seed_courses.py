import asyncio
from core.database import prisma
from auth.jwt import hash_password

async def seed():
    await prisma.connect()
    try:
        cursos = [
            {
                "nombre": "Manejo Defensivo Livianos",
                "codigo": "MDL-001",
                "descripcion": "Curso teórico-práctico de manejo defensivo para vehículos livianos.",
                "duracionHoras": 20,
                "vigenciaMeses": 24
            },
            {
                "nombre": "Manejo Defensivo Pesados",
                "codigo": "MDP-001",
                "descripcion": "Curso teórico-práctico de manejo defensivo para vehículos pesados y transporte de carga.",
                "duracionHoras": 40,
                "vigenciaMeses": 24
            }
        ]
        
        for c in cursos:
            existing = await prisma.curso.find_unique(where={"codigo": c["codigo"]})
            if not existing:
                print(f"Creando curso: {c['nombre']}")
                await prisma.curso.create(data=c)
            else:
                print(f"Curso {c['nombre']} ya existe.")
                
    finally:
        await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(seed())
