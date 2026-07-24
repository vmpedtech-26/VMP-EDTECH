import os
import asyncio
from prisma import Prisma

prisma = Prisma()
_db_lock = asyncio.Lock()

async def connect_db():
    async with _db_lock:
        if not prisma.is_connected():
            db_url = os.environ.get("DATABASE_URL", "")
            if db_url:
                clean_url = db_url.strip().strip('"').strip("'")
                os.environ["DATABASE_URL"] = clean_url
            try:
                await prisma.connect()
                print("✅ Database connected successfully")
            except Exception as e:
                print(f"❌ Error during prisma.connect(): {e}")
                raise e

async def ensure_db_connected():
    """Ensure DB is connected, call this before queries if needed"""
    if not prisma.is_connected():
        await connect_db()

async def disconnect_db():
    async with _db_lock:
        if prisma.is_connected():
            await prisma.disconnect()
            print("❌ Database disconnected")
