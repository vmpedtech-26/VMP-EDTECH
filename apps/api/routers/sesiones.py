from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
import json
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
    - INSTRUCTOR: ve las de sus cursos o donde sea instructor titular
    - ALUMNO: ve las sesiones a las que está inscripto
    """
    where_clause = {}

    if cursoId:
        where_clause["cursoId"] = cursoId

    if estado:
        where_clause["estado"] = estado

    if current_user.rol == "INSTRUCTOR":
        # Cursos asignados o sesiones asignadas directamente
        cursos_instructor = await prisma.curso.find_many(
            where={"instructorId": current_user.id}
        )
        ids_cursos = [c.id for c in cursos_instructor]
        where_clause["OR"] = [
            {"cursoId": {"in": ids_cursos}},
            {"instructorId": current_user.id}
        ]
    elif current_user.rol == "ALUMNO":
        # Alumno ve sesiones si:
        # (a) tiene registro de asistencia, O
        # (b) está inscripto en el curso de la sesión
        # Esto garantiza que el banner EN VIVO aparezca aunque la sesión se haya
        # creado sin asignar alumnos manualmente.
        inscripciones_alumno = await prisma.inscripcion.find_many(
            where={"alumnoId": current_user.id}
        )
        cursos_inscripto = [i.cursoId for i in inscripciones_alumno]

        # Si el filtro de cursoId ya está en where_clause, lo preservamos
        curso_filtro = where_clause.pop("cursoId", None)

        or_conditions = [
            {"asistencias": {"some": {"alumnoId": current_user.id}}}
        ]
        if cursos_inscripto:
            curso_filter = {"cursoId": {"in": cursos_inscripto}}
            if curso_filtro:
                curso_filter = {"cursoId": {"in": [c for c in cursos_inscripto if c == curso_filtro]}}
            or_conditions.append(curso_filter)

        where_clause["OR"] = or_conditions
        if curso_filtro and not cursos_inscripto:
            where_clause["cursoId"] = curso_filtro

    sesiones = await prisma.sesioncapacitacion.find_many(
        where=where_clause,
        include={
            "curso": True, 
            "asistencias": True,
            "empresa": True,
            "instructor": True
        },
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
            empresaId=s.empresaId,
            empresaNombre=s.empresa.nombre if s.empresa else None,
            instructorId=s.instructorId,
            instructorNombre=f"{s.instructor.nombre} {s.instructor.apellido}" if s.instructor else None,
            totalAlumnos=len(s.asistencias) if s.asistencias else 0,
            alumnosPresentes=len([a for a in s.asistencias if a.presente]) if s.asistencias else 0,
        ))

    return result


@router.get("/proximas", response_model=List[SesionListItem])
async def obtener_proximas_sesiones(current_user=Depends(get_current_user)):
    """Obtener próximas sesiones para instructores o alumnos"""
    ahora = datetime.now()
    where_clause = {
        "fechaInicio": {"gte": ahora},
        "estado": {"in": ["PROGRAMADA", "EN_CURSO"]}
    }

    if current_user.rol == "INSTRUCTOR":
        cursos_instructor = await prisma.curso.find_many(
            where={"instructorId": current_user.id}
        )
        ids_cursos = [c.id for c in cursos_instructor]
        where_clause["OR"] = [
            {"cursoId": {"in": ids_cursos}},
            {"instructorId": current_user.id}
        ]
    elif current_user.rol == "ALUMNO":
        where_clause["asistencias"] = {
            "some": {
                "alumnoId": current_user.id
            }
        }

    sesiones = await prisma.sesioncapacitacion.find_many(
        where=where_clause,
        include={"curso": True, "empresa": True, "instructor": True},
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
        empresaId=s.empresaId,
        empresaNombre=s.empresa.nombre if s.empresa else None,
        instructorId=s.instructorId,
        instructorNombre=f"{s.instructor.nombre} {s.instructor.apellido}" if s.instructor else None,
    ) for s in sesiones]


@router.get("/{sesion_id}", response_model=SesionDetail)
async def obtener_sesion(sesion_id: str, current_user=Depends(get_current_user)):
    """Obtener detalle completo de sesión con su lista de asistencia"""
    sesion = await prisma.sesioncapacitacion.find_unique(
        where={"id": sesion_id},
        include={
            "curso": True,
            "empresa": True,
            "instructor": True,
            "asistencias": {
                "include": {"alumno": True}
            }
        }
    )

    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")

    # Verificar accesos
    if current_user.rol == "INSTRUCTOR":
        es_instructor_asignado = (sesion.instructorId == current_user.id)
        es_instructor_curso = (sesion.curso and sesion.curso.instructorId == current_user.id)
        if not (es_instructor_asignado or es_instructor_curso):
            raise HTTPException(status_code=403, detail="No tienes acceso a esta sesión")
    elif current_user.rol == "ALUMNO":
        pertenece = any(a.alumnoId == current_user.id for a in sesion.asistencias)
        if not pertenece:
            raise HTTPException(status_code=403, detail="No estás invitado a esta sesión")

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
                "notes": a.notas,
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
        empresaId=sesion.empresaId,
        empresaNombre=sesion.empresa.nombre if sesion.empresa else None,
        instructorId=sesion.instructorId,
        instructorNombre=f"{sesion.instructor.nombre} {sesion.instructor.apellido}" if sesion.instructor else None,
        asistencias=asistencias_formateadas,
    )


@router.post("", response_model=SesionListItem)
async def crear_sesion(
    data: CreateSesionRequest,
    current_user=Depends(get_current_user)
):
    """Crear sesión de capacitación (SUPER_ADMIN o INSTRUCTOR asignado)"""
    if current_user.rol not in ["SUPER_ADMIN", "INSTRUCTOR"]:
        raise HTTPException(status_code=403, detail="No tienes permisos para crear sesiones")

    # Verificar que el curso existe y está publicado
    curso = await prisma.curso.find_unique(where={"id": data.cursoId})
    if not curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
        
    if curso.estado != "PUBLICADO" and current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=400, detail="No se pueden crear sesiones para cursos en Borrador o Pendientes")

    # Un INSTRUCTOR solo puede crear sesiones para su propio curso, y no puede
    # asignarle la sesión a otro instructor (evita invitaciones a alumnos de
    # cursos ajenos atribuidas a un instructor arbitrario).
    if current_user.rol == "INSTRUCTOR":
        if curso.instructorId != current_user.id:
            raise HTTPException(status_code=403, detail="No sos el instructor asignado a este curso")
        if data.instructorId and data.instructorId != current_user.id:
            raise HTTPException(status_code=403, detail="No podés asignar la sesión a otro instructor")

    # Definir instructor titular
    inst_id = data.instructorId or (current_user.id if current_user.rol == "INSTRUCTOR" else curso.instructorId)

    sesion = await prisma.sesioncapacitacion.create(
        data={
            "cursoId": data.cursoId,
            "empresaId": data.empresaId,
            "instructorId": inst_id,
            "titulo": data.titulo,
            "descripcion": data.descripcion,
            "fechaInicio": data.fechaInicio,
            "fechaFin": data.fechaFin,
            "lugar": data.lugar,
            "plataforma": data.plataforma,
            "meetLink": data.meetLink,
            "estado": "PROGRAMADA",
        },
        include={"curso": True, "empresa": True, "instructor": True}
    )

    # Inscribir alumnos específicos o de la empresa
    alumnos_ids = data.alumnosIds or []
    if not alumnos_ids and data.empresaId:
        # Enrolar a todos los alumnos de la empresa cliente
        alumnos = await prisma.user.find_many(
            where={"empresaId": data.empresaId, "rol": "ALUMNO"}
        )
        alumnos_ids = [a.id for a in alumnos]

    for al_id in alumnos_ids:
        # 1. Crear Inscripción al curso si no existía previamente
        existing_insc = await prisma.inscripcion.find_unique(
            where={"alumnoId_cursoId": {"alumnoId": al_id, "cursoId": data.cursoId}}
        )
        if not existing_insc:
            await prisma.inscripcion.create(
                data={
                    "alumnoId": al_id,
                    "cursoId": data.cursoId,
                    "progreso": 0,
                    "estado": "NO_INICIADO"
                }
            )

        # 2. Asistencia de la sesión
        await prisma.asistenciasesion.create(
            data={
                "sesionId": sesion.id,
                "alumnoId": al_id,
                "presente": False
            }
        )

        # 3. Disparar email de notificación al alumno
        try:
            alumno_user = await prisma.user.find_unique(where={"id": al_id})
            if alumno_user:
                from services.email_service import email_service
                material_url = curso.materialDescargableUrl or ""
                meeting_info = sesion.meetLink or sesion.lugar or "Plataforma VMP"
                
                html_invitacion = f"""
                <h2>Invitación a Capacitación: {curso.nombre}</h2>
                <p>Hola <b>{alumno_user.nombre} {alumno_user.apellido}</b>,</p>
                <p>Has sido registrado para la siguiente sesión de capacitación obligatoria:</p>
                <ul>
                    <li><b>Curso:</b> {curso.nombre}</li>
                    <li><b>Fecha y Hora de inicio:</b> {sesion.fechaInicio.strftime("%d/%m/%Y %H:%M")} (Hora Local)</li>
                    <li><b>Lugar / Plataforma:</b> {sesion.plataforma or "Online"}</li>
                    <li><b>Enlace de Acceso o Dirección:</b> <a href="{meeting_info}">{meeting_info}</a></li>
                </ul>
                """
                if material_url:
                    html_invitacion += f'<p>Puedes descargar el material de lectura previo desde aquí: <a href="{material_url}">Descargar Material</a></p>'
                
                html_invitacion += "<p>Te recordamos presentarte puntualmente. ¡Buen aprendizaje!</p>"
                
                await email_service.send_email(
                    to_email=alumno_user.email,
                    subject=f"Capacitación Programada: {curso.nombre}",
                    html_content=html_invitacion
                )
        except Exception as e_err:
            print(f"Error al enviar invitación al alumno: {e_err}")

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
        empresaId=sesion.empresaId,
        empresaNombre=sesion.empresa.nombre if sesion.empresa else None,
        instructorId=sesion.instructorId,
        instructorNombre=f"{sesion.instructor.nombre} {sesion.instructor.apellido}" if sesion.instructor else None,
        totalAlumnos=len(alumnos_ids),
        alumnosPresentes=0,
    )


@router.patch("/{sesion_id}", response_model=SesionListItem)
async def actualizar_sesion(
    sesion_id: str,
    data: UpdateSesionRequest,
    current_user=Depends(get_current_user)
):
    """Actualizar datos/estado de una sesión de capacitación"""
    if current_user.rol not in ["SUPER_ADMIN", "INSTRUCTOR"]:
        raise HTTPException(status_code=403, detail="No tienes permisos para editar sesiones")

    sesion = await prisma.sesioncapacitacion.find_unique(
        where={"id": sesion_id},
        include={"curso": True}
    )
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")

    # Permisos del instructor (titular de la sesion o del curso -- igual que
    # registrar_asistencia, para no bloquear a quien SI puede tomar asistencia)
    if current_user.rol == "INSTRUCTOR":
        es_instructor_asignado = sesion.instructorId == current_user.id
        es_instructor_curso = sesion.curso and sesion.curso.instructorId == current_user.id
        if not (es_instructor_asignado or es_instructor_curso):
            raise HTTPException(status_code=403, detail="No eres el instructor a cargo de esta sesión")

    update_data = {k: v for k, v in data.model_dump().items() if v is not None and k != "alumnosIds"}
    
    # Manejar cambios de estado operativo
    if "estado" in update_data:
        nuevo_estado = update_data["estado"]
        # Al pasar a FINALIZADA, marcar los check-in definitivos
        if nuevo_estado == "FINALIZADA":
            # Obtener todas las asistencias registradas
            asistencias = await prisma.asistenciasesion.find_many(
                where={"sesionId": sesion_id}
            )
            for asis in asistencias:
                if asis.presente:
                    # Sincronizar y habilitar el progreso en el curso
                    # Si es in-company/presencial, el presente equivale a haber cubierto la parte sincrónica
                    insc = await prisma.inscripcion.find_unique(
                        where={"alumnoId_cursoId": {"alumnoId": asis.alumnoId, "cursoId": sesion.cursoId}}
                    )
                    if insc and insc.estado == "NO_INICIADO":
                        await prisma.inscripcion.update(
                            where={"id": insc.id},
                            data={"estado": "EN_PROGRESO", "inicioDate": datetime.now()}
                        )

    updated = await prisma.sesioncapacitacion.update(
        where={"id": sesion_id},
        data=update_data,
        include={"curso": True, "asistencias": True, "empresa": True, "instructor": True}
    )

    # Si se actualiza la lista de alumnosIds explícitamente
    if data.alumnosIds is not None:
        # Remover asistencias anteriores que no estén en la nueva lista
        await prisma.asistenciasesion.delete_many(
            where={
                "sesionId": sesion_id,
                "alumnoId": {"not_in": data.alumnosIds}
            }
        )
        # Añadir las nuevas asistencias
        for al_id in data.alumnosIds:
            exist = await prisma.asistenciasesion.find_first(
                where={"sesionId": sesion_id, "alumnoId": al_id}
            )
            if not exist:
                await prisma.asistenciasesion.create(
                    data={
                        "sesionId": sesion_id,
                        "alumnoId": al_id,
                        "presente": False
                    }
                )
                
        # Recargar para retornar cuenta exacta
        updated = await prisma.sesioncapacitacion.find_unique(
            where={"id": sesion_id},
            include={"curso": True, "asistencias": True, "empresa": True, "instructor": True}
        )

    return SesionListItem(
        id=updated.id,
        cursoId=updated.cursoId,
        titulo=updated.titulo,
        descripcion=updated.descripcion,
        fechaInicio=updated.fechaInicio,
        fechaFin=updated.fechaFin,
        lugar=updated.lugar,
        plataforma=updated.plataforma,
        meetLink=updated.meetLink,
        estado=updated.estado,
        createdAt=updated.createdAt,
        cursoNombre=updated.curso.nombre if updated.curso else None,
        cursoModalidad=updated.curso.modalidad if updated.curso else None,
        empresaId=updated.empresaId,
        empresaNombre=updated.empresa.nombre if updated.empresa else None,
        instructorId=updated.instructorId,
        instructorNombre=f"{updated.instructor.nombre} {updated.instructor.apellido}" if updated.instructor else None,
        totalAlumnos=len(updated.asistencias) if updated.asistencias else 0,
        alumnosPresentes=len([a for a in updated.asistencias if a.presente]) if updated.asistencias else 0,
    )


@router.delete("/{sesion_id}")
async def cancelar_sesion(sesion_id: str, current_user=Depends(get_current_user)):
    """Cancelar una sesión"""
    if current_user.rol not in ["SUPER_ADMIN", "INSTRUCTOR"]:
        raise HTTPException(status_code=403, detail="Sin permisos para cancelar sesiones")

    sesion = await prisma.sesioncapacitacion.find_unique(
        where={"id": sesion_id},
        include={"curso": True}
    )
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")

    if current_user.rol == "INSTRUCTOR":
        es_instructor_asignado = sesion.instructorId == current_user.id
        es_instructor_curso = sesion.curso and sesion.curso.instructorId == current_user.id
        if not (es_instructor_asignado or es_instructor_curso):
            raise HTTPException(status_code=403, detail="No eres el instructor titular")

    await prisma.sesioncapacitacion.update(
        where={"id": sesion_id},
        data={"estado": "CANCELADA"}
    )
    return {"success": True, "message": "Sesión cancelada con éxito"}


@router.post("/{sesion_id}/asistencia")
async def registrar_asistencia(
    sesion_id: str,
    data: RegistrarAsistenciaRequest,
    current_user=Depends(get_current_user)
):
    """
    Registrar asistencia masiva de una sesión.
    Accesible por SUPER_ADMIN e INSTRUCTOR titular.
    """
    sesion = await prisma.sesioncapacitacion.find_unique(
        where={"id": sesion_id},
        include={"curso": True}
    )
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")

    # Verificar acceso del instructor
    if current_user.rol == "INSTRUCTOR":
        if sesion.instructorId != current_user.id and (not sesion.curso or sesion.curso.instructorId != current_user.id):
            raise HTTPException(status_code=403, detail="No tienes acceso a esta sesión")
    elif current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Sin permisos")

    ahora = datetime.now()
    actualizados = 0

    for item in data.asistencias:
        alumno_id = item.get("alumnoId")
        presente = item.get("presente", False)
        notas = item.get("notas")

        # Buscar si ya existe registro de asistencia
        existente = await prisma.asistenciasesion.find_first(
            where={"sesionId": sesion_id, "alumnoId": alumno_id}
        )

        if existente:
            await prisma.asistenciasesion.update(
                where={"id": existente.id},
                data={
                    "presente": presente,
                    "checkIn": ahora if presente else None,
                    "notas": notas,
                }
            )
        else:
            await prisma.asistenciasesion.create(
                data={
                    "sesionId": sesion_id,
                    "alumnoId": alumno_id,
                    "presente": presente,
                    "checkIn": ahora if presente else None,
                    "notas": notas,
                }
            )
        actualizados += 1

    # Marcar sesión como EN_CURSO si estaba PROGRAMADA al registrar asistencias
    if sesion.estado == "PROGRAMADA":
        await prisma.sesioncapacitacion.update(
            where={"id": sesion_id},
            data={"estado": "EN_CURSO"}
        )

    return {"success": True, "actualizados": actualizados}


@router.post("/{sesion_id}/checkin")
async def self_checkin(sesion_id: str, current_user=Depends(get_current_user)):
    """Permite al alumno registrar su propia asistencia al ingresar a la clase en vivo"""
    if current_user.rol != "ALUMNO":
        raise HTTPException(status_code=400, detail="Solo alumnos pueden hacer check-in")

    # Verificar que la sesión existe y está EN_CURSO
    sesion = await prisma.sesioncapacitacion.find_unique(
        where={"id": sesion_id},
        include={"curso": True}
    )
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")

    if sesion.estado not in ["EN_CURSO", "PROGRAMADA"]:
        # Permitimos PROGRAMADA también para check-in anticipado (puntualidad)
        raise HTTPException(
            status_code=400,
            detail=f"No se puede registrar asistencia. Estado de la sesión: {sesion.estado}"
        )

    # Verificar que el alumno está inscripto en el curso
    inscripcion = await prisma.inscripcion.find_first(
        where={"alumnoId": current_user.id, "cursoId": sesion.cursoId}
    )
    if not inscripcion:
        raise HTTPException(status_code=403, detail="No estás inscripto en el curso de esta sesión")

    existente = await prisma.asistenciasesion.find_first(
        where={"sesionId": sesion_id, "alumnoId": current_user.id}
    )
    if existente:
        await prisma.asistenciasesion.update(
            where={"id": existente.id},
            data={
                "presente": True,
                "checkIn": datetime.now()
            }
        )
    else:
        await prisma.asistenciasesion.create(
            data={
                "sesionId": sesion_id,
                "alumnoId": current_user.id,
                "presente": True,
                "checkIn": datetime.now()
            }
        )
    return {"success": True, "message": "Asistencia registrada con éxito"}
