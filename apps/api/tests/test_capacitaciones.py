"""
Tests para routers/capacitaciones.py:
- history() y clientes_customers() llamaban a find_many(order_by=...) --
  el cliente de Prisma-Python solo acepta `order`, así que ambos endpoints
  siempre devolvían 500 (history sin ningún try/except que lo enmascarara).
- create_training_request() recibía un dict crudo sin validar que
  empresaId/cursoId existan; un id inválido explotaba como 500 sin manejar.
"""
import pytest
from httpx import AsyncClient
from core.database import prisma


class TestOrderByFix:
    @pytest.mark.asyncio
    async def test_history_no_rompe_con_order_by(self, client: AsyncClient, admin_token, db):
        response = await client.get(
            "/api/capacitaciones/history",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert response.status_code == 200
        assert "items" in response.json()

    @pytest.mark.asyncio
    async def test_clientes_customers_no_rompe_con_order_by(self, client: AsyncClient, admin_token, db):
        response = await client.get(
            "/api/capacitaciones/clientes/customers",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert response.status_code == 200
        assert "items" in response.json()


class TestCreateTrainingRequest:
    @pytest.mark.asyncio
    async def test_rechaza_empresa_inexistente(self, client: AsyncClient, auth_token, db):
        curso = await prisma.curso.create(
            data={
                "nombre": "Curso Solicitud Test",
                "codigo": "SOL-TEST-001",
                "descripcion": "Test",
                "duracionHoras": 10,
                "activo": True,
            }
        )

        response = await client.post(
            "/api/capacitaciones/training-requests",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "empresaId": "empresa-que-no-existe",
                "cursoId": curso.id,
                "solicitanteNombre": "Juan Perez",
                "solicitanteEmail": "juan@test.com",
            },
        )

        assert response.status_code == 404

        await prisma.curso.delete(where={"id": curso.id})

    @pytest.mark.asyncio
    async def test_rechaza_curso_inexistente(self, client: AsyncClient, auth_token, db):
        empresa = await prisma.company.create(
            data={
                "nombre": "Empresa Solicitud Test",
                "cuit": "20-77788899-1",
                "email": "empresa-solicitud-test@test.com",
                "activa": True,
            }
        )

        response = await client.post(
            "/api/capacitaciones/training-requests",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "empresaId": empresa.id,
                "cursoId": "curso-que-no-existe",
                "solicitanteNombre": "Juan Perez",
                "solicitanteEmail": "juan@test.com",
            },
        )

        assert response.status_code == 404

        await prisma.company.delete(where={"id": empresa.id})
