import asyncio
from prisma import Prisma
import json
import os

async def main():
    os.environ["PRISMA_PY_DEBUG_GENERATOR"] = "1"
    prisma = Prisma()
    await prisma.connect()
    try:
        print("👥 1. ACTIVE USERS IN THE DATABASE:")
        users = await prisma.user.find_many(
            take=20,
            order={"createdAt": "desc"}
        )
        for u in users:
            print(f"   - Name: {u.nombre} {u.apellido} | Email: {u.email} | Rol: {u.rol} | Active: {u.activo}")
            
        print("\n📝 2. LAST 15 AUDIT LOGS:")
        logs = await prisma.auditlog.find_many(
            take=15,
            order={"createdAt": "desc"}
        )
        for l in logs:
            print(f"   - Action: {l.action} | Email: {l.userEmail} | Details: {l.details} | Request ID: {l.requestId}")
            
        print("\n🎓 3. COURSE INSCRIPTIONS (ENROLLMENTS):")
        inscriptions = await prisma.inscripcion.find_many(
            include={"alumno": True, "curso": True},
            take=20
        )
        for ins in inscriptions:
            print(f"   - Student: {ins.alumno.nombre} {ins.alumno.apellido} ({ins.alumno.email}) | Course: {ins.curso.nombre} | Progress: {ins.progreso}% | Estado: {ins.estado}")
            
    finally:
        await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
