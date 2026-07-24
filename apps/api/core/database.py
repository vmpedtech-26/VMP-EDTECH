import os
import sys
import subprocess
import asyncio
from prisma import Prisma

# Singleton Prisma client instance referenced by all routers
prisma = Prisma()
_db_lock = asyncio.Lock()

NEON_DB_FALLBACK = "postgresql://neondb_owner:npg_r3ATep2kCBGc@ep-snowy-river-axaapsnr-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"

async def connect_db():
    async with _db_lock:
        if not prisma.is_connected():
            db_url = os.environ.get("DATABASE_URL", "").strip().strip('"').strip("'")
            if not db_url:
                db_url = NEON_DB_FALLBACK
            os.environ["DATABASE_URL"] = db_url
            
            try:
                await prisma.connect(timeout=15000)
                print("✅ Database connected successfully to Neon PostgreSQL")
            except Exception as e:
                print(f"⚠️ Initial prisma.connect() notice: {e}. Running self-healing binary fetch...")
                try:
                    subprocess.run([sys.executable, "-m", "prisma", "py", "fetch"], check=False)
                    subprocess.run([sys.executable, "-m", "prisma", "generate"], check=False)
                    await prisma.connect(timeout=15000)
                    print("✅ Database connected successfully on self-healing retry")
                except Exception as e2:
                    print(f"❌ Critical DB connect error: {e2}")
                    try:
                        await prisma.disconnect()
                    except Exception:
                        pass
                    raise e2

async def ensure_db_connected():
    """Ensure DB is connected, call this before queries if needed"""
    if not prisma.is_connected():
        await connect_db()

async def disconnect_db():
    async with _db_lock:
        if prisma.is_connected():
            await prisma.disconnect()
            print("❌ Database disconnected")
