from prisma import Prisma

# Prisma lee la URL desde schema.prisma (DATABASE_URL en .env)
prisma = Prisma()

async def connect_db():
    await prisma.connect()
    print("✅ Database connected")

async def disconnect_db():
    await prisma.disconnect()
    print("❌ Database disconnected")
