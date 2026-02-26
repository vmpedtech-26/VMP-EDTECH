import asyncio
import os
from prisma import Prisma

async def main():
    prisma = Prisma()
    await prisma.connect()
    
    cursos = await prisma.curso.find_many(
        include={"modulos": True}
    )
    
    print(f"{'ID':<40} | {'Nombre':<30} | {'Modulos':<10} | {'Activo':<10}")
    print("-" * 100)
    for c in cursos:
        print(f"{c.id:<40} | {c.nombre[:30]:<30} | {len(c.modulos):<10} | {c.activo:<10}")
        for m in c.modulos:
            print(f"  -> Modulo: {m.titulo} (Orden: {m.orden}, Tipo: {m.tipo})")
            
    await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
