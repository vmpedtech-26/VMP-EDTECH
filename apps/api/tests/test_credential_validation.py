"""
Tests para validación pública de credenciales.
"""
import pytest
from httpx import AsyncClient
from core.database import prisma
from datetime import datetime, timedelta


class TestCredentialValidation:
    """Tests de validación de credenciales"""
    
    @pytest.mark.asyncio
    async def test_validate_valid_credential(self, client: AsyncClient, db):
        """Test de validación de credencial válida"""
        # Crear datos de prueba
        empresa = await prisma.company.create(
            data={
                "nombre": "Test Company",
                "cuit": "20-12345678-9",
                "email": "test@company.com",
                "activa": True
            }
        )
        
        curso = await prisma.curso.create(
            data={
                "nombre": "Manejo Defensivo",
                "codigo": "MD-001",
                "descripcion": "Curso de manejo defensivo",
                "duracionHoras": 40,
                "activo": True
            }
        )
        
        from auth.jwt import hash_password
        alumno = await prisma.user.create(
            data={
                "email": "alumno@test.com",
                "passwordHash": hash_password("test123"),
                "nombre": "Juan",
                "apellido": "Pérez",
                "dni": "12345678",
                "rol": "ALUMNO",
                "empresaId": empresa.id,
                "activo": True
            }
        )
        
        # Crear credencial válida (sin vencimiento)
        credencial = await prisma.credencial.create(
            data={
                "numero": "VMP-2026-TEST001",
                "alumnoId": alumno.id,
                "cursoId": curso.id,
                "pdfUrl": "https://example.com/credential.pdf",
                "qrCodeUrl": "https://example.com/qr.png",
                "fechaEmision": datetime.utcnow(),
                "fechaVencimiento": None  # Sin vencimiento
            }
        )
        
        # Validar credencial
        response = await client.get(f"/api/public/validar/{credencial.numero}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["valid"] == True
        assert data["status"] == "valid"
        assert data["credential"]["numero"] == "VMP-2026-TEST001"
        assert data["credential"]["alumno"]["nombre"] == "Juan"
        assert data["credential"]["alumno"]["apellido"] == "Pérez"
        assert data["credential"]["alumno"]["dni"] == "12345678"
        assert data["credential"]["curso"]["nombre"] == "Manejo Defensivo"
        assert data["credential"]["empresa"]["nombre"] == "Test Company"
        
        # Cleanup
        await prisma.credencial.delete(where={"id": credencial.id})
        await prisma.user.delete(where={"id": alumno.id})
        await prisma.curso.delete(where={"id": curso.id})
        await prisma.company.delete(where={"id": empresa.id})
    
    @pytest.mark.asyncio
    async def test_validate_expired_credential(self, client: AsyncClient, db):
        """Test de validación de credencial expirada"""
        # Crear datos de prueba
        curso = await prisma.curso.create(
            data={
                "nombre": "Curso Test",
                "codigo": "CT-001",
                "descripcion": "Test",
                "duracionHoras": 20,
                "activo": True
            }
        )
        
        from auth.jwt import hash_password
        alumno = await prisma.user.create(
            data={
                "email": "alumno2@test.com",
                "passwordHash": hash_password("test123"),
                "nombre": "María",
                "apellido": "González",
                "dni": "87654321",
                "rol": "ALUMNO",
                "activo": True
            }
        )
        
        # Crear credencial expirada
        credencial = await prisma.credencial.create(
            data={
                "numero": "VMP-2026-TEST002",
                "alumnoId": alumno.id,
                "cursoId": curso.id,
                "pdfUrl": "https://example.com/credential.pdf",
                "qrCodeUrl": "https://example.com/qr.png",
                "fechaEmision": datetime.utcnow() - timedelta(days=400),
                "fechaVencimiento": datetime.utcnow() - timedelta(days=1)  # Expirada ayer
            }
        )
        
        # Validar credencial
        response = await client.get(f"/api/public/validar/{credencial.numero}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["valid"] == False
        assert data["status"] == "expired"
        assert data["credential"]["numero"] == "VMP-2026-TEST002"
        
        # Cleanup
        await prisma.credencial.delete(where={"id": credencial.id})
        await prisma.user.delete(where={"id": alumno.id})
        await prisma.curso.delete(where={"id": curso.id})
    
    @pytest.mark.asyncio
    async def test_validate_nonexistent_credential(self, client: AsyncClient):
        """Test de validación de credencial inexistente"""
        response = await client.get("/api/public/validar/VMP-2026-NOEXISTE")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["valid"] == False
        assert data["status"] == "not_found"
        assert "message" in data
    
    @pytest.mark.asyncio
    async def test_validate_credential_without_empresa(self, client: AsyncClient, db):
        """Test de validación de credencial sin empresa asociada"""
        curso = await prisma.curso.create(
            data={
                "nombre": "Curso Individual",
                "codigo": "CI-001",
                "descripcion": "Test",
                "duracionHoras": 20,
                "activo": True
            }
        )
        
        from auth.jwt import hash_password
        alumno = await prisma.user.create(
            data={
                "email": "individual@test.com",
                "passwordHash": hash_password("test123"),
                "nombre": "Pedro",
                "apellido": "Ramírez",
                "dni": "11111111",
                "rol": "ALUMNO",
                "empresaId": None,  # Sin empresa
                "activo": True
            }
        )
        
        credencial = await prisma.credencial.create(
            data={
                "numero": "VMP-2026-TEST003",
                "alumnoId": alumno.id,
                "cursoId": curso.id,
                "pdfUrl": "https://example.com/credential.pdf",
                "qrCodeUrl": "https://example.com/qr.png",
                "fechaEmision": datetime.utcnow()
            }
        )
        
        # Validar credencial
        response = await client.get(f"/api/public/validar/{credencial.numero}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["valid"] == True
        assert data["credential"]["empresa"] is None
        
        # Cleanup
        await prisma.credencial.delete(where={"id": credencial.id})
        await prisma.user.delete(where={"id": alumno.id})
        await prisma.curso.delete(where={"id": curso.id})
    
    @pytest.mark.asyncio
    async def test_validate_credential_rate_limiting(self, client: AsyncClient):
        """Test de rate limiting en validación pública"""
        # Este test verifica que el rate limiting está activo
        # Hacer múltiples requests rápidas
        responses = []
        for i in range(25):  # Más del límite de 20/min
            response = await client.get(f"/api/public/validar/VMP-TEST-{i}")
            responses.append(response.status_code)
        
        # Al menos una debería ser 429 (Too Many Requests)
        assert 429 in responses
