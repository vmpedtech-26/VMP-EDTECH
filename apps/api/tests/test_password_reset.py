"""
Tests completos para recuperación de contraseña.
"""
import pytest
from httpx import AsyncClient
from core.database import prisma


class TestPasswordReset:
    """Tests de recuperación de contraseña"""
    
    @pytest.mark.asyncio
    async def test_forgot_password_creates_token(self, client: AsyncClient, test_user, db):
        """Test que forgot password crea un token en la DB"""
        response = await client.post(
            "/api/auth/forgot-password",
            json={"email": test_user.email}
        )
        
        assert response.status_code == 200
        
        # Verificar que se creó el token
        token = await prisma.passwordresettoken.find_first(
            where={"userId": test_user.id}
        )
        
        assert token is not None
        assert token.used == False
        
        # Cleanup
        if token:
            await prisma.passwordresettoken.delete(where={"id": token.id})
    
    @pytest.mark.asyncio
    async def test_reset_password_with_valid_token(self, client: AsyncClient, test_user, db):
        """Test de reset password con token válido"""
        from datetime import datetime, timedelta
        import uuid
        
        # Crear token manualmente
        reset_token = str(uuid.uuid4())
        token_record = await prisma.passwordresettoken.create(
            data={
                "token": reset_token,
                "userId": test_user.id,
                "expiresAt": datetime.utcnow() + timedelta(hours=1),
                "used": False
            }
        )
        
        # Resetear contraseña
        response = await client.post(
            "/api/auth/reset-password",
            json={
                "token": reset_token,
                "new_password": "newpassword123"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        
        # Verificar que el token fue marcado como usado
        updated_token = await prisma.passwordresettoken.find_unique(
            where={"token": reset_token}
        )
        assert updated_token.used == True
        
        # Verificar que se puede hacer login con la nueva contraseña
        login_response = await client.post(
            "/api/auth/login",
            json={
                "email": test_user.email,
                "password": "newpassword123"
            }
        )
        assert login_response.status_code == 200
        
        # Cleanup
        await prisma.passwordresettoken.delete(where={"id": token_record.id})
    
    @pytest.mark.asyncio
    async def test_reset_password_with_expired_token(self, client: AsyncClient, test_user, db):
        """Test de reset password con token expirado"""
        from datetime import datetime, timedelta
        import uuid
        
        # Crear token expirado
        reset_token = str(uuid.uuid4())
        token_record = await prisma.passwordresettoken.create(
            data={
                "token": reset_token,
                "userId": test_user.id,
                "expiresAt": datetime.utcnow() - timedelta(hours=1),  # Expirado
                "used": False
            }
        )
        
        # Intentar resetear contraseña
        response = await client.post(
            "/api/auth/reset-password",
            json={
                "token": reset_token,
                "new_password": "newpassword123"
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "expirado" in data["detail"].lower()
        
        # Cleanup
        await prisma.passwordresettoken.delete(where={"id": token_record.id})
    
    @pytest.mark.asyncio
    async def test_reset_password_with_used_token(self, client: AsyncClient, test_user, db):
        """Test de reset password con token ya usado"""
        from datetime import datetime, timedelta
        import uuid
        
        # Crear token usado
        reset_token = str(uuid.uuid4())
        token_record = await prisma.passwordresettoken.create(
            data={
                "token": reset_token,
                "userId": test_user.id,
                "expiresAt": datetime.utcnow() + timedelta(hours=1),
                "used": True  # Ya usado
            }
        )
        
        # Intentar resetear contraseña
        response = await client.post(
            "/api/auth/reset-password",
            json={
                "token": reset_token,
                "new_password": "newpassword123"
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "utilizado" in data["detail"].lower()
        
        # Cleanup
        await prisma.passwordresettoken.delete(where={"id": token_record.id})
    
    @pytest.mark.asyncio
    async def test_reset_password_with_invalid_token(self, client: AsyncClient):
        """Test de reset password con token inválido"""
        response = await client.post(
            "/api/auth/reset-password",
            json={
                "token": "invalid-token-12345",
                "new_password": "newpassword123"
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "inválido" in data["detail"].lower() or "expirado" in data["detail"].lower()
    
    @pytest.mark.asyncio
    async def test_reset_password_weak_password(self, client: AsyncClient, test_user, db):
        """Test de reset password con contraseña débil"""
        from datetime import datetime, timedelta
        import uuid
        
        # Crear token válido
        reset_token = str(uuid.uuid4())
        token_record = await prisma.passwordresettoken.create(
            data={
                "token": reset_token,
                "userId": test_user.id,
                "expiresAt": datetime.utcnow() + timedelta(hours=1),
                "used": False
            }
        )
        
        # Intentar con contraseña muy corta
        response = await client.post(
            "/api/auth/reset-password",
            json={
                "token": reset_token,
                "new_password": "123"  # Muy corta
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "caracteres" in data["detail"].lower()
        
        # Cleanup
        await prisma.passwordresettoken.delete(where={"id": token_record.id})
