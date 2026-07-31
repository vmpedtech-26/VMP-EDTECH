import asyncio
from core.database import prisma

async def update_courses():
    await prisma.connect()
    try:
        print("🔄 Actualizando todos los cursos a una vigencia de 24 meses...")
        count = await prisma.curso.update_many(
            where={},
            data={"vigenciaMeses": 24}
        )
        print(f"✅ Se actualizaron los cursos en la base de datos.")
    except Exception as e:
        print(f"❌ Error al actualizar los cursos: {e}")
    finally:
        await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(update_courses())
