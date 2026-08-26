"""
Tests para routers/users.py: control de acceso de INSTRUCTOR sobre usuarios
de su propia empresa (debe alcanzar solo a ALUMNOs, no a otros INSTRUCTOR o
EMPRESA de la misma compañía) y verificación de unicidad de email/DNI al
actualizar.
"""
import pytest
from httpx import AsyncClient
from core.database import prisma
from auth.jwt import hash_password, create_access_token


@pytest.fixture
async def empresa_test(db):
    empresa = await prisma.company.create(
        data={
            "nombre": "Empresa Users Test",
            "cuit": "20-55555555-5",
            "email": "empresa-users-test@test.com",
            "activa": True,
        }
    )
    yield empresa
    await prisma.company.delete(where={"id": empresa.id})


@pytest.fixture
async def instructor_test(db, empresa_test):
    instructor = await prisma.user.create(
        data={
            "email": "instructor-users-test@test.com",
            "passwordHash": hash_password("instructor123"),
            "nombre": "Instructor",
            "apellido": "Test",
            "dni": "77777777",
            "rol": "INSTRUCTOR",
            "empresaId": empresa_test.id,
            "activo": True,
        }
    )
    token = create_access_token(data={"sub": instructor.id})
    yield instructor, token
    await prisma.user.delete(where={"id": instructor.id})


@pytest.fixture
async def alumno_misma_empresa(db, empresa_test):
    alumno = await prisma.user.create(
        data={
            "email": "alumno-users-test@test.com",
            "passwordHash": hash_password("alumno123"),
            "nombre": "Alumno",
            "apellido": "Test",
            "dni": "66666666",
            "rol": "ALUMNO",
            "empresaId": empresa_test.id,
            "activo": True,
        }
    )
    yield alumno
    existing = await prisma.user.find_unique(where={"id": alumno.id})
    if existing:
        await prisma.user.delete(where={"id": alumno.id})


@pytest.fixture
async def otro_instructor_misma_empresa(db, empresa_test):
    otro = await prisma.user.create(
        data={
            "email": "otro-instructor-users-test@test.com",
            "passwordHash": hash_password("instructor123"),
            "nombre": "Otro",
            "apellido": "Instructor",
            "dni": "88888888",
            "rol": "INSTRUCTOR",
            "empresaId": empresa_test.id,
            "activo": True,
        }
    )
    yield otro
    await prisma.user.delete(where={"id": otro.id})


class TestAccesoInstructorSobreUsuarios:
    @pytest.mark.asyncio
    async def test_instructor_no_puede_ver_a_otro_instructor_de_su_empresa(
        self, client: AsyncClient, instructor_test, otro_instructor_misma_empresa
    ):
        _, token = instructor_test
        response = await client.get(
            f"/api/users/{otro_instructor_misma_empresa.id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_instructor_no_puede_editar_a_otro_instructor_de_su_empresa(
        self, client: AsyncClient, instructor_test, otro_instructor_misma_empresa
    ):
        _, token = instructor_test
        response = await client.put(
            f"/api/users/{otro_instructor_misma_empresa.id}",
            headers={"Authorization": f"Bearer {token}"},
            json={"nombre": "Nombre Cambiado"},
        )
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_instructor_no_puede_eliminar_a_otro_instructor_de_su_empresa(
        self, client: AsyncClient, instructor_test, otro_instructor_misma_empresa
    ):
        _, token = instructor_test
        response = await client.delete(
            f"/api/users/{otro_instructor_misma_empresa.id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_instructor_si_puede_ver_y_editar_alumno_de_su_empresa(
        self, client: AsyncClient, instructor_test, alumno_misma_empresa
    ):
        _, token = instructor_test

        get_response = await client.get(
            f"/api/users/{alumno_misma_empresa.id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert get_response.status_code == 200

        put_response = await client.put(
            f"/api/users/{alumno_misma_empresa.id}",
            headers={"Authorization": f"Bearer {token}"},
            json={"nombre": "Alumno Renombrado"},
        )
        assert put_response.status_code == 200
        assert put_response.json()["nombre"] == "Alumno Renombrado"


class TestActualizarUsuarioUnicidad:
    @pytest.mark.asyncio
    async def test_no_permite_actualizar_a_email_ya_registrado(
        self, client: AsyncClient, admin_token, alumno_misma_empresa, empresa_test
    ):
        otro = await prisma.user.create(
            data={
                "email": "email-existente-users-test@test.com",
                "passwordHash": hash_password("alumno123"),
                "nombre": "Otro",
                "apellido": "Alumno",
                "dni": "99999999",
                "rol": "ALUMNO",
                "empresaId": empresa_test.id,
                "activo": True,
            }
        )

        response = await client.put(
            f"/api/users/{alumno_misma_empresa.id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"email": otro.email},
        )

        assert response.status_code == 400

        await prisma.user.delete(where={"id": otro.id})
