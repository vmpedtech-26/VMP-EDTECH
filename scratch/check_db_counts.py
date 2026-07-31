import asyncio
import os
import sys

# Add apps/api to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../apps/api')))

from core.database import prisma, connect_db, disconnect_db

async def main():
    await connect_db()
    try:
        users = await prisma.user.count()
        companies = await prisma.company.count()
        courses = await prisma.curso.count()
        enrollments = await prisma.inscripcion.count()
        quotes = await prisma.cotizacion.count()
        credentials = await prisma.credencial.count()
        
        print(f"Users: {users}")
        print(f"Companies: {companies}")
        print(f"Courses: {courses}")
        print(f"Enrollments: {enrollments}")
        print(f"Quotes: {quotes}")
        print(f"Credentials: {credentials}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await disconnect_db()

if __name__ == "__main__":
    asyncio.run(main())
