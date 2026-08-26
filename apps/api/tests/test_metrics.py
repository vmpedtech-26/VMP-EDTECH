"""
Tests para routers/metrics.py. get_conversion_metrics() llamaba a
prisma.cotizacion.find_many(order_by=...) -- el cliente de Prisma-Python
solo acepta el kwarg `order`, no `order_by`, así que el endpoint siempre
devolvía 500.
"""
import pytest
from httpx import AsyncClient


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
