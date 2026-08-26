"""
Tests para routers/metrics.py.

- get_conversion_metrics() llamaba a prisma.cotizacion.find_many(order_by=...)
  -- el cliente de Prisma-Python solo acepta el kwarg `order`, no `order_by`,
  así que el endpoint siempre devolvía 500.
- get_overview_metrics() filtraba inscripciones por estado="ACTIVO", un valor
  que no existe en el enum EstadoInscripcion (NO_INICIADO/EN_PROGRESO/
  COMPLETADO/APROBADO/REPROBADO). Prisma rechaza la query y el endpoint
  devuelve 500 siempre -- confirmado en producción, donde el panel principal
  de SUPER_ADMIN mostraba todas las métricas en cero pese a haber datos
  reales.
"""
import pytest
from httpx import AsyncClient


class TestOverviewMetrics:
    @pytest.mark.asyncio
    async def test_overview_no_rompe_con_estado_invalido(self, client: AsyncClient, admin_token, db):
        response = await client.get(
            "/api/metrics/overview",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "totals" in data
        assert "enrollments" in data
        assert "active" in data["enrollments"]
        assert "completed" in data["enrollments"]


class TestConversionMetrics:
    @pytest.mark.asyncio
    async def test_conversion_metrics_no_rompe_con_order_by(self, client: AsyncClient, admin_token, db):
        response = await client.get(
            "/api/metrics/conversions",
            headers={"Authorization": f"Bearer {admin_token}"},
            params={"days": 30},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["period_days"] == 30
        assert isinstance(data["data"], list)

    @pytest.mark.asyncio
    async def test_conversion_metrics_requiere_admin(self, client: AsyncClient, auth_token):
        response = await client.get(
            "/api/metrics/conversions",
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        assert response.status_code == 403
