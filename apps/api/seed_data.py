import asyncio
import os
from core.database import prisma
from auth.jwt import hash_password

async def main():
    print("🌱 Iniciando seed de datos...")
    try:
        await prisma.connect()
        
        # 1. Crear Super Admin if not exists
        admin_email = "admin@vmpservicios.com"
        admin_password = "VmpAdmin2026!"
        
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
            },
            {
                "nombre": "Manejo Defensivo (Original Mapping)",
                "codigo": "COND-DEF",
                "descripcion": "Curso de conducción defensiva (Mapeo original).",
                "duracionHoras": 20,
                "vigenciaMeses": 24
            }
        ]
        
        for curso_data in cursos:
            existing = await prisma.curso.find_unique(where={"codigo": curso_data["codigo"]})
            if not existing:
                print(f"Creando curso: {curso_data['nombre']}")
                await prisma.curso.create(data=curso_data)
            else:
                print(f"Curso {curso_data['nombre']} ya existe.")
        
        print("✅ Seed completado!")
    except Exception as e:
        print(f"❌ Error en seed: {e}")
    finally:
        await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
