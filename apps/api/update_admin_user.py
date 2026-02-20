import asyncio
from auth.jwt import hash_password
from core.database import prisma

async def update_admin():
    try:
        await prisma.connect()
        
        email = "administracion@vmp-edtech.com"
        password = "pedro1973"
        hashed_password = hash_password(password)
        
        # Check if user exists
        user = await prisma.user.find_unique(where={"email": email})
        
        if user:
            # Update existing user
            updated_user = await prisma.user.update(
                where={"email": email},
                data={
                    "passwordHash": hashed_password,
                    "rol": "SUPER_ADMIN",
                    "activo": True,
                    "nombre": "Administración",
                    "apellido": "VMP"
                }
            )
            print(f"✅ User updated: {updated_user.email}")
        else:
            # Create new user
            new_user = await prisma.user.create(
                data={
                    "email": email,
                    "passwordHash": hashed_password,
                    "nombre": "Administración",
                    "apellido": "VMP",
                    "dni": "00000000", # Placeholder
                    "telefono": "2995370173",
                    "rol": "SUPER_ADMIN",
                    "activo": True
                }
            )
            print(f"✅ New user created: {new_user.email}")
            
        await prisma.disconnect()
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(update_admin())
