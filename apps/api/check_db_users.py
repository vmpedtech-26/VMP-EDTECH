import asyncio
import json
from core.database import prisma

async def check_users():
    try:
        await prisma.connect()
        users = await prisma.user.find_many(include={"empresa": True})
        
        user_list = []
        for user in users:
            user_list.append({
                "id": user.id,
                "email": user.email,
                "rol": user.rol,
                "nombre": user.nombre,
                "empresa": user.empresa.nombre if user.empresa else None
            })
        
        print(json.dumps(user_list, indent=2))
        await prisma.disconnect()
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(check_users())
