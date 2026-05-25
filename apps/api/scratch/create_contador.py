import asyncio
import bcrypt
from passlib.context import CryptContext
from core.database import prisma

# Monkeypatch for passlib + bcrypt + Python 3.14 compatibility
if not hasattr(bcrypt, "__about__"):
    bcrypt.__about__ = type("About", (), {"__version__": bcrypt.__version__})

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_contador():
    await prisma.connect()
    password = "CastilloContable2026!"
    password_hash = pwd_context.hash(password)
    email = "contacto@estudiocastillo.com"
    
    try:
        # Verificar si ya existe
        existing = await prisma.user.find_unique(where={"email": email})
        if existing:
            print(f"⚠️ El usuario contador ya existe: {existing.email}")
            # Si existe pero no tiene el rol CONTADOR, lo actualizamos
            if existing.rol != "CONTADOR":
                updated = await prisma.user.update(
                    where={"email": email},
                    data={"rol": "CONTADOR"}
                )
                print(f"🔄 Rol actualizado a CONTADOR para: {updated.email}")
            return

        user = await prisma.user.create(
            data={
                "email": email,
                "passwordHash": password_hash,
                "nombre": "Estudio",
                "apellido": "Castillo",
                "dni": "99887766",
                "telefono": "1122334455",
                "rol": "CONTADOR",
                "activo": True
            }
        )
        print(f"✅ Usuario Contador Creado Exitosamente!")
        print(f"   Email: {user.email}")
        print(f"   Contraseña: {password}")
        print(f"   Rol: {user.rol}")
        print(f"   DNI: {user.dni}")
    except Exception as e:
        print(f"❌ Error al crear usuario: {e}")
    finally:
        await prisma.disconnect()

asyncio.run(create_contador())
