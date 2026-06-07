"""
Configuración de pytest para tests de la API.
"""
import os

# Forzar base de datos de pruebas para no vaciar la base de datos de desarrollo
db_url = os.environ.get("DATABASE_URL", "")
if db_url and "localhost" in db_url:
    parts = db_url.rsplit("/", 1)
    if len(parts) == 2 and not parts[1].endswith("_test"):
        os.environ["DATABASE_URL"] = f"{parts[0]}/{parts[1]}_test"
        print(f"🔧 Testing database URL redirected dynamically to: {os.environ['DATABASE_URL']}")

import pytest
import asyncio
from typing import Generator, AsyncGenerator
from httpx import AsyncClient, ASGITransport
from fastapi.testclient import TestClient
from main import app
from core.database import prisma


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def db():
    """
    Fixture para conectar a la base de datos de prueba.
    """
    if prisma.is_connected():
        try:
            await prisma.disconnect()
        except Exception:
            pass
    await prisma.connect()
    yield prisma
    try:
        await prisma.disconnect()
    except Exception:
        pass


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


@pytest.fixture(scope="session", autouse=True)
async def clean_database_session():
    """
    Fixture autouse de sesión para vaciar completamente la base de datos antes de iniciar los tests,
    evitando conflictos de claves primarias/únicas por residuos de corridas previas.
    """
    await prisma.connect()
    try:
        await prisma.execute_raw(
            "TRUNCATE TABLE "
            "users, companies, cursos, modulos, preguntas, inscripciones, examenes, "
            "fotos_credencial, credenciales, cotizaciones, password_reset_tokens, "
            "accounts, journal_entries, ledger_entries, ventas, venta_items, "
            "compras, compra_items, caja_movimientos, audit_logs "
            "CASCADE;"
        )
        print("🧹 Base de datos de prueba limpiada con éxito al iniciar la sesión.")
    except Exception as e:
        print(f"⚠️ Error limpiando la base de datos de prueba: {e}")
    finally:
        await prisma.disconnect()
