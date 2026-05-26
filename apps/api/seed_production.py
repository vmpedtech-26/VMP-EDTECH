import asyncio
import os
from prisma import Prisma
from auth.jwt import hash_password

async def seed():
    prisma = Prisma()
    await prisma.connect()
    
    print("🌱 Iniciando seed de producción...")
    
    # 1. Crear Super Admin si no existe
    admin_email = os.getenv("ADMIN_EMAIL", "admin@vmpservicios.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "VmpAdmin2026!")
    
    admin = await prisma.user.find_unique(where={"email": admin_email})
    
    if not admin:
        print(f"Creando Super Admin: {admin_email}")
        await prisma.user.create(
            data={
                "email": admin_email,
                "passwordHash": hash_password(admin_password),
                "nombre": "Administrador",
                "apellido": "VMP",
                "dni": "00000000",
                "rol": "SUPER_ADMIN",
                "activo": True
            }
        )
    else:
        print("Super Admin ya existe.")
        
    # 2. Cursos Fundamentales
    cursos = [
        {
            "nombre": "Manejo Defensivo Livianos",
            "codigo": "MDL-001",
            "descripcion": "Curso teórico-práctico de manejo defensivo para vehículos livianos.",
            "duracionHoras": 20,
            "vigenciaMeses": 24
        },
        {
            "nombre": "Manejo Defensivo Pesados",
            "codigo": "MDP-001",
            "descripcion": "Curso teórico-práctico de manejo defensivo para vehículos pesados y transporte de carga.",
            "duracionHoras": 40,
            "vigenciaMeses": 24
        },
        {
            "nombre": "Primeros Auxilios y RCP",
            "codigo": "PA-001",
            "descripcion": "Capacitación básica en primeros auxilios y reanimación cardiopulmonar.",
            "duracionHoras": 8,
            "vigenciaMeses": 24
        }
    ]
    
    for curso_data in cursos:
        existing = await prisma.curso.find_unique(where={"codigo": curso_data["codigo"]})
        if not existing:
            print(f"Creando curso: {curso_data['nombre']}")
            await prisma.curso.create(data=curso_data)
        else:
            print(f"Curso ya existe: {curso_data['nombre']}")
            
    await prisma.disconnect()
    print("✅ Seed completado!")

if __name__ == "__main__":
    asyncio.run(seed())
