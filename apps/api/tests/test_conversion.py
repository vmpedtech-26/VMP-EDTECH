"""
Tests para conversión de cotizaciones a clientes.
"""
import pytest
from httpx import AsyncClient
from core.database import prisma


class TestCotizacionConversion:
    """Tests de conversión de cotizaciones"""
    
    @pytest.mark.asyncio
    async def test_convert_cotizacion_success(self, client: AsyncClient, admin_token, db):
        """Test de conversión exitosa de cotización"""
        # Crear cotización
        cotizacion_response = await client.post(
            "/api/cotizaciones/",
            json={
                "empresa": "Test Company SA",
                "cuit": "20-12345678-9",
                "nombre": "John Doe",
                "email": "contact@testcompany.com",
                "telefono": "1234567890",
                "quantity": 3,
                "course": "defensivo",
                "modality": "online",
                "totalPrice": 30000,
                "pricePerStudent": 10000,
                "discount": 0,
                "acceptMarketing": True,
                "acceptTerms": True
            }
        )
        
        assert cotizacion_response.status_code == 200
        cotizacion_id = cotizacion_response.json()["id"]
        
        # Actualizar estado a 'contacted'
        await client.patch(
            f"/api/cotizaciones/{cotizacion_id}/status",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"status": "contacted"}
        )
        
        # Convertir a cliente
        conversion_response = await client.post(
            f"/api/cotizaciones/{cotizacion_id}/convert",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "empresaNombre": "Test Company SA",
                "empresaCuit": "20-12345678-9",
                "empresaDireccion": "Calle Falsa 123",
                "empresaTelefono": "1234567890",
                "cantidadAlumnos": 3
            }
        )
        
        assert conversion_response.status_code == 200
        data = conversion_response.json()
        
        # Verificar respuesta
        assert "empresa" in data
        assert "alumnos" in data
        assert "inscripciones" in data
        assert "credenciales" in data
        assert len(data["alumnos"]) == 3
        assert len(data["inscripciones"]) == 3
        
        # Verificar que la empresa fue creada
        empresa = await prisma.company.find_unique(
            where={"cuit": "20-12345678-9"}
        )
        assert empresa is not None
        assert empresa.nombre == "Test Company SA"
        
        # Verificar que los alumnos fueron creados
        alumnos = await prisma.user.find_many(
            where={"empresaId": empresa.id}
        )
        assert len(alumnos) == 3
        
        # Verificar que las inscripciones fueron creadas
        for alumno in alumnos:
            inscripcion = await prisma.inscripcion.find_first(
                where={"alumnoId": alumno.id}
            )
            assert inscripcion is not None
        
        # Verificar que el estado de la cotización cambió
        cotizacion_updated = await prisma.cotizacion.find_unique(
            where={"id": cotizacion_id}
        )
        assert cotizacion_updated.status == "converted"
        
        # Cleanup
        for alumno in alumnos:
            await prisma.inscripcion.delete_many(where={"alumnoId": alumno.id})
            await prisma.user.delete(where={"id": alumno.id})
        await prisma.company.delete(where={"id": empresa.id})
        await prisma.cotizacion.delete(where={"id": cotizacion_id})
    
    @pytest.mark.asyncio
    async def test_convert_cotizacion_invalid_status(self, client: AsyncClient, admin_token, db):
        """Test de conversión con estado inválido"""
        # Crear cotización en estado 'pending'
        cotizacion_response = await client.post(
            "/api/cotizaciones/",
            json={
                "empresa": "Test Company",
                "nombre": "John Doe",
                "email": "john@test.com",
                "telefono": "1234567890",
                "quantity": 2,
                "course": "defensivo",
                "modality": "online",
                "totalPrice": 20000,
                "pricePerStudent": 10000,
                "discount": 0,
                "acceptMarketing": True,
                "acceptTerms": True
            }
        )
        
        cotizacion_id = cotizacion_response.json()["id"]
        
        # Intentar convertir sin cambiar estado
        conversion_response = await client.post(
            f"/api/cotizaciones/{cotizacion_id}/convert",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "empresaNombre": "Test Company",
                "empresaCuit": "20-11111111-1",
                "cantidadAlumnos": 2
            }
        )
        
        # Debería fallar porque no está en estado 'contacted'
        assert conversion_response.status_code == 400
        
        # Cleanup
        await prisma.cotizacion.delete(where={"id": cotizacion_id})
    
    @pytest.mark.asyncio
    async def test_convert_cotizacion_nonexistent(self, client: AsyncClient, admin_token):
        """Test de conversión de cotización inexistente"""
        response = await client.post(
            "/api/cotizaciones/99999/convert",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "empresaNombre": "Test",
                "empresaCuit": "20-11111111-1",
                "cantidadAlumnos": 1
            }
        )
        
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_convert_cotizacion_without_auth(self, client: AsyncClient, db):
        """Test de conversión sin autenticación"""
        # Crear cotización
        cotizacion_response = await client.post(
            "/api/cotizaciones/",
            json={
                "empresa": "Test Company",
                "nombre": "John Doe",
                "email": "john@test.com",
                "telefono": "1234567890",
                "quantity": 1,
                "course": "defensivo",
                "modality": "online",
                "totalPrice": 10000,
                "pricePerStudent": 10000,
                "discount": 0,
                "acceptMarketing": True,
                "acceptTerms": True
            }
        )
        
        cotizacion_id = cotizacion_response.json()["id"]
        
        # Intentar convertir sin token
        response = await client.post(
            f"/api/cotizaciones/{cotizacion_id}/convert",
            json={
                "empresaNombre": "Test",
                "empresaCuit": "20-11111111-1",
                "cantidadAlumnos": 1
            }
        )
        
        assert response.status_code == 401
        
        # Cleanup
        await prisma.cotizacion.delete(where={"id": cotizacion_id})
    
    @pytest.mark.asyncio
    async def test_convert_cotizacion_duplicate_cuit(self, client: AsyncClient, admin_token, db):
        """Test de conversión con CUIT duplicado"""
        # Crear empresa manualmente
        empresa_existente = await prisma.company.create(
            data={
                "nombre": "Existing Company",
                "cuit": "20-99999999-9",
                "email": "existing@company.com",
                "activa": True
            }
        )
        
        # Crear cotización
        cotizacion_response = await client.post(
            "/api/cotizaciones/",
            json={
                "empresa": "New Company",
                "nombre": "John Doe",
                "email": "john@newcompany.com",
                "telefono": "1234567890",
                "quantity": 1,
                "course": "defensivo",
                "modality": "online",
                "totalPrice": 10000,
                "pricePerStudent": 10000,
                "discount": 0,
                "acceptMarketing": True,
                "acceptTerms": True
            }
        )
        
        cotizacion_id = cotizacion_response.json()["id"]
        
        # Actualizar estado
        await client.patch(
            f"/api/cotizaciones/{cotizacion_id}/status",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"status": "contacted"}
        )
        
        # Intentar convertir con CUIT duplicado
        response = await client.post(
            f"/api/cotizaciones/{cotizacion_id}/convert",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "empresaNombre": "New Company",
                "empresaCuit": "20-99999999-9",  # CUIT duplicado
                "cantidadAlumnos": 1
            }
        )
        
        # Debería fallar
        assert response.status_code == 400
        
        # Cleanup
        await prisma.company.delete(where={"id": empresa_existente.id})
        await prisma.cotizacion.delete(where={"id": cotizacion_id})
