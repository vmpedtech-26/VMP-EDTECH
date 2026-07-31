import pytest
from core.database import prisma
from auth.jwt import create_access_token

@pytest.fixture
async def test_sso_company(db):
    """Fixture to create a company with SSO active"""
    company = await prisma.company.create(
        data={
            "nombre": "Empresa Test B2B",
            "cuit": "30-99999999-9",
            "email": "contacto@empresasob.com",
            "ssoActive": True,
            "ssoDomain": "empresasob.com",
            "ssoProvider": "AZURE_AD",
            "ssoClientId": "client-id-xyz",
            "ssoTenantId": "tenant-id-abc"
        }
    )
    yield company
    # Cleanup
    await prisma.company.delete(where={"id": company.id})

@pytest.mark.asyncio
async def test_sso_check_inactive(client):
    """Test checking domain without active SSO"""
    response = await client.post("/api/auth/sso/check", json={"email": "user@nonexistent.com"})
    assert response.status_code == 200
    data = response.json()
    assert data["sso_active"] is False

@pytest.mark.asyncio
async def test_sso_check_active(client, test_sso_company):
    """Test checking domain with active SSO"""
    response = await client.post("/api/auth/sso/check", json={"email": "empleado@empresasob.com"})
    assert response.status_code == 200
    data = response.json()
    assert data["sso_active"] is True
    assert data["domain"] == "empresasob.com"
    assert data["provider"] == "AZURE_AD"
    assert data["empresa_nombre"] == "Empresa Test B2B"

@pytest.mark.asyncio
async def test_sso_callback_jit_provision(client, test_sso_company):
    """Test callback with new user to verify Just-In-Time provisioning"""
    email = "nuevo.operario@empresasob.com"
    
    # Verify user does not exist
    user = await prisma.user.find_unique(where={"email": email})
    assert user is None
    
    # Callback
    response = await client.post(
        "/api/auth/sso/callback",
        json={
            "code": f"mock_{email}",
            "provider": "AZURE_AD",
            "domain": "empresasob.com"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == email
    assert data["user"]["empresaId"] == test_sso_company.id
    
    # Verify user was created in database
    db_user = await prisma.user.find_unique(where={"email": email})
    assert db_user is not None
    assert db_user.nombre == "Usuario"
    assert db_user.rol == "ALUMNO"
    
    # Cleanup user
    await prisma.user.delete(where={"id": db_user.id})

@pytest.mark.asyncio
async def test_sso_callback_existing_user(client, test_sso_company):
    """Test callback with an existing user who is not linked to the company yet"""
    email = "existente@empresasob.com"
    
    # Create user manually without companyId
    existing_user = await prisma.user.create(
        data={
            "email": email,
            "passwordHash": "somehash",
            "nombre": "Juan",
            "apellido": "Perez",
            "dni": "55555555",
            "rol": "ALUMNO",
            "activo": True
        }
    )
    
    # Callback
    response = await client.post(
        "/api/auth/sso/callback",
        json={
            "code": email,
            "provider": "AZURE_AD",
            "domain": "empresasob.com"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    
    # Verify user was linked to company
    db_user = await prisma.user.find_unique(where={"email": email})
    assert db_user.empresaId == test_sso_company.id
    
    # Cleanup user
    await prisma.user.delete(where={"id": db_user.id})
