from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
from schemas.sesiones import (
    CreateSesionRequest,
    UpdateSesionRequest,
    SesionListItem,
    SesionDetail,
    RegistrarAsistenciaRequest,
)
from auth.dependencies import get_current_user
from core.database import prisma

router = APIRouter()


@router.get("", response_model=List[SesionListItem])
async def listar_sesiones(
    cursoId: Optional[str] = None,
    estado: Optional[str] = None,
    current_user=Depends(get_current_user)
):
    """
    Listar sesiones de capacitación.
    - SUPER_ADMIN: ve todas
    - INSTRUCTOR: ve solo las de sus cursos asignados
    """
    where_clause = {}

    if cursoId:
        where_clause["cursoId"] = cursoId

    if estado:
        where_clause["estado"] = estado

    # INSTRUCTOR solo ve sesiones de sus cursos
    if current_user.rol == "INSTRUCTOR":
        cursos_instructor = await prisma.curso.find_many(
            where={"instructorId": current_user.id},
            select={"id": True}
        )
        ids_cursos = [c.id for c in cursos_instructor]
        where_clause["cursoId"] = {"in": ids_cursos}

    sesiones = await prisma.sesionCapacitacion.find_many(
        where=where_clause,
        include={"curso": True, "asistencias": True},
        order={"fechaInicio": "asc"}
    )

    result = []
    for s in sesiones:
        result.append(SesionListItem(
            id=s.id,
            cursoId=s.cursoId,
            titulo=s.titulo,
            descripcion=s.descripcion,
            fechaInicio=s.fechaInicio,
            fechaFin=s.fechaFin,
            lugar=s.lugar,
            plataforma=s.plataforma,
            meetLink=s.meetLink,
            estado=s.estado,
            createdAt=s.createdAt,
            cursoNombre=s.curso.nombre if s.curso else None,
            cursoModalidad=s.curso.modalidad if s.curso else None,
            totalAlumnos=len(s.asistencias) if s.asistencias else 0,
            alumnosPresentes=len([a for a in s.asistencias if a.presente]) if s.asistencias else 0,
        ))

    return result


@router.get("/proximas", response_model=List[SesionListItem])
async def obtener_proximas_sesiones(current_user=Depends(get_current_user)):
    """
    Obtener próximas sesiones (futuras) del instructor actual o del alumno.
    """
    ahora = datetime.now()
    where_clause = {
        "fechaInicio": {"gte": ahora},
        "estado": {"in": ["PROGRAMADA", "EN_CURSO"]}
    }

    if current_user.rol == "INSTRUCTOR":
        cursos_instructor = await prisma.curso.find_many(
            where={"instructorId": current_user.id},
            select={"id": True}
        )
        ids_cursos = [c.id for c in cursos_instructor]
        where_clause["cursoId"] = {"in": ids_cursos}
    elif current_user.rol == "ALUMNO":
        # Obtener cursos en los que el alumno está inscripto
        inscripciones = await prisma.inscripcion.find_many(
            where={"alumnoId": current_user.id},
            select={"cursoId": True}
        )
        ids_cursos = [i.cursoId for i in inscripciones]
        where_clause["cursoId"] = {"in": ids_cursos}

    sesiones = await prisma.sesionCapacitacion.find_many(
        where=where_clause,
        include={"curso": True},
        order={"fechaInicio": "asc"},
        take=10
    )

    return [SesionListItem(
        id=s.id,
        cursoId=s.cursoId,
        titulo=s.titulo,
        descripcion=s.descripcion,
        fechaInicio=s.fechaInicio,
        fechaFin=s.fechaFin,
        lugar=s.lugar,
        plataforma=s.plataforma,
        meetLink=s.meetLink,
        estado=s.estado,
        createdAt=s.createdAt,
        cursoNombre=s.curso.nombre if s.curso else None,
        cursoModalidad=s.curso.modalidad if s.curso else None,
    ) for s in sesiones]


