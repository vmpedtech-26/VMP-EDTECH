from unittest.mock import patch

import pytest

from core.config import settings as app_settings
from core.database import prisma
from routers.sso import _sign_state
from services.sso_crypto import encrypt_secret

# Los tests no pegan contra Azure AD real: el canje de código y la validación
# del id_token se mockean (services.sso_service). Lo que se prueba de punta a
# punta es la lógica propia -- check por dominio, validación del state
# firmado, y el JIT provisioning / vínculo de usuarios existentes.
app_settings.SSO_ENCRYPTION_KEY = "test-sso-encryption-key"


@pytest.fixture
async def test_sso_company(db):
    """Empresa con SSO activo (Azure AD) para los tests."""
    company = await prisma.company.create(
        data={
            "nombre": "Empresa Test B2B",
            "cuit": "30-99999999-9",
            "email": "contacto@empresasob.com",
            "ssoActive": True,
            "ssoDomain": "empresasob.com",
            "ssoProvider": "AZURE_AD",
            "ssoClientId": "client-id-xyz",
            "ssoTenantId": "tenant-id-abc",
            "ssoClientSecret": encrypt_secret("super-secreto"),
        }
    )
    yield company
    await prisma.company.delete(where={"id": company.id})


def _mock_claims(email: str, given_name="Nuevo", family_name="Operario"):
    return patch(
        "services.sso_service.validate_id_token",
        return_value={"email": email, "given_name": given_name, "family_name": family_name},
    )


@pytest.mark.asyncio
async def test_sso_check_inactive(client):
    response = await client.post("/api/auth/sso/check", json={"email": "user@nonexistent.com"})
    assert response.status_code == 200
    assert response.json()["sso_active"] is False


@pytest.mark.asyncio
async def test_sso_check_active(client, test_sso_company):
    response = await client.post("/api/auth/sso/check", json={"email": "empleado@empresasob.com"})
    assert response.status_code == 200
    data = response.json()
    assert data["sso_active"] is True
    assert data["domain"] == "empresasob.com"
    assert data["provider"] == "AZURE_AD"
    assert data["empresa_nombre"] == "Empresa Test B2B"


@pytest.mark.asyncio
async def test_sso_login_redirects_to_azure(client, test_sso_company):
    response = await client.get(
        "/api/auth/sso/login", params={"domain": "empresasob.com"}, follow_redirects=False
    )
    assert response.status_code == 307
    location = response.headers["location"]
    assert "login.microsoftonline.com/tenant-id-abc" in location
    assert "client_id=client-id-xyz" in location
    assert "state=" in location


@pytest.mark.asyncio
async def test_sso_login_unknown_domain(client):
    response = await client.get(
        "/api/auth/sso/login", params={"domain": "no-existe.com"}, follow_redirects=False
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_sso_callback_invalid_state(client, test_sso_company):
    response = await client.post(
        "/api/auth/sso/callback", json={"code": "irrelevante", "state": "no-es-un-jwt-valido"}
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_sso_callback_jit_provision(client, test_sso_company):
    email = "nuevo.operario@empresasob.com"

    existing = await prisma.user.find_unique(where={"email": email})
    assert existing is None

    state = _sign_state("empresasob.com")

    with patch("services.sso_service.exchange_code_for_id_token", return_value="fake-id-token"), \
         _mock_claims(email):
        response = await client.post("/api/auth/sso/callback", json={"code": "auth-code-real", "state": state})

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == email
    assert data["user"]["empresaId"] == test_sso_company.id
    assert data["user"]["rol"] == "ALUMNO"

    db_user = await prisma.user.find_unique(where={"email": email})
    assert db_user is not None
    assert db_user.nombre == "Nuevo"
    assert db_user.rol == "ALUMNO"

    await prisma.user.delete(where={"id": db_user.id})


@pytest.mark.asyncio
async def test_sso_callback_existing_user_gets_linked(client, test_sso_company):
    email = "existente@empresasob.com"

    existing_user = await prisma.user.create(
        data={
            "email": email,
            "passwordHash": "somehash",
            "nombre": "Juan",
            "apellido": "Perez",
            "dni": "55555555",
            "rol": "ALUMNO",
            "activo": True,
        }
    )

    state = _sign_state("empresasob.com")

    with patch("services.sso_service.exchange_code_for_id_token", return_value="fake-id-token"), \
         _mock_claims(email, given_name="Juan", family_name="Perez"):
        response = await client.post("/api/auth/sso/callback", json={"code": "auth-code-real", "state": state})

    assert response.status_code == 200

    db_user = await prisma.user.find_unique(where={"id": existing_user.id})
    assert db_user.empresaId == test_sso_company.id

    await prisma.user.delete(where={"id": existing_user.id})


@pytest.mark.asyncio
async def test_sso_callback_rejects_email_outside_domain(client, test_sso_company):
    state = _sign_state("empresasob.com")

    with patch("services.sso_service.exchange_code_for_id_token", return_value="fake-id-token"), \
         _mock_claims("atacante@otro-dominio.com"):
        response = await client.post("/api/auth/sso/callback", json={"code": "auth-code-real", "state": state})

    assert response.status_code == 403
