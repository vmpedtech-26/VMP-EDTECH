from fastapi import APIRouter, HTTPException, Depends
from core.database import prisma
from auth.jwt import hash_password
import os

router = APIRouter()

@router.post("/run")
async def run_seed():
    print("🌱 Iniciando seed desde API...")
    
    # 1. Crear Super Admin if not exists
    admin_email = os.getenv("ADMIN_EMAIL", "admin@vmpservicios.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "VmpAdmin2026!")
    
    try:
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
            created_admin = True
        else:
            print("Super Admin ya existe.")
            created_admin = False
            
        # 2. Cursos Fundamentales
        cursos = [
            {
                "nombre": "Manejo Defensivo Livianos",
                "codigo": "MDL-001",
                "descripcion": "Curso teórico-práctico de manejo defensivo para vehículos livianos.",
                "duracionHoras": 20,
                "vigenciaMeses": 12
            },
            {
                "nombre": "Manejo Defensivo Pesados",
                "codigo": "MDP-001",
                "descripcion": "Curso teórico-práctico de manejo defensivo para vehículos pesados y transporte de carga.",
                "duracionHoras": 40,
                "vigenciaMeses": 12
            },
            {
                "nombre": "Primeros Auxilios y RCP",
                "codigo": "PA-001",
                "descripcion": "Capacitación básica en primeros auxilios y reanimación cardiopulmonar.",
                "duracionHoras": 8,
                "vigenciaMeses": 24
            }
        ]
        
        created_cursos = []
        for curso_data in cursos:
            existing = await prisma.curso.find_unique(where={"codigo": curso_data["codigo"]})
            if not existing:
                print(f"Creando curso: {curso_data['nombre']}")
                await prisma.curso.create(data=curso_data)
                created_cursos.append(curso_data['nombre'])
        
        return {
            "status": "success",
            "message": "Seed completed",
            "admin_created": created_admin,
            "cursos_created": created_cursos
        }
    except Exception as e:
        print(f"❌ Error en seed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
