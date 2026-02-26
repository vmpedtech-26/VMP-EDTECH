import asyncio
from prisma import Prisma
import json

async def main():
    db = Prisma()
    await db.connect()
    cursos = await db.curso.find_many()
    result = []
    for c in cursos:
        result.append({
            'id': c.id,
            'nombre': c.nombre,
            'codigo': c.codigo,
            'empresaId': c.empresaId,
            'activo': c.activo,
            'createdAt': str(c.createdAt)
        })
    print(json.dumps(result, indent=2))
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
