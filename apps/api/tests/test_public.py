"""
Tests para endpoints públicos.
"""
import pytest
from httpx import AsyncClient


class TestPublic:
    """Tests de endpoints públicos"""
    
    @pytest.mark.asyncio
    async def test_validate_credential_not_found(self, client: AsyncClient):
        """Test de validación con credencial inexistente"""
        response = await client.get("/api/public/validar/VMP-2026-99999")
        
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == False
        assert data["status"] == "not_found"
    
    @pytest.mark.asyncio
    async def test_health_check(self, client: AsyncClient):
        """Test de health check"""
        response = await client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
    
    @pytest.mark.asyncio
    async def test_root_endpoint(self, client: AsyncClient):
        """Test de endpoint raíz"""
        response = await client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
