import asyncio
import os
import sys

# Add apps/api to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../apps/api')))

from core.database import prisma, connect_db, disconnect_db

async def main():
    await connect_db()
    try:
        # Get count of all enrollments
        total = await prisma.inscripcion.count()
        print(f"Total enrollments: {total}")
        
        # Get all enrollments with their details
        enrollments = await prisma.inscripcion.find_many(
            include={
                "alumno": True,
                "curso": True
            }
        )
        
        print("\n--- Enrollments list ---")
        for en in enrollments:
            print(f"ID: {en.id} | Alumno: {en.alumno.nombre} {en.alumno.apellido} ({en.alumno.email})")
            print(f"  Curso: {en.curso.nombre} | Progreso: {en.progreso}% | Estado: {en.estado}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await disconnect_db()

if __name__ == "__main__":
    asyncio.run(main())
