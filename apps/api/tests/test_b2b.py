"""
Tests para routers/b2b.py: el chequeo de acceso anterior ("rol not in [...]
and not empresaId") dejaba pasar a cualquier usuario con empresaId (incluido
un ALUMNO) y a un SUPERVISOR sin empresaId, terminando en consultas con
empresaId=None que devolvían cuentas huérfanas de toda la plataforma.
"""
import pytest
from httpx import AsyncClient
from core.database import prisma
from auth.jwt import hash_password, create_access_token


async def _crear_usuario(email: str, rol: str, dni: str, empresa_id=None):
    user = await prisma.user.create(
        data={
            "email": email,
            "passwordHash": hash_password("test12345"),
            "nombre": "Test",
            "apellido": rol,
            "dni": dni,
            "rol": rol,
            "empresaId": empresa_id,
            "activo": True,
        }
    )
    token = create_access_token(data={"sub": user.id})
    return user, token


@pytest.fixture
async def empresa_a(db):
    empresa = await prisma.company.create(
        data={
            "nombre": "Empresa B2B A",
            "cuit": "20-44444444-4",
            "email": "empresa-a-b2b-test@test.com",
            "activa": True,
        }
    )
    yield empresa
    await prisma.company.delete(where={"id": empresa.id})


@pytest.fixture
async def empresa_b(db):
    empresa = await prisma.company.create(
        data={
            "nombre": "Empresa B2B B",
            "cuit": "20-33333333-3",
            "email": "empresa-b-b2b-test@test.com",
            "activa": True,
        }
    )
    yield empresa
    await prisma.company.delete(where={"id": empresa.id})


class TestAccesoB2B:
    @pytest.mark.asyncio
    async def test_alumno_con_empresa_no_puede_acceder_al_panel_b2b(self, client: AsyncClient, empresa_a):
        alumno, token = await _crear_usuario(
            "alumno-con-empresa-b2b-test@test.com", "ALUMNO", "11122233", empresa_a.id
        )

        response = await client.get(
            "/api/b2b/dashboard",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 403

        await prisma.user.delete(where={"id": alumno.id})

    @pytest.mark.asyncio
    async def test_supervisor_sin_empresa_no_puede_acceder(self, client: AsyncClient):
        supervisor, token = await _crear_usuario(
            "supervisor-sin-empresa-b2b-test@test.com", "SUPERVISOR", "22233344", None
        )

        response = await client.get(
            "/api/b2b/dashboard",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 400

        await prisma.user.delete(where={"id": supervisor.id})

    @pytest.mark.asyncio
    async def test_empresa_solo_ve_sus_propios_empleados(self, client: AsyncClient, empresa_a, empresa_b):
        portal_a, token_a = await _crear_usuario(
            "portal-a-b2b-test@test.com", "EMPRESA", "33344455", empresa_a.id
        )
        empleado_a, _ = await _crear_usuario(
            "empleado-a-b2b-test@test.com", "ALUMNO", "44455566", empresa_a.id
        )
        empleado_b, _ = await _crear_usuario(
            "empleado-b-b2b-test@test.com", "ALUMNO", "55566677", empresa_b.id
        )

        response = await client.get(
            "/api/b2b/dashboard",
            headers={"Authorization": f"Bearer {token_a}"},
        )

        assert response.status_code == 200
        data = response.json()
        ids_devueltos = {e["id"] for e in data["employees"]}
        assert empleado_a.id in ids_devueltos
        assert empleado_b.id not in ids_devueltos

        await prisma.user.delete(where={"id": portal_a.id})
        await prisma.user.delete(where={"id": empleado_a.id})
        await prisma.user.delete(where={"id": empleado_b.id})
