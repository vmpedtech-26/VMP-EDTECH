"""
Tests para endpoints de autenticación.
"""
import pytest
from httpx import AsyncClient


class TestAuth:
    """Tests de autenticación"""
    
    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient, test_user):
        """Test de login exitoso"""
        response = await client.post(
            "/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "testpass123"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "test@example.com"
    
    @pytest.mark.asyncio
    async def test_login_invalid_credentials(self, client: AsyncClient, test_user):
        """Test de login con credenciales inválidas"""
        response = await client.post(
            "/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401
        assert "detail" in response.json()
    
    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, client: AsyncClient):
        """Test de login con usuario inexistente"""
        response = await client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "somepassword"
            }
        )
        
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_get_current_user(self, client: AsyncClient, auth_token, test_user):
        """Test de obtener usuario actual"""
        response = await client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["rol"] == "ALUMNO"
    
    @pytest.mark.asyncio
    async def test_get_current_user_no_token(self, client: AsyncClient):
        """Test de obtener usuario sin token"""
        response = await client.get("/api/auth/me")
        
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_forgot_password(self, client: AsyncClient, test_user):
        """Test de solicitud de recuperación de contraseña"""
        response = await client.post(
            "/api/auth/forgot-password",
            json={"email": "test@example.com"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
    
    @pytest.mark.asyncio
    async def test_forgot_password_nonexistent_email(self, client: AsyncClient):
        """Test de forgot password con email inexistente"""
        response = await client.post(
            "/api/auth/forgot-password",
            json={"email": "nonexistent@example.com"}
        )
        
        # Por seguridad, siempre retorna 200
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
