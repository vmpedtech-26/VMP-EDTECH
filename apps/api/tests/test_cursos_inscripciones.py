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
            "/api/cursos",
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
            "/api/cursos",
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
    """Tests de inscripciones.

    La API de inscripciones es de auto-servicio: el alumno se inscribe y
    avanza con su propio token (current_user.id), no hay un endpoint donde
    un admin cree/liste/actualice inscripciones de un alumno arbitrario ni
    un campo "progreso" seteable a mano -- se recalcula siempre a partir de
    qué módulos están realmente completados (Examen aprobado, Evidencia
    aprobada, o teoría marcada como vista)."""

    @pytest.mark.asyncio
    async def test_create_inscripcion(self, client: AsyncClient, auth_token, test_user, db):
        """Test de auto-inscripción en un curso"""
        curso = await prisma.curso.create(
            data={
                "nombre": "Curso para Inscripción",
                "codigo": "CI-001",
                "descripcion": "Test",
                "duracionHoras": 30,
                "activo": True
            }
        )

        response = await client.post(
            f"/api/inscripciones/{curso.id}/inscribir",
            headers={"Authorization": f"Bearer {auth_token}"}
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
    async def test_get_inscripcion_by_curso(self, client: AsyncClient, auth_token, test_user, db):
        """Test de obtener el estado de la propia inscripción en un curso"""
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

        response = await client.get(
            f"/api/inscripciones/{curso.id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == inscripcion.id
        assert data["cursoId"] == curso.id
        assert data["alumnoId"] == test_user.id

        # Cleanup
        await prisma.inscripcion.delete(where={"id": inscripcion.id})
        await prisma.curso.delete(where={"id": curso.id})

    @pytest.mark.asyncio
    async def test_update_progreso(self, client: AsyncClient, auth_token, test_user, db):
        """Test de que completar un módulo de teoría recalcula el progreso real"""
        curso = await prisma.curso.create(
            data={
                "nombre": "Curso Progreso",
                "codigo": "CP-004",
                "descripcion": "Test",
                "duracionHoras": 20,
                "activo": True
            }
        )
        # Dos módulos de teoría: completar uno debe dar 50%, no 100%
        modulo_1 = await prisma.modulo.create(
            data={"cursoId": curso.id, "titulo": "Módulo 1", "orden": 1, "tipo": "TEORIA"}
        )
        await prisma.modulo.create(
            data={"cursoId": curso.id, "titulo": "Módulo 2", "orden": 2, "tipo": "TEORIA"}
        )

        inscripcion = await prisma.inscripcion.create(
            data={
                "alumnoId": test_user.id,
                "cursoId": curso.id,
                "estado": "NO_INICIADO",
                "progreso": 0
            }
        )

        response = await client.post(
            f"/api/inscripciones/{curso.id}/modulos/{modulo_1.id}/completar",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"moduloId": modulo_1.id}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["nuevoProgreso"] == 50
        assert data["cursoCompletado"] is False

        # Cleanup
        await prisma.inscripcion.delete(where={"id": inscripcion.id})
        await prisma.modulo.delete_many(where={"cursoId": curso.id})
        await prisma.curso.delete(where={"id": curso.id})

    @pytest.mark.asyncio
    async def test_complete_inscripcion(self, client: AsyncClient, auth_token, test_user, db):
        """Test de que completar el único módulo de un curso lo marca COMPLETADO"""
        curso = await prisma.curso.create(
            data={
                "nombre": "Curso Completar",
                "codigo": "CC-005",
                "descripcion": "Test",
                "duracionHoras": 20,
                "activo": True
            }
        )
        modulo = await prisma.modulo.create(
            data={"cursoId": curso.id, "titulo": "Único módulo", "orden": 1, "tipo": "TEORIA"}
        )

        inscripcion = await prisma.inscripcion.create(
            data={
                "alumnoId": test_user.id,
                "cursoId": curso.id,
                "estado": "NO_INICIADO",
                "progreso": 0
            }
        )

        response = await client.post(
            f"/api/inscripciones/{curso.id}/modulos/{modulo.id}/completar",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"moduloId": modulo.id}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["nuevoProgreso"] == 100
        assert data["cursoCompletado"] is True

        inscripcion_actualizada = await prisma.inscripcion.find_unique(where={"id": inscripcion.id})
        assert inscripcion_actualizada.estado == "COMPLETADO"

        # Cleanup (borrar primero cualquier credencial que se haya autogenerado
        # al completar el curso, antes de borrar al alumno/curso por FK)
        await prisma.credencial.delete_many(where={"alumnoId": test_user.id, "cursoId": curso.id})
        await prisma.inscripcion.delete(where={"id": inscripcion.id})
        await prisma.modulo.delete_many(where={"cursoId": curso.id})
        await prisma.curso.delete(where={"id": curso.id})


class TestModulosConPreguntas:
    """Regresión: crear un módulo QUIZ con preguntas rompía con
    MissingRequiredValueError porque `opciones` (campo Json) se pasaba como
    lista de Python cruda en vez de envolverla con prisma.Json()."""

    @pytest.mark.asyncio
    async def test_crear_modulo_quiz_con_preguntas(self, client: AsyncClient, admin_token):
        curso = await prisma.curso.create(
            data={
                "nombre": "Curso Quiz",
                "codigo": "CQ-001",
                "descripcion": "Test",
                "duracionHoras": 10,
                "activo": True
            }
        )

        response = await client.post(
            f"/api/cursos/{curso.id}/modulos",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "titulo": "Evaluación",
                "orden": 1,
                "tipo": "QUIZ",
                "preguntas": [
                    {
                        "pregunta": "¿2 + 2?",
                        "opciones": ["3", "4", "5"],
                        "respuestaCorrecta": 1,
                        "explicacion": "2 + 2 = 4"
                    }
                ]
            }
        )

        assert response.status_code == 200
        modulo_id = response.json()["id"]

        preguntas = await prisma.pregunta.find_many(where={"moduloId": modulo_id})
        assert len(preguntas) == 1
        assert preguntas[0].opciones == ["3", "4", "5"]

        # Cleanup
        await prisma.modulo.delete_many(where={"cursoId": curso.id})
        await prisma.curso.delete(where={"id": curso.id})
