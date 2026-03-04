import asyncio
from core.database import prisma

async def main():
    await prisma.connect()
    
    curso = await prisma.curso.find_first(where={"nombre": "Test Antigravity Fix"})
    if curso:
        print(f"Borrando: {curso.nombre}")
        await prisma.curso.delete(where={"id": curso.id})
        print("Borrado exitoso.")
    else:
        print("Curso no encontrado.")
        
    await prisma.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
