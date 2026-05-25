import asyncio
from prisma import Prisma
import os

async def main():
    os.environ["PRISMA_PY_DEBUG_GENERATOR"] = "1"
    prisma = Prisma()
    await prisma.connect()
    try:
        user_email = "administracion@vmp-edtech.com"
        print(f"🔍 Buscando usuario '{user_email}'...")
        user = await prisma.user.find_unique(where={"email": user_email})
        
        if user:
            print(f"👤 Usuario encontrado: {user.nombre} {user.apellido} | Rol actual: {user.rol}")
            if user.rol != "SUPER_ADMIN":
                print("🚀 Promocionando a SUPER_ADMIN...")
                await prisma.user.update(
                    where={"id": user.id},
                    data={"rol": "SUPER_ADMIN"}
                )
                print("✅ Promoción completada con éxito.")
            else:
                print("ℹ️ El usuario ya es SUPER_ADMIN.")
        else:
            print(f"❌ No se encontró el usuario '{user_email}' en la base de datos.")
            
    finally:
        await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
