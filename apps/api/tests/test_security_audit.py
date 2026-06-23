import pytest
from httpx import AsyncClient
from core.database import prisma

class TestSecurityAudit:
    """
    Test suite for security metrics and audit logs (NICE Framework categories).
    """

    @pytest.mark.asyncio
    async def test_login_failure_logs_audit(self, client: AsyncClient):
        """
        Verify that a failed login attempt creates an AUTH_FAILURE audit log entry.
        """
        # Ensure database is connected
        if not prisma.is_connected():
            await prisma.connect()

        # Count audit logs before
        count_before = await prisma.auditlog.count(where={"action": "AUTH_FAILURE"})

        # Run failed login request
        response = await client.post(
            "/api/auth/login",
            json={
                "email": "malicious_attempt@example.com",
                "password": "wrong_password_123"
            }
        )

        assert response.status_code == 401
        
        # Count audit logs after
        count_after = await prisma.auditlog.count(where={"action": "AUTH_FAILURE"})
        assert count_after == count_before + 1

        # Check detail in DB
        logs = await prisma.auditlog.find_many(
            where={"action": "AUTH_FAILURE"},
            order={"createdAt": "desc"},
            take=1
        )
        assert len(logs) == 1
        assert logs[0].userEmail == "malicious_attempt@example.com"
        assert "Intento de inicio de sesión con contraseña incorrecta" in logs[0].details

    @pytest.mark.asyncio
    async def test_get_security_metrics_as_admin(self, client: AsyncClient, admin_token, test_admin):
        """
        Verify that a SUPER_ADMIN can retrieve security metrics and logs.
        """
        response = await client.get(
            "/api/admin/security/metrics",
            headers={"Authorization": f"Bearer {admin_token}"}
        )

        assert response.status_code == 200
        data = response.json()
        
        # Assert structure
        assert "metrics" in data
        assert "recent_logs" in data
        assert "auth_success" in data["metrics"]
        assert "auth_failure" in data["metrics"]
        assert "access_denied" in data["metrics"]
        assert "rate_limit_exceeded" in data["metrics"]
        assert "total_events" in data["metrics"]
        assert isinstance(data["recent_logs"], list)

    @pytest.mark.asyncio
    async def test_get_security_metrics_as_unauthorized(self, client: AsyncClient, auth_token, test_user):
        """
        Verify that a normal user (ALUMNO) is forbidden from accessing security metrics.
        """
        response = await client.get(
            "/api/admin/security/metrics",
            headers={"Authorization": f"Bearer {auth_token}"}
        )

        assert response.status_code == 403
        assert "Solo el Super Administrador" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_get_security_metrics_no_token(self, client: AsyncClient):
        """
        Verify that requests without any authorization headers receive a 401 error.
        """
        response = await client.get("/api/admin/security/metrics")
        assert response.status_code == 401
