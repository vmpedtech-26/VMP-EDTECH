from prisma import Prisma

# Prisma instance
prisma = Prisma()

async def connect_db():
    if not prisma.is_connected():
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
