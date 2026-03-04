import asyncio
from prisma import Prisma

async def main():
    db = Prisma()
    await db.connect()
    
    users = await db.user.find_many(where={'rol': 'SUPER_ADMIN'})
    if not users:
        print("No SUPER_ADMIN found.")
    else:
        for u in users:
            print(f"Email: {u.email}, Activo: {u.activo}")
            
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
