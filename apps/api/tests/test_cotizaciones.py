"""
Tests para endpoints de cotizaciones.
"""
import pytest
from httpx import AsyncClient
from faker import Faker

fake = Faker()


class TestCotizaciones:
    """Tests de cotizaciones"""
    
    @pytest.mark.asyncio
    async def test_create_cotizacion(self, client: AsyncClient):
        """Test de creación de cotización"""
        response = await client.post(
            "/api/cotizaciones/",
            json={
                "empresa": "Test Company",
                "nombre": "John Doe",
                "email": "john@testcompany.com",
                "telefono": "1234567890",
                "quantity": 10,
                "course": "defensivo",
                "modality": "online",
                "totalPrice": 100000
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["empresa"] == "Test Company"
        assert data["status"] == "pending"
        assert "id" in data
    
    @pytest.mark.asyncio
    async def test_get_cotizaciones(self, client: AsyncClient, admin_token):
        """Test de obtener lista de cotizaciones"""
        response = await client.get(
            "/api/cotizaciones/",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    @pytest.mark.asyncio
    async def test_get_cotizacion_by_id(self, client: AsyncClient, admin_token):
        """Test de obtener cotización por ID"""
        # Primero crear una cotización
        create_response = await client.post(
            "/api/cotizaciones/",
            json={
                "empresa": "Test Company",
                "nombre": "John Doe",
                "email": "john@testcompany.com",
                "telefono": "1234567890",
                "quantity": 5,
                "course": "defensivo",
                "modality": "online",
                "totalPrice": 50000
            }
        )
        
        cotizacion_id = create_response.json()["id"]
        
        # Obtener por ID
        response = await client.get(
            f"/api/cotizaciones/{cotizacion_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == cotizacion_id
    
    @pytest.mark.asyncio
    async def test_update_cotizacion_status(self, client: AsyncClient, admin_token):
        """Test de actualización de estado de cotización"""
        # Crear cotización
        create_response = await client.post(
            "/api/cotizaciones/",
            json={
                "empresa": "Test Company",
                "nombre": "John Doe",
                "email": "john@testcompany.com",
                "telefono": "1234567890",
                "quantity": 5,
                "course": "defensivo",
                "modality": "online",
                "totalPrice": 50000
            }
        )
        
        cotizacion_id = create_response.json()["id"]
        
        # Actualizar estado
        response = await client.patch(
            f"/api/cotizaciones/{cotizacion_id}/status",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"status": "contacted"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "contacted"
    
    @pytest.mark.asyncio
    async def test_create_cotizacion_invalid_data(self, client: AsyncClient):
        """Test de creación con datos inválidos"""
        response = await client.post(
            "/api/cotizaciones/",
            json={
                "empresa": "Test",
                # Falta email
                "telefono": "123",
                "quantity": -1,  # Cantidad inválida
                "course": "invalid_course",
                "modality": "online",
                "totalPrice": 0
            }
        )
        
        assert response.status_code == 422  # Validation error
