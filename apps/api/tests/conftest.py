"""
Configuración de pytest para tests de la API.
"""
import pytest
from typing import Generator, AsyncGenerator
from httpx import AsyncClient, ASGITransport
from fastapi.testclient import TestClient
from main import app
from core.database import prisma

# No se define un fixture `event_loop` propio: pytest-asyncio >= 0.23 crea y
# gestiona su propio loop por test en modo "auto", y un fixture de sesión
# manual quedaba desincronizado con ese loop ("bound to a different event
# loop"). Por eso `db` es function-scoped: conecta/desconecta en el mismo
# loop que usa cada test.


@pytest.fixture
async def db():
    """
    Fixture para conectar a la base de datos de prueba.
    """
    await prisma.connect()
    yield prisma
    await prisma.disconnect()


@pytest.fixture
async def client(db) -> AsyncGenerator:
    """
    Fixture para cliente HTTP de prueba.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.fixture
def test_client():
    """
    Fixture para cliente de prueba síncrono.
    """
    return TestClient(app)


@pytest.fixture
async def test_user(db):
    """
    Fixture para crear un usuario de prueba.
    """
    from auth.jwt import hash_password
    
    user = await prisma.user.create(
        data={
            "email": "test@example.com",
            "passwordHash": hash_password("testpass123"),
            "nombre": "Test",
            "apellido": "User",
            "dni": "12345678",
            "telefono": "1234567890",
            "rol": "ALUMNO",
            "activo": True
        }
    )
    
    yield user
    
    # Cleanup
    await prisma.user.delete(where={"id": user.id})


@pytest.fixture
async def test_admin(db):
    """
    Fixture para crear un admin de prueba.
    """
    from auth.jwt import hash_password
    
    admin = await prisma.user.create(
        data={
            "email": "admin@example.com",
            "passwordHash": hash_password("adminpass123"),
            "nombre": "Admin",
            "apellido": "User",
            "dni": "87654321",
            "telefono": "0987654321",
            "rol": "SUPER_ADMIN",
            "activo": True
        }
    )
    
    yield admin
    
    # Cleanup
    await prisma.user.delete(where={"id": admin.id})


@pytest.fixture
async def auth_token(test_user):
    """
    Fixture para obtener token de autenticación.
    """
    from auth.jwt import create_access_token
    
    token = create_access_token(data={"sub": test_user.id})
    return token


@pytest.fixture
async def admin_token(test_admin):
    """
    Fixture para obtener token de admin.
    """
    from auth.jwt import create_access_token
    
    token = create_access_token(data={"sub": test_admin.id})
    return token
