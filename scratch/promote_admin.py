import asyncio
from prisma import Prisma
from auth.jwt import hash_password

async def main():
    db = Prisma()
    await db.connect()
    
    email = "admin@vmpservicios.com"
    password = "AdminVMP2026!"
    hashed = hash_password(password)
    
    user = await db.user.find_unique(where={"email": email})
    if user:
        print(f"User found: {user.email} (current role: {user.rol})")
        # Update user to SUPER_ADMIN and set password
        updated = await db.user.update(
            where={"email": email},
            data={
                "rol": "SUPER_ADMIN",
                "passwordHash": hashed,
                "nombre": "Super",
                "apellido": "Admin",
                "activo": True
            }
        )
        print(f"✅ User promoted to SUPER_ADMIN and password set to '{password}' successfully!")
    else:
        print("User not found. Creating a new SUPER_ADMIN user...")
        created = await db.user.create(
            data={
                "email": email,
                "passwordHash": hashed,
                "nombre": "Super",
                "apellido": "Admin",
                "rol": "SUPER_ADMIN",
                "dni": "00000000",
                "telefono": "0000000000",
                "activo": True
            }
        )
        print(f"✅ Created new SUPER_ADMIN user: {created.email} with password '{password}'")
        
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
