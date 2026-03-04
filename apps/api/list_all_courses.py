import asyncio
from prisma import Prisma

async def main():
    prisma = Prisma()
    await prisma.connect()
    
    cursos = await prisma.curso.find_many()
    for c in cursos:
        # print("found")
        print(f"id={c.id}, nombre={c.nombre}, activo={c.activo}")
    await prisma.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
