import os
import asyncio
from prisma import Prisma

os.environ["DATABASE_URL"] = "postgresql://postgres:bngWhFAsXfcaZxWHVzLCDIbleiGMxAvK@nozomi.proxy.rlwy.net:29586/railway"

async def check():
    db = Prisma()
    await db.connect()
    
    users = await db.user.find_many()
    print("Found users:", len(users))
    for u in users:
        print(f"User: {u.email}, Rol: {u.rol}, Activo: {u.activo}")
        
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(check())
