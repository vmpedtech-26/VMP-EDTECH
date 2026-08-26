"""
Tests para routers/evidencias.py: listar_evidencias_pendientes() y
obtener_stats_evidencias() solo aplicaban el filtro de empresa "si"
current_user.empresaId era verdadero -- un INSTRUCTOR sin empresa asignada
veía evidencias y estadísticas de toda la plataforma en vez de ninguna.
"""
import pytest
from httpx import AsyncClient
from core.database import prisma
from auth.jwt import hash_password, create_access_token


async def _crear_instructor_sin_empresa(email: str, dni: str):
    instructor = await prisma.user.create(
        data={
            "email": email,
            "passwordHash": hash_password("instructor123"),
            "nombre": "Instructor",
            "apellido": "SinEmpresa",
            "dni": dni,
            "rol": "INSTRUCTOR",
            "empresaId": None,
            "activo": True,
        }
    )
    token = create_access_token(data={"sub": instructor.id})
    return instructor, token


class TestEvidenciasAlcanceInstructor:
    @pytest.mark.asyncio
    async def test_instructor_sin_empresa_no_ve_evidencias_de_otras_empresas(self, client: AsyncClient, db):
        instructor, token = await _crear_instructor_sin_empresa(
            "instructor-sin-empresa-evidencias@test.com", "12312312"
        )

        empresa = await prisma.company.create(
            data={
                "nombre": "Empresa Evidencias Test",
                "cuit": "20-66666666-6",
                "email": "empresa-evidencias-test@test.com",
                "activa": True,
            }
        )
        alumno = await prisma.user.create(
            data={
                "email": "alumno-evidencias-test@test.com",
                "passwordHash": hash_password("alumno123"),
                "nombre": "Alumno",
                "apellido": "Evidencias",
                "dni": "45645645",
                "rol": "ALUMNO",
                "empresaId": empresa.id,
                "activo": True,
            }
        )
        curso = await prisma.curso.create(
            data={
                "nombre": "Curso Evidencias Test",
                "codigo": "EVID-TEST-001",
                "descripcion": "Test",
                "duracionHoras": 10,
                "activo": True,
            }
        )
        modulo = await prisma.modulo.create(
            data={"cursoId": curso.id, "titulo": "Modulo practica", "orden": 1, "tipo": "PRACTICA"}
        )
        tarea = await prisma.tareapractica.create(
            data={"moduloId": modulo.id, "descripcion": "Tarea test", "requiereFoto": False}
        )
        evidencia = await prisma.evidencia.create(
            data={
                "tareaId": tarea.id,
                "alumnoId": alumno.id,
                "estado": "PENDIENTE",
            }
        )

        response = await client.get(
            "/api/evidencias/revision",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        ids = {e["id"] for e in response.json()["evidencias"]}
        assert evidencia.id not in ids

        stats_response = await client.get(
            "/api/evidencias/stats",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert stats_response.status_code == 200
        assert stats_response.json()["pending"] == 0

        await prisma.evidencia.delete(where={"id": evidencia.id})
        await prisma.tareapractica.delete(where={"id": tarea.id})
        await prisma.modulo.delete(where={"id": modulo.id})
        await prisma.curso.delete(where={"id": curso.id})
        await prisma.user.delete(where={"id": alumno.id})
        await prisma.company.delete(where={"id": empresa.id})
        await prisma.user.delete(where={"id": instructor.id})