@router.get("/{sesion_id}", response_model=SesionDetail)
async def obtener_sesion(sesion_id: str, current_user=Depends(get_current_user)):
    """Obtener detalle de una sesión con su lista de asistencia"""
    sesion = await prisma.sesionCapacitacion.find_unique(
        where={"id": sesion_id},
        include={
            "curso": True,
            "asistencias": {
                "include": {"alumno": True}
            }
        }
    )

    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")

    # Verificar acceso para instructores
    if current_user.rol == "INSTRUCTOR":
        if sesion.curso and sesion.curso.instructorId != current_user.id:
            raise HTTPException(status_code=403, detail="No tienes acceso a esta sesión")

    asistencias_formateadas = []
    for a in (sesion.asistencias or []):
        if a.alumno:
            asistencias_formateadas.append({
                "alumnoId": a.alumnoId,
                "nombre": a.alumno.nombre,
                "apellido": a.alumno.apellido,
                "dni": a.alumno.dni,
                "presente": a.presente,
                "checkIn": a.checkIn,
                "notas": a.notas,
            })

    return SesionDetail(
        id=sesion.id,
        cursoId=sesion.cursoId,
        titulo=sesion.titulo,
        descripcion=sesion.descripcion,
        fechaInicio=sesion.fechaInicio,
        fechaFin=sesion.fechaFin,
        lugar=sesion.lugar,
        plataforma=sesion.plataforma,
        meetLink=sesion.meetLink,
        estado=sesion.estado,
        createdAt=sesion.createdAt,
        cursoNombre=sesion.curso.nombre if sesion.curso else None,
        cursoModalidad=sesion.curso.modalidad if sesion.curso else None,
        asistencias=asistencias_formateadas,
    )


@router.post("", response_model=SesionListItem)
async def crear_sesion(
    data: CreateSesionRequest,
    current_user=Depends(get_current_user)
):
    """Crear una nueva sesión de capacitación (SUPER_ADMIN)"""
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Solo el Super Admin puede crear sesiones")

    # Verificar que el curso existe
    curso = await prisma.curso.find_unique(where={"id": data.cursoId})
    if not curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    sesion = await prisma.sesionCapacitacion.create(
        data={
            "cursoId": data.cursoId,
            "titulo": data.titulo,
            "descripcion": data.descripcion,
            "fechaInicio": data.fechaInicio,
            "fechaFin": data.fechaFin,
            "lugar": data.lugar,
            "plataforma": data.plataforma,
            "meetLink": data.meetLink,
            "estado": "PROGRAMADA",
        },
        include={"curso": True}
    )

    # Auto-registrar todos los alumnos inscriptos al curso en la lista de asistencia
    inscripciones = await prisma.inscripcion.find_many(
        where={"cursoId": data.cursoId},
        select={"alumnoId": True}
    )
    for insc in inscripciones:
        await prisma.asistenciaSesion.create(
            data={
                "sesionId": sesion.id,
                "alumnoId": insc.alumnoId,
                "presente": False,
            }
        )

    return SesionListItem(
        id=sesion.id,
        cursoId=sesion.cursoId,
        titulo=sesion.titulo,
        descripcion=sesion.descripcion,
        fechaInicio=sesion.fechaInicio,
        fechaFin=sesion.fechaFin,
        lugar=sesion.lugar,
        plataforma=sesion.plataforma,
        meetLink=sesion.meetLink,
        estado=sesion.estado,
        createdAt=sesion.createdAt,
        cursoNombre=sesion.curso.nombre if sesion.curso else None,
        cursoModalidad=sesion.curso.modalidad if sesion.curso else None,
        totalAlumnos=len(inscripciones),
        alumnosPresentes=0,
    )


