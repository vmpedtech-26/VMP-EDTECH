"""
Configuración de pytest para tests de la API.
"""
import pytest
import asyncio
from typing import Generator, AsyncGenerator
from httpx import AsyncClient
from fastapi.testclient import TestClient
from main import app
from core.database import prisma


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
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
    async with AsyncClient(app=app, base_url="http://test") as ac:
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
