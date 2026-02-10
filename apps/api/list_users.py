import asyncio
from core.database import prisma

async def list_users():
    await prisma.connect()
    users = await prisma.user.find_many()
    print("Email | Rol | Nombre")
    print("-" * 30)
    for user in users:
        print(f"{user.email} | {user.rol} | {user.nombre}")
    await prisma.disconnect()

asyncio.run(list_users())