@router.patch("/{sesion_id}", response_model=SesionListItem)
async def actualizar_sesion(
    sesion_id: str,
    data: UpdateSesionRequest,
    current_user=Depends(get_current_user)
):
    """Actualizar una sesión (SUPER_ADMIN)"""
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Solo el Super Admin puede editar sesiones")

    sesion = await prisma.sesionCapacitacion.find_unique(where={"id": sesion_id})
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")

    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    sesion = await prisma.sesionCapacitacion.update(
        where={"id": sesion_id},
        data=update_data,
        include={"curso": True, "asistencias": True}
    )

    return SesionListItem(
        id=sesion.id,
        cursoId=sesion.cursoId,
        titulo=sesion.titulo,
        descripcion=sesion.descripcion,
        fechaInicio=sesion.fechaInicio,
        fechaFin=sesion.fechaFin,
        lugar=sesion.lugar,
        plataforma=sesion.plataforma,
        meetLink=sesion.meetLink,
        estado=sesion.estado,
        createdAt=sesion.createdAt,
        cursoNombre=sesion.curso.nombre if sesion.curso else None,
        cursoModalidad=sesion.curso.modalidad if sesion.curso else None,
        totalAlumnos=len(sesion.asistencias) if sesion.asistencias else 0,
        alumnosPresentes=len([a for a in sesion.asistencias if a.presente]) if sesion.asistencias else 0,
    )


@router.delete("/{sesion_id}")
async def cancelar_sesion(sesion_id: str, current_user=Depends(get_current_user)):
    """Cancelar una sesión (SUPER_ADMIN)"""
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Solo el Super Admin puede cancelar sesiones")

    sesion = await prisma.sesionCapacitacion.find_unique(where={"id": sesion_id})
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")

    await prisma.sesionCapacitacion.update(
        where={"id": sesion_id},
        data={"estado": "CANCELADA"}
    )
    return {"success": True, "message": "Sesión cancelada"}


@router.post("/{sesion_id}/asistencia")
async def registrar_asistencia(
    sesion_id: str,
    data: RegistrarAsistenciaRequest,
    current_user=Depends(get_current_user)
):
    """
    Registrar asistencia masiva de una sesión.
    Accesible por SUPER_ADMIN e INSTRUCTOR asignado.
    """
    sesion = await prisma.sesionCapacitacion.find_unique(
        where={"id": sesion_id},
        include={"curso": True}
    )
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")

    # Verificar acceso del instructor
    if current_user.rol == "INSTRUCTOR":
        if not sesion.curso or sesion.curso.instructorId != current_user.id:
            raise HTTPException(status_code=403, detail="No tienes acceso a esta sesión")
    elif current_user.rol not in ["SUPER_ADMIN", "INSTRUCTOR"]:
        raise HTTPException(status_code=403, detail="Sin permisos")

    ahora = datetime.now()
    actualizados = 0

    for item in data.asistencias:
        alumno_id = item.get("alumnoId")
        presente = item.get("presente", False)
        notas = item.get("notas")

        # Buscar si ya existe registro de asistencia
        existente = await prisma.asistenciaSesion.find_first(
            where={"sesionId": sesion_id, "alumnoId": alumno_id}
        )

        if existente:
            await prisma.asistenciaSesion.update(
                where={"id": existente.id},
                data={
                    "presente": presente,
                    "checkIn": ahora if presente else None,
                    "notas": notas,
                }
            )
        else:
            await prisma.asistenciaSesion.create(
                data={
                    "sesionId": sesion_id,
                    "alumnoId": alumno_id,
                    "presente": presente,
                    "checkIn": ahora if presente else None,
                    "notas": notas,
                }
            )
        actualizados += 1

    # Marcar sesión como EN_CURSO si estaba PROGRAMADA
    if sesion.estado == "PROGRAMADA":
        await prisma.sesionCapacitacion.update(
            where={"id": sesion_id},
            data={"estado": "EN_CURSO"}
        )

    return {"success": True, "actualizados": actualizados}
