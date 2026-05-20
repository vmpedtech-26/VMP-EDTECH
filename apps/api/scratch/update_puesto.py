import asyncio
from core.database import prisma
from auth.jwt import hash_password

async def update_users_puesto():
    await prisma.connect()
    try:
        users_to_update = [
            {"nombre": "Matias", "apellido": "Silva", "dni": "11111111", "email": "matias.silva@example.com"},
            {"nombre": "Mia", "apellido": "Toneloto", "dni": "22222222", "email": "mia.toneloto@example.com"},
            {"nombre": "Gabriel", "apellido": "Narambuena", "dni": "33333333", "email": "gabriel.narambuena@example.com"}
        ]
        
        for u_data in users_to_update:
            # Buscar por nombre y apellido
            user = await prisma.user.find_first(
                where={
                    "nombre": {"contains": u_data["nombre"]},
                    "apellido": {"contains": u_data["apellido"]}
                }
            )
            
            if not user:
                print(f"Creando usuario {u_data['nombre']} {u_data['apellido']}...")
                user = await prisma.user.create(
                    data={
                        "nombre": u_data["nombre"],
                        "apellido": u_data["apellido"],
                        "dni": u_data["dni"],
                        "email": u_data["email"],
                        "passwordHash": hash_password("Vmp2026!"),
                        "puesto": "Tecnico HSE"
                    }
                )
            else:
                print(f"Actualizando usuario {user.nombre} {user.apellido}...")
                await prisma.user.update(
                    where={"id": user.id},
                    data={"puesto": "Tecnico HSE"}
                )
                
            # También actualizar sus credenciales si existen
            await prisma.credencial.update_many(
                where={"alumnoId": user.id},
                data={"puesto": "Tecnico HSE"}
            )
            
        print("✅ Usuarios y credenciales actualizados con puesto 'Tecnico HSE'")
            
    finally:
        await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(update_users_puesto())
