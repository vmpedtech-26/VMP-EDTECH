from datetime import timedelta

from prisma import Prisma

# Prisma lee la URL desde schema.prisma (DATABASE_URL en .env)
prisma = Prisma()

async def connect_db():
    # Timeout mas generoso que el default (10s): en el plan free de Render
    # (0.1 CPU) el binario del query engine puede tardar mas en levantar.
    await prisma.connect(timeout=timedelta(seconds=30))
    print("✅ Database connected")

async def disconnect_db():
    await prisma.disconnect()
    print("❌ Database disconnected")
