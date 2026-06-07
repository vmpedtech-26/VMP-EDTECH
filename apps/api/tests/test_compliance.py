import pytest
from core.database import prisma
from auth.jwt import create_access_token


@pytest.fixture
async def admin_user(db):
    """Fixture para crear un administrador temporal."""
    admin = await prisma.user.create(
        data={
            "email": "admin_compliance@vmp-edtech.com.ar",
            "passwordHash": "somehash",
            "nombre": "Oficial",
            "apellido": "Cumplimiento",
            "dni": "11.111.111",
            "rol": "SUPER_ADMIN",
            "activo": True
        }
    )
    yield admin
    await prisma.user.delete(where={"id": admin.id})


@pytest.fixture
async def regular_user(db):
    """Fixture para crear un alumno temporal."""
    user = await prisma.user.create(
        data={
            "email": "alumno_compliance@vmp-edtech.com.ar",
            "passwordHash": "somehash",
            "nombre": "Juan",
            "apellido": "Perez",
            "dni": "22.222.222",
            "rol": "ALUMNO",
            "activo": True
        }
    )
    yield user
    await prisma.user.delete(where={"id": user.id})


@pytest.mark.asyncio
async def test_registrar_denuncia_anonima(client):
    """Prueba que es posible registrar una denuncia 100% anónima de forma pública."""
    response = await client.post(
        "/api/compliance/report",
        json={
            "titulo": "Sospecha de desvío de fondos",
            "descripcion": "Se detectaron movimientos irregulares en la caja menor del taller.",
            "categoria": "FRAUDE",
            "relacionEmpresa": "ANONIMO",
            "esAnonima": True
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "codigoSeguimiento" in data
    assert data["codigoSeguimiento"].startswith("VMP-COMP-")
    assert data["categoria"] == "FRAUDE"
    assert data["estado"] == "NUEVA"
    assert data["comentariosOficial"] is None
    
    # Limpiar de la base de datos
    await prisma.compliancereport.delete(where={"codigoSeguimiento": data["codigoSeguimiento"]})


@pytest.mark.asyncio
async def test_registrar_denuncia_identificada(client):
    """Prueba que es posible registrar una denuncia nominativa con datos de contacto."""
    response = await client.post(
        "/api/compliance/report",
        json={
            "titulo": "Acoso laboral de supervisor",
            "descripcion": "El supervisor del curso presencial tiene malos tratos constantes.",
            "categoria": "ACOSO",
            "relacionEmpresa": "EMPLEADO",
            "esAnonima": False,
            "nombreDenunciante": "Pedro Picapiedra",
            "emailDenunciante": "pedro@piedra.com",
            "telefono": "123456789"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "codigoSeguimiento" in data
    
    # Verificar que se persistió
    report = await prisma.compliancereport.find_unique(where={"codigoSeguimiento": data["codigoSeguimiento"]})
    assert report is not None
    assert report.esAnonima is False
    assert report.nombreDenunciante == "Pedro Picapiedra"
    assert report.emailDenunciante == "pedro@piedra.com"
    assert report.telefono == "123456789"
    
    # Limpiar
    await prisma.compliancereport.delete(where={"id": report.id})


@pytest.mark.asyncio
async def test_consultar_denuncia_por_codigo(client):
    """Prueba consultar el estado de una denuncia usando el código de seguimiento."""
    # Crear denuncia directo en BD
    report = await prisma.compliancereport.create(
        data={
            "codigoSeguimiento": "VMP-COMP-TEST12",
            "titulo": "Test de consulta",
            "descripcion": "Validar endpoint de consulta pública",
            "categoria": "OTROS",
            "relacionEmpresa": "EXTERNO",
            "esAnonima": True,
            "estado": "EN_INVESTIGACION",
            "comentariosOficial": "Se iniciaron las entrevistas preliminares."
        }
    )
    
    response = await client.get(f"/api/compliance/report/{report.codigoSeguimiento}")
    assert response.status_code == 200
    data = response.json()
    assert data["codigoSeguimiento"] == "VMP-COMP-TEST12"
    assert data["estado"] == "EN_INVESTIGACION"
    assert data["comentariosOficial"] == "Se iniciaron las entrevistas preliminares."
    
    # Código inexistente
    response_err = await client.get("/api/compliance/report/VMP-COMP-INEXISTENTE")
    assert response_err.status_code == 404
    
    # Limpiar
    await prisma.compliancereport.delete(where={"id": report.id})


@pytest.mark.asyncio
async def test_admin_gestion_denuncias(client, admin_user, regular_user):
    """Prueba que el administrador puede ver y gestionar las denuncias y un usuario regular no."""
    # Generar código dinámico para evitar colisiones
    import secrets
    import string
    random_suffix = "".join(secrets.choice(string.ascii_uppercase) for _ in range(6))
    codigo_test = f"VMP-COMP-AD{random_suffix}"

    # Crear denuncia
    report = await prisma.compliancereport.create(
        data={
            "codigoSeguimiento": codigo_test,
            "titulo": "Denuncia de Admin",
            "descripcion": "Verificación de permisos",
            "categoria": "CORRUPCION",
            "relacionEmpresa": "PROVEEDOR",
            "esAnonima": False,
            "nombreDenunciante": "Gomez",
            "emailDenunciante": "gomez@mail.com",
            "estado": "NUEVA"
        }
    )
    
    # 1. Intentar acceder sin token (público)
    response_anon = await client.get("/api/compliance/admin/reports")
    assert response_anon.status_code == 401
    
    # 2. Intentar acceder con token de alumno
    user_token = create_access_token(data={"sub": regular_user.id})
    headers_user = {"Authorization": f"Bearer {user_token}"}
    response_user = await client.get("/api/compliance/admin/reports", headers=headers_user)
    assert response_user.status_code == 403
    
    # 3. Acceder como Administrador (SUPER_ADMIN)
    admin_token = create_access_token(data={"sub": admin_user.id})
    headers_admin = {"Authorization": f"Bearer {admin_token}"}
    
    # Listado
    response_list = await client.get("/api/compliance/admin/reports", headers=headers_admin)
    assert response_list.status_code == 200
    list_data = response_list.json()
    assert len(list_data) >= 1
    assert any(item["codigoSeguimiento"] == codigo_test for item in list_data)
    
    # Detalle
    response_detail = await client.get(f"/api/compliance/admin/reports/{report.id}", headers=headers_admin)
    assert response_detail.status_code == 200
    detail_data = response_detail.json()
    assert detail_data["nombreDenunciante"] == "Gomez"
    
    # Actualizar estado y comentarios
    response_patch = await client.patch(
        f"/api/compliance/admin/reports/{report.id}",
        json={
            "estado": "RESUELTA",
            "comentariosOficial": "Caso cerrado de forma satisfactoria."
        },
        headers=headers_admin
    )
    assert response_patch.status_code == 200
    patched_data = response_patch.json()
    assert patched_data["estado"] == "RESUELTA"
    assert patched_data["comentariosOficial"] == "Caso cerrado de forma satisfactoria."
    
    # Comprobar que en la consulta pública se vea el cambio
    response_pub = await client.get(f"/api/compliance/report/{report.codigoSeguimiento}")
    assert response_pub.status_code == 200
    pub_data = response_pub.json()
    assert pub_data["estado"] == "RESUELTA"
    assert pub_data["comentariosOficial"] == "Caso cerrado de forma satisfactoria."
    
    # Limpiar
    await prisma.compliancereport.delete(where={"id": report.id})
