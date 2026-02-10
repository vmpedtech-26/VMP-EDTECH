import asyncio
import bcrypt
from passlib.context import CryptContext
from core.database import prisma

# Monkeypatch for passlib + bcrypt + Python 3.14 compatibility
if not hasattr(bcrypt, "__about__"):
    bcrypt.__about__ = type("About", (), {"__version__": bcrypt.__version__})

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def create_admin():
    await prisma.connect()
    password_hash = pwd_context.hash("admin123")
    
    try:
        # Check if admin already exists
        existing = await prisma.user.find_unique(where={"email": "admin@test.com"})
        if existing:
            print(f"⚠️  Admin already exists: {existing.email}")
            return

        admin = await prisma.user.create(
            data={
                "email": "admin@test.com",
                "passwordHash": password_hash,
                "nombre": "Admin",
                "apellido": "Test",
                "dni": "12345678",
                "telefono": "1234567890",
                "rol": "SUPER_ADMIN",
                "activo": True
            }
        )
        print(f"✅ Admin created: {admin.email}")
        print(f"   Password: admin123")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await prisma.disconnect()

asyncio.run(create_admin())
