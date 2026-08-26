"""
Seed de datos fijos para la suite E2E (Playwright) del job `e2e-tests` de CI.

Corre exclusivamente contra la base Postgres efímera que levanta ese job
(ver .github/workflows/ci.yml) -- nunca debe apuntarse a una base real.
Los emails/contraseñas acá deben coincidir con los que usan los specs en
apps/web/tests/e2e/.
"""
import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import prisma
from auth.jwt import hash_password


async def seed():
    await prisma.user.create(
        data={
            "email": "admin@example.com",
            "passwordHash": hash_password("adminpass123"),
            "nombre": "Admin",
            "apellido": "E2E",
            "dni": "11111111",
            "rol": "SUPER_ADMIN",
            "activo": True,
        }
    )

    await prisma.user.create(
        data={
            "email": "test@example.com",
            "passwordHash": hash_password("testpass123"),
            "nombre": "Test",
            "apellido": "E2E",
            "dni": "22222222",
            "rol": "ALUMNO",
            "activo": True,
        }
    )

    await prisma.curso.create(
        data={
            "nombre": "Manejo Defensivo",
            "codigo": "COND-DEF",
            "descripcion": "Curso de manejo defensivo",
            "duracionHoras": 40,
            "activo": True,
        }
    )

    await prisma.cotizacion.create(
        data={
            "empresa": "E2E Test Company",
            "cuit": "20-11111111-1",
            "nombre": "Jane Doe",
            "email": "contact@e2etestcompany.com",
            "telefono": "1234567890",
            "quantity": 3,
            "course": "defensivo",
            "modality": "online",
            "totalPrice": 30000,
            "pricePerStudent": 10000,
            "discount": 0,
            "acceptMarketing": True,
            "acceptTerms": True,
            "status": "contacted",
        }
    )

    print("Seed E2E completo: admin@example.com, test@example.com, curso COND-DEF, cotización 'contacted'.")


async def main():
    await prisma.connect()
    try:
        await seed()
    finally:
        await prisma.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
