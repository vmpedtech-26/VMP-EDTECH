import asyncio
import os
import sys
from dotenv import load_dotenv

# Load env from apps/api/.env BEFORE importing any app code
load_dotenv("apps/api/.env")

# Add apps/api to path
sys.path.append(os.path.abspath("apps/api"))

from core.database import prisma, connect_db, disconnect_db
from auth.jwt import hash_password



async def run():

    try:
        await connect_db()
        email = "administracion@vmp-edtech.com"
        pwd = "VmpAdmin2026!"
        print(f"Reseteando password para {email}...")
        await prisma.user.update(
            where={"email": email},
            data={"passwordHash": hash_password(pwd)}
        )
        print("✅ Password reset exitoso a: " + pwd)
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await disconnect_db()

if __name__ == "__main__":
    asyncio.run(run())
