import asyncio
import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

try:
    from core.database import prisma
    from prisma.models import User
except ImportError as e:
    print(f"Error importing: {e}")
    sys.exit(1)

async def list_users():
    print("Connecting to DB...")
    try:
        await prisma.connect()
        print("Connected.")
        users = await prisma.user.find_many()
        print(f"Found {len(users)} users.")
        print("-" * 50)
        print(f"{'EMAIL':<30} | {'ROL':<15} | {'NOMBRE'}")
        print("-" * 50)
        for user in users:
            print(f"{user.email:<30} | {user.rol:<15} | {user.nombre} {user.apellido}")
        await prisma.disconnect()
    except Exception as e:
        print(f"Error querying DB: {e}")

if __name__ == "__main__":
    asyncio.run(list_users())
