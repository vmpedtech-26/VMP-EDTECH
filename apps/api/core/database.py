import os
from prisma import Prisma

prisma = Prisma()

async def connect_db():
    if not prisma.is_connected():
        db_url = os.environ.get("DATABASE_URL", "")
        if db_url:
            clean_url = db_url.strip().strip('"').strip("'")
            os.environ["DATABASE_URL"] = clean_url
        await prisma.connect()
        print("✅ Database connected")

async def ensure_db_connected():
    """Ensure DB is connected, call this before queries if needed"""
    if not prisma.is_connected():
        await connect_db()

async def disconnect_db():
    if prisma.is_connected():
        await prisma.disconnect()
        print("❌ Database disconnected")
