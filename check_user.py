import asyncio
import os
import sys

# Add apps/api to path
sys.path.append(os.path.abspath("apps/api"))

from core.database import prisma, connect_db, disconnect_db

async def check():
    try:
        await connect_db()
        users = await prisma.user.find_many()
        if users:
            for u in users:
                print(f"USER: {u.email} | ROLE: {u.rol} | DNI: {u.dni}")
        else:
            print("NO_USERS_FOUND")
    except Exception as e:
        print(f"ERROR: {e}")
    finally:
        await disconnect_db()


if __name__ == "__main__":
    asyncio.run(check())
