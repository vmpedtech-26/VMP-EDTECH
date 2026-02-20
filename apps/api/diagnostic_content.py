import asyncio
from prisma import Prisma

async def main():
    db = Prisma()
    await db.connect()
    
    print("--- DIAGNÓSTICO DE CONTENIDO ---")
    
    # Cursos
    cursos = await db.curso.find_many(include={'modulos': True})
    print(f"Total Cursos: {len(cursos)}")
    
    for c in cursos:
        print(f"\nCURSO: {c.nombre} ({c.codigo})")
        print(f"ID: {c.id}")
        print(f"Módulos: {len(c.modulos)}")
        
        for m in c.modulos:
            # Preguntas
            q_count = await db.pregunta.count(where={'moduloId': m.id})
            print(f"  - [{m.tipo}] {m.titulo}: {q_count} preguntas")

    total_preguntas = await db.pregunta.count()
    print(f"\nTOTAL PREGUNTAS EN BD: {total_preguntas}")
    
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
