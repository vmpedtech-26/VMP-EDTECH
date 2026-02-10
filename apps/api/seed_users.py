import asyncio
import bcrypt
from passlib.context import CryptContext
from core.database import prisma

if not hasattr(bcrypt, "__about__"):
    bcrypt.__about__ = type("About", (), {"__version__": bcrypt.__version__})

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_user(email, password, role, name, last_name, dni):
    try:
        existing = await prisma.user.find_unique(where={"email": email})
        if existing:
            print(f"User {email} already exists.")
            return

        print(f"Creating user {email}...")
        password_hash = pwd_context.hash(password)
        await prisma.user.create(
            data={
                "email": email,
                "passwordHash": password_hash,
                "nombre": name,
                "apellido": last_name,
                "dni": dni,
                "rol": role,
                "activo": True
            }
        )
        print(f"Created {role}: {email} / {password}")
    except Exception as e:
        print(f"Error creating {email}: {e}")

async def main():
    try:
        await prisma.connect()
        # Admin
        await create_user("admin@vmp.com", "admin123", "SUPER_ADMIN", "Admin", "User", "11111111")
        # Instructor
        await create_user("instructor@vmp.com", "instructor123", "INSTRUCTOR", "Carlos", "Instructor", "22222222")
        # Student
        await create_user("alumno@vmp.com", "alumno123", "ALUMNO", "Juan", "Alumno", "33333333")
    finally:
        await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
