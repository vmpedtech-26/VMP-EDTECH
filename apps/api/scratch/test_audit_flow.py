import sys
import os

# Set PYTHONPATH to include the api directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from main import app
from services.audit_service import log_audit_action
from core.database import prisma
import asyncio

client = TestClient(app, raise_server_exceptions=False)

async def test_audit_logs():
    print("🧪 1. Probando creación directa de Audit Log...")
    await prisma.connect()
    try:
        success = await log_audit_action(
            action="TEST_ACTION",
            user_id="test-id-123",
            user_email="test-email@vmp-edtech.com",
            details="Detalles de auditoría de prueba",
            ip_address="127.0.0.1",
            request_id="test-req-id"
        )
        assert success is True
        print("   - ✅ Audit Log insertado correctamente en base de datos.")

        # Verificar que el registro está presente en la base de datos
        log = await prisma.auditlog.find_first(
            where={"action": "TEST_ACTION", "userEmail": "test-email@vmp-edtech.com"}
        )
        assert log is not None
        assert log.details == "Detalles de auditoría de prueba"
        assert log.requestId == "test-req-id"
        print("   - ✅ Registro de auditoría verificado en base de datos.")
        
        # Limpieza
        await prisma.auditlog.delete_many(where={"action": "TEST_ACTION"})
        print("   - ✅ Registros de prueba eliminados.")
    finally:
        await prisma.disconnect()

def test_audit_auth_constraint():
    print("\n🧪 2. Probando restricciones de autorización en endpoint de auditoría...")
    
    # Intento de acceso sin token
    res = client.get("/api/admin/audit-logs")
    print(f"   - Intento sin autorización. Estado: {res.status_code}")
    assert res.status_code == 401
    print("   - ✅ Denegado correctamente para peticiones no autenticadas.")

if __name__ == "__main__":
    try:
        # Run async parts
        asyncio.run(test_audit_logs())
        
        # Run sync parts
        test_audit_auth_constraint()
        
        print("\n🎉 ¡TODAS LAS PRUEBAS DE AUDITORÍA INMUTABLE PASARON EXITOSAMENTE!")
        sys.exit(0)
    except AssertionError as e:
        print(f"\n❌ ERROR DE VERIFICACIÓN DE AUDITORÍA: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ ERROR INESPERADO: {e}")
        sys.exit(1)
