import asyncio
from prisma import Prisma
from passlib.context import CryptContext

# Configuración
ADMIN_EMAIL = "admin@vmpservicios.com"
ADMIN_PASS = "AdminVMP2026!"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def main():
    db = Prisma()
    await db.connect()
    
    print(f"Connecting to DB...")
    
    # Hash password
    hashed = pwd_context.hash(ADMIN_PASS)
    
    # Check if exists
    exists = await db.user.find_unique(where={'email': ADMIN_EMAIL})
    if exists:
        print(f"Admin already exists: {exists.email}")
        await db.disconnect()
        return

    # Create Admin
    user = await db.user.create(
        data={
            'email': ADMIN_EMAIL,
            'passwordHash': hashed,
            'nombre': 'Super',
            'apellido': 'Admin',
            'rol': 'SUPER_ADMIN',
            'dni': '00000000',
            'telefono': '0000000000',
            'activo': True
        }
    )
    
    print(f"✅ Created Admin User:")
    print(f"Email: {user.email}")
    print(f"Password: {ADMIN_PASS}")
    
    await db.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
