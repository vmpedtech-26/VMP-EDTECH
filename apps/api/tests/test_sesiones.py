"""
Tests para el router de sesiones de capacitación, en particular el control
de acceso al crear sesiones: un INSTRUCTOR solo puede crear sesiones para
su propio curso, y no puede asignarle la sesión a otro instructor.
"""
import pytest
from httpx import AsyncClient
from core.database import prisma
from auth.jwt import hash_password, create_access_token


async def _crear_instructor(email: str):
    instructor = await prisma.user.create(
        data={
            "email": email,
            "passwordHash": hash_password("instructor123"),
            "nombre": "Instructor",
            "apellido": email.split("@")[0],
            "dni": email[:8].ljust(8, "0"),
            "rol": "INSTRUCTOR",
            "activo": True,
        }
    )
    token = create_access_token(data={"sub": instructor.id})
    return instructor, token


class TestCrearSesion:
    @pytest.mark.asyncio
    async def test_instructor_titular_puede_crear_sesion(self, client: AsyncClient, db):
        instructor, token = await _crear_instructor("titular@sesiones-test.com")
        curso = await prisma.curso.create(
            data={
                "nombre": "Curso Sesiones Titular",
                "codigo": "SES-TITULAR-001",
                "descripcion": "Test",
                "duracionHoras": 20,
                "estado": "PUBLICADO",
                "instructorId": instructor.id,
            }
        )

        response = await client.post(
            "/api/sesiones",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "cursoId": curso.id,
                "titulo": "Clase 1",
                "fechaInicio": "2026-09-01T10:00:00",
                "fechaFin": "2026-09-01T12:00:00",
            },
        )

        assert response.status_code == 200
        data = response.json()

        await prisma.sesioncapacitacion.delete(where={"id": data["id"]})
        await prisma.curso.delete(where={"id": curso.id})
        await prisma.user.delete(where={"id": instructor.id})

    @pytest.mark.asyncio
    async def test_instructor_no_titular_no_puede_crear_sesion(self, client: AsyncClient, db):
        dueño, token_dueño = await _crear_instructor("dueno@sesiones-test.com")
        intruso, token_intruso = await _crear_instructor("intruso@sesiones-test.com")
        curso = await prisma.curso.create(
            data={
                "nombre": "Curso Sesiones Ajeno",
                "codigo": "SES-AJENO-001",
                "descripcion": "Test",
                "duracionHoras": 20,
                "estado": "PUBLICADO",
                "instructorId": dueño.id,
            }
        )

        response = await client.post(
            "/api/sesiones",
            headers={"Authorization": f"Bearer {token_intruso}"},
            json={
                "cursoId": curso.id,
                "titulo": "Clase intrusa",
                "fechaInicio": "2026-09-01T10:00:00",
                "fechaFin": "2026-09-01T12:00:00",
            },
        )

        assert response.status_code == 403

        await prisma.curso.delete(where={"id": curso.id})
        await prisma.user.delete(where={"id": dueño.id})
        await prisma.user.delete(where={"id": intruso.id})

    @pytest.mark.asyncio
    async def test_instructor_no_puede_asignar_otro_instructor(self, client: AsyncClient, db):
        instructor, token = await _crear_instructor("asigna@sesiones-test.com")
        otro, _ = await _crear_instructor("otro@sesiones-test.com")
        curso = await prisma.curso.create(
            data={
                "nombre": "Curso Sesiones Asignacion",
                "codigo": "SES-ASIGNA-001",
                "descripcion": "Test",
                "duracionHoras": 20,
                "estado": "PUBLICADO",
                "instructorId": instructor.id,
            }
        )

        response = await client.post(
            "/api/sesiones",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "cursoId": curso.id,
                "titulo": "Clase con instructor ajeno",
                "fechaInicio": "2026-09-01T10:00:00",
                "fechaFin": "2026-09-01T12:00:00",
                "instructorId": otro.id,
            },
        )

        assert response.status_code == 403

        await prisma.curso.delete(where={"id": curso.id})
        await prisma.user.delete(where={"id": instructor.id})
        await prisma.user.delete(where={"id": otro.id})

    @pytest.mark.asyncio
    async def test_admin_puede_crear_sesion_para_cualquier_curso(self, client: AsyncClient, admin_token, db):
        instructor, _ = await _crear_instructor("dueno-admin@sesiones-test.com")
        curso = await prisma.curso.create(
            data={
                "nombre": "Curso Sesiones Admin",
                "codigo": "SES-ADMIN-001",
                "descripcion": "Test",
                "duracionHoras": 20,
                "estado": "PUBLICADO",
                "instructorId": instructor.id,
            }
        )

        response = await client.post(
            "/api/sesiones",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "cursoId": curso.id,
                "titulo": "Clase creada por admin",
                "fechaInicio": "2026-09-01T10:00:00",
                "fechaFin": "2026-09-01T12:00:00",
            },
        )

        assert response.status_code == 200
        data = response.json()

        await prisma.sesioncapacitacion.delete(where={"id": data["id"]})
        await prisma.curso.delete(where={"id": curso.id})
        await prisma.user.delete(where={"id": instructor.id})
