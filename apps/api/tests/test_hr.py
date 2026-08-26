"""
Tests para routers/hr.py: list_employees() solo filtraba por empresaId "si"
ese valor era verdadero -- un INSTRUCTOR sin empresa asignada terminaba
viendo alumnos de toda la plataforma en vez de una lista vacía.
"""
import pytest
from httpx import AsyncClient
from core.database import prisma
from auth.jwt import hash_password, create_access_token


class TestListEmployeesAlcanceInstructor:
    @pytest.mark.asyncio
    async def test_instructor_sin_empresa_no_ve_alumnos_de_otras_empresas(self, client: AsyncClient, db):
        instructor = await prisma.user.create(
            data={
                "email": "instructor-sin-empresa-hr-test@test.com",
                "passwordHash": hash_password("instructor123"),
                "nombre": "Instructor",
                "apellido": "SinEmpresa",
                "dni": "78978978",
                "rol": "INSTRUCTOR",
                "empresaId": None,
                "activo": True,
            }
        )
        token = create_access_token(data={"sub": instructor.id})

        empresa = await prisma.company.create(
            data={
                "nombre": "Empresa HR Test",
                "cuit": "20-11199988-7",
                "email": "empresa-hr-test@test.com",
                "activa": True,
            }
        )
        alumno = await prisma.user.create(
            data={
                "email": "alumno-hr-test@test.com",
                "passwordHash": hash_password("alumno123"),
                "nombre": "Alumno",
                "apellido": "HR",
                "dni": "65465465",
                "rol": "ALUMNO",
                "empresaId": empresa.id,
                "activo": True,
            }
        )

        response = await client.get(
            "/api/hr/employees",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        ids = {e["id"] for e in data["items"]}
        assert alumno.id not in ids

        await prisma.user.delete(where={"id": alumno.id})
        await prisma.company.delete(where={"id": empresa.id})
        await prisma.user.delete(where={"id": instructor.id})
