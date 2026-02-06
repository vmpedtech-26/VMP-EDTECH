"""
Tests para cursos e inscripciones.
"""
import pytest
from httpx import AsyncClient
from core.database import prisma


class TestCursos:
    """Tests de cursos"""
    
    @pytest.mark.asyncio
    async def test_create_curso(self, client: AsyncClient, admin_token, db):
        """Test de creación de curso"""
        response = await client.post(
            "/api/cursos/",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "nombre": "Curso de Prueba",
                "codigo": "CP-TEST-001",
                "descripcion": "Descripción del curso de prueba",
                "duracionHoras": 30,
                "vigenciaMeses": 12,
                "activo": True
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["nombre"] == "Curso de Prueba"
        assert data["codigo"] == "CP-TEST-001"
        assert "id" in data
        
        # Cleanup
        await prisma.curso.delete(where={"id": data["id"]})
    
    @pytest.mark.asyncio
    async def test_get_cursos(self, client: AsyncClient, auth_token):
        """Test de obtener lista de cursos"""
        response = await client.get(
            "/api/cursos/",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    @pytest.mark.asyncio
    async def test_get_curso_by_id(self, client: AsyncClient, admin_token, db):
        """Test de obtener curso por ID"""
        # Crear curso
        curso = await prisma.curso.create(
            data={
                "nombre": "Curso Test",
                "codigo": "CT-002",
                "descripcion": "Test",
                "duracionHoras": 20,
                "activo": True
            }
        )
        
        # Obtener por ID
        response = await client.get(
            f"/api/cursos/{curso.id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == curso.id
        assert data["nombre"] == "Curso Test"
        
        # Cleanup
        await prisma.curso.delete(where={"id": curso.id})
    
    @pytest.mark.asyncio
    async def test_update_curso(self, client: AsyncClient, admin_token, db):
        """Test de actualización de curso"""
        # Crear curso
        curso = await prisma.curso.create(
            data={
                "nombre": "Curso Original",
                "codigo": "CO-001",
                "descripcion": "Descripción original",
                "duracionHoras": 20,
                "activo": True
            }
        )
        
        # Actualizar
        response = await client.put(
            f"/api/cursos/{curso.id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "nombre": "Curso Actualizado",
                "codigo": "CO-001",
                "descripcion": "Descripción actualizada",
                "duracionHoras": 25,
                "activo": True
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["nombre"] == "Curso Actualizado"
        assert data["duracionHoras"] == 25
        
        # Cleanup
        await prisma.curso.delete(where={"id": curso.id})
    
    @pytest.mark.asyncio
    async def test_delete_curso(self, client: AsyncClient, admin_token, db):
        """Test de eliminación de curso"""
        # Crear curso
        curso = await prisma.curso.create(
            data={
                "nombre": "Curso a Eliminar",
                "codigo": "CE-001",
                "descripcion": "Test",
                "duracionHoras": 10,
                "activo": True
            }
        )
        
        # Eliminar
        response = await client.delete(
            f"/api/cursos/{curso.id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        
        # Verificar que fue eliminado
        deleted_curso = await prisma.curso.find_unique(where={"id": curso.id})
        assert deleted_curso is None


class TestInscripciones:
    """Tests de inscripciones"""
    
    @pytest.mark.asyncio
    async def test_create_inscripcion(self, client: AsyncClient, admin_token, test_user, db):
        """Test de creación de inscripción"""
        # Crear curso
        curso = await prisma.curso.create(
            data={
                "nombre": "Curso para Inscripción",
                "codigo": "CI-001",
                "descripcion": "Test",
                "duracionHoras": 30,
                "activo": True
            }
        )
        
        # Crear inscripción
        response = await client.post(
            "/api/inscripciones/",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "alumnoId": test_user.id,
                "cursoId": curso.id
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["alumnoId"] == test_user.id
        assert data["cursoId"] == curso.id
        assert data["estado"] == "NO_INICIADO"
        assert data["progreso"] == 0
        
        # Cleanup
        await prisma.inscripcion.delete(where={"id": data["id"]})
        await prisma.curso.delete(where={"id": curso.id})
    
    @pytest.mark.asyncio
    async def test_get_inscripciones_by_alumno(self, client: AsyncClient, auth_token, test_user, db):
        """Test de obtener inscripciones de un alumno"""
        # Crear curso e inscripción
        curso = await prisma.curso.create(
            data={
                "nombre": "Curso Test",
                "codigo": "CT-003",
                "descripcion": "Test",
                "duracionHoras": 20,
                "activo": True
            }
        )
        
        inscripcion = await prisma.inscripcion.create(
            data={
                "alumnoId": test_user.id,
                "cursoId": curso.id,
                "estado": "NO_INICIADO",
                "progreso": 0
            }
        )
        
        # Obtener inscripciones
        response = await client.get(
            f"/api/inscripciones/alumno/{test_user.id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Cleanup
        await prisma.inscripcion.delete(where={"id": inscripcion.id})
        await prisma.curso.delete(where={"id": curso.id})
    
    @pytest.mark.asyncio
    async def test_update_progreso(self, client: AsyncClient, auth_token, test_user, db):
        """Test de actualización de progreso"""
        # Crear curso e inscripción
        curso = await prisma.curso.create(
            data={
                "nombre": "Curso Progreso",
                "codigo": "CP-004",
                "descripcion": "Test",
                "duracionHoras": 20,
                "activo": True
            }
        )
        
        inscripcion = await prisma.inscripcion.create(
            data={
                "alumnoId": test_user.id,
                "cursoId": curso.id,
                "estado": "EN_PROGRESO",
                "progreso": 0
            }
        )
        
        # Actualizar progreso
        response = await client.patch(
            f"/api/inscripciones/{inscripcion.id}/progreso",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"progreso": 50}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["progreso"] == 50
        
        # Cleanup
        await prisma.inscripcion.delete(where={"id": inscripcion.id})
        await prisma.curso.delete(where={"id": curso.id})
    
    @pytest.mark.asyncio
    async def test_complete_inscripcion(self, client: AsyncClient, auth_token, test_user, db):
        """Test de completar inscripción"""
        # Crear curso e inscripción
        curso = await prisma.curso.create(
            data={
                "nombre": "Curso Completar",
                "codigo": "CC-005",
                "descripcion": "Test",
                "duracionHoras": 20,
                "activo": True
            }
        )
        
        inscripcion = await prisma.inscripcion.create(
            data={
                "alumnoId": test_user.id,
                "cursoId": curso.id,
                "estado": "EN_PROGRESO",
                "progreso": 90
            }
        )
        
        # Completar inscripción
        response = await client.patch(
            f"/api/inscripciones/{inscripcion.id}/progreso",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"progreso": 100}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["progreso"] == 100
        assert data["estado"] == "COMPLETADO"
        
        # Cleanup
        await prisma.inscripcion.delete(where={"id": inscripcion.id})
        await prisma.curso.delete(where={"id": curso.id})
