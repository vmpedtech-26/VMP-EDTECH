import pytest
from core.database import prisma
from services.credential_service import generate_credential_for_student
from services.credential_validator import credential_validator


@pytest.fixture
async def test_data(db):
    """Fixture para crear alumno y curso temporales."""
    # Crear un alumno de prueba
    alumno = await prisma.user.create(
        data={
            "email": "alumno_firmas@vmp-edtech.com.ar",
            "passwordHash": "dummyhash",
            "nombre": "Esteban",
            "apellido": "Quito",
            "dni": "99.888.777",
            "rol": "ALUMNO",
            "activo": True
        }
    )
    
    # Crear un curso de prueba
    curso = await prisma.curso.create(
        data={
            "nombre": "Curso de Firma Digital",
            "descripcion": "Verificación criptográfica VMP",
            "codigo": "FD-101",
            "duracionHoras": 8
        }
    )
    
    yield {"alumno": alumno, "curso": curso}
    
    # Cleanup
    # Las credenciales asociadas se borrarán por onDelete: Cascade
    await prisma.user.delete(where={"id": alumno.id})
    await prisma.curso.delete(where={"id": curso.id})


@pytest.mark.asyncio
async def test_credential_signature_generation_and_validation(client, test_data):
    """Prueba que una credencial se genera con firma y se valida correctamente."""
    alumno = test_data["alumno"]
    curso = test_data["curso"]
    
    # Generar la credencial
    result = await generate_credential_for_student(
        alumno_id=alumno.id,
        curso_id=curso.id,
        force=True
    )
    
    cred = result["credencial"]
    assert cred.firmaCriptografica is not None
    assert len(cred.firmaCriptografica) == 64  # HMAC-SHA256 hex
    assert cred.metadataFirmada is not None
    
    # Validar a través del servicio validador directamente
    validation = await credential_validator.validate_credential(cred.numero)
    assert validation["valid"] is True
    assert validation["signatureValid"] is True
    assert validation["signatureStatus"] == "verified"
    
    # Validar a través de la API pública
    api_response = await client.get(f"/api/public/validar/{cred.numero}")
    assert api_response.status_code == 200
    api_data = api_response.json()
    assert api_data["valid"] is True
    assert api_data["signatureValid"] is True
    assert api_data["signatureStatus"] == "verified"
    
    # Manipular la firma en la base de datos para simular manipulación fraudulenta
    await prisma.credencial.update(
        where={"id": cred.id},
        data={"firmaCriptografica": "falsafirma1234567890123456789012345678901234567890123456789012"}
    )
    
    # Validar de nuevo - la validación debe fallar
    validation_manipulated = await credential_validator.validate_credential(cred.numero)
    assert validation_manipulated["valid"] is False
    assert validation_manipulated["signatureValid"] is False
    assert validation_manipulated["signatureStatus"] == "invalid"
    
    # Limpiar credencial manual
    await prisma.credencial.delete(where={"id": cred.id})
