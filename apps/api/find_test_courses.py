import asyncio
from core.database import prisma

async def main():
    await prisma.connect()
    cursos = await prisma.curso.find_many()
    for c in cursos:
        # print("found")
        print(c.id, c.nombre, c.activo, c.empresaId)
    await prisma.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
