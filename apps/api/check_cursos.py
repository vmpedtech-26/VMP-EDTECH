import asyncio
from prisma import Prisma

async def main():
    db = Prisma()
    await db.connect()
    
    cursos = await db.curso.find_many()
    
    for c in cursos:
        print(f"ID: {c.id}")
        print(f"NOMBRE: {c.nombre}")
        print(f"DESC: {c.descripcion}")
        print("-" * 50)
        
    await db.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
