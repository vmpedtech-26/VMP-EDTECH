import asyncio
from prisma import Prisma

async def main():
    prisma = Prisma()
    await prisma.connect()
    
    # Intenta buscar el curso VMP- DT
    curso = await prisma.curso.find_unique(where={"codigo": "VMP- DT"})
    print(f"Curso existe? {curso}")
    
    if not curso:
        try:
            curso = await prisma.curso.create(
                data={
                    "nombre": "Doble traccion",
                    "descripcion": "CURSO DE PRUEBA",
                    "codigo": "VMP- DT",
                    "duracionHoras": 6,
                    "vigenciaMeses": 12,
                    "activo": True
                }
            )
            print(f"Curso creado: {curso.id}")
        except Exception as e:
            print(f"Error al crear: {e}")
            
    await prisma.disconnect()

asyncio.run(main())
