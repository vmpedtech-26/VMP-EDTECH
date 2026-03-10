import asyncio
from prisma import Prisma

async def main():
    db = Prisma()
    await db.connect()
    cursos = await db.curso.find_many()
    for c in cursos:
        print(f"Curso: {c.nombre}, imagenUrl: '{c.imagenUrl}'")
    await db.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
