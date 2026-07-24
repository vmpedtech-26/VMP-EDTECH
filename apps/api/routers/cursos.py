from fastapi import APIRouter, HTTPException, Depends
import json
from typing import List
from schemas.cursos import (
    CursoListItem, 
    CursoDetail, 
    ModuloDetail, 
    ModuloSummary,
    ModuloDetailAdmin,
    CreateCursoRequest,
    UpdateCursoRequest,
    CreateModuloRequest,
    UpdateModuloRequest
)
from auth.dependencies import get_current_user
from core.database import prisma

router = APIRouter()

@router.get("", response_model=List[CursoListItem])
async def listar_cursos(current_user=Depends(get_current_user)):
    """
    Listar todos los cursos.
    - ALUMNO: filtra por su empresa y estado PUBLICADO
    - INSTRUCTOR: filtra solo por sus cursos asignados (instructorId) o cursos publicados
    - SUPER_ADMIN: ve todos
    """
    
    where_clause = {}
    if current_user.rol == "SUPER_ADMIN":
        pass  # Super admin ve todos los cursos (borrador, pendiente, publicado)
    elif current_user.rol == "INSTRUCTOR":
        # Instructores ven cursos publicados o los suyos propios (borrador/pendiente)
        where_clause["OR"] = [
            {"estado": "PUBLICADO"},
            {"instructorId": current_user.id}
        ]
    else: # ALUMNO
        where_clause["estado"] = "PUBLICADO"
        where_clause["activo"] = True
        if current_user.empresaId:
            where_clause["empresaId"] = current_user.empresaId
            
    cursos = await prisma.curso.find_many(
        where=where_clause,
        include={"instructor": True},
        order={"nombre": "asc"}
    )
    
    result = []
    for c in cursos:
        item = CursoListItem(
            id=c.id,
            nombre=c.nombre,
            descripcion=c.descripcion,
            codigo=c.codigo,
            duracionHoras=c.duracionHoras,
            vigenciaMeses=c.vigenciaMeses,
            empresaId=c.empresaId,
            alumnosEsperados=c.alumnosEsperados,
            modalidad=c.modalidad,
            instructorId=c.instructorId,
            instructorNombre=f"{c.instructor.nombre} {c.instructor.apellido}" if c.instructor else None,
            activo=c.activo,
            meetingLink=c.meetingLink,
            meetingPlatform=c.meetingPlatform,
            estado=c.estado,
            minimoAprobacion=c.minimoAprobacion,
            materialDescargableUrl=c.materialDescargableUrl,
        )
        result.append(item)
    return result


@router.post("", response_model=CursoListItem)
async def crear_curso(data: CreateCursoRequest, current_user=Depends(get_current_user)):
    """Crear un nuevo curso (SUPER_ADMIN o INSTRUCTOR)"""
    
    if current_user.rol not in ["SUPER_ADMIN", "INSTRUCTOR"]:
        raise HTTPException(status_code=403, detail="No tienes permisos para crear cursos")
    
    # Verificar si el código ya existe
    existing = await prisma.curso.find_unique(where={"codigo": data.codigo})
    if existing:
        raise HTTPException(status_code=400, detail="El código de curso ya existe")
    
    # Determinar instructor y estado
    instructor_id = data.instructorId
    if current_user.rol == "INSTRUCTOR":
        instructor_id = current_user.id
        estado_curso = "BORRADOR"
        activo_estado = False
    else:
        # Super admin puede forzar estado o por defecto borrador
        estado_curso = data.estado or "BORRADOR"
        activo_estado = True if estado_curso == "PUBLICADO" else False
        
    # Validar instructor si se provee
    if instructor_id:
        instructor = await prisma.user.find_unique(where={"id": instructor_id})
        if not instructor or instructor.rol != "INSTRUCTOR":
            raise HTTPException(status_code=400, detail="El instructor especificado no existe o no tiene el rol correcto")
    
    curso = await prisma.curso.create(
        data={
            "nombre": data.nombre,
            "descripcion": data.descripcion,
            "codigo": data.codigo,
            "duracionHoras": data.duracionHoras,
            "vigenciaMeses": data.vigenciaMeses,
            "empresaId": data.empresaId,
            "alumnosEsperados": data.alumnosEsperados,
            "modalidad": data.modalidad or "ONLINE",
            "instructorId": instructor_id,
            "meetingLink": data.meetingLink,
            "meetingPlatform": data.meetingPlatform,
            "estado": estado_curso,
            "minimoAprobacion": data.minimoAprobacion or 70,
            "materialDescargableUrl": data.materialDescargableUrl,
            "activo": activo_estado
        },
        include={"instructor": True}
    )
    
    # Notificar al Super Admin si el instructor lo crea
    if current_user.rol == "INSTRUCTOR":
        try:
            from services.email_service import email_service
            html_text = f"""
            <h3>Nuevo curso pendiente de revisión</h3>
            <p>El instructor <b>{current_user.nombre} {current_user.apellido}</b> ha creado un nuevo curso en estado Borrador.</p>
            <ul>
                <li><b>Nombre:</b> {curso.nombre}</li>
                <li><b>Código:</b> {curso.codigo}</li>
                <li><b>Duración:</b> {curso.duracionHoras} horas</li>
            </ul>
            <p>Por favor, ingresa al panel de administración para revisarlo y publicarlo.</p>
            """
            await email_service.send_email(
                to_email="administracion@vmp-edtech.com",
                subject=f"VMP LMS: Nuevo curso pendiente de revisión - {curso.nombre}",
                html_content=html_text
            )
        except Exception as email_err:
            print(f"Error al notificar al Super Admin sobre nuevo curso: {email_err}")
            
    return CursoListItem(
        id=curso.id,
        nombre=curso.nombre,
        descripcion=curso.descripcion,
        codigo=curso.codigo,
        duracionHoras=curso.duracionHoras,
        vigenciaMeses=curso.vigenciaMeses,
        empresaId=curso.empresaId,
        alumnosEsperados=curso.alumnosEsperados,
        modalidad=curso.modalidad,
        instructorId=curso.instructorId,
        instructorNombre=f"{curso.instructor.nombre} {curso.instructor.apellido}" if curso.instructor else None,
        activo=curso.activo,
        meetingLink=curso.meetingLink,
        meetingPlatform=curso.meetingPlatform,
        estado=curso.estado,
        minimoAprobacion=curso.minimoAprobacion,
        materialDescargableUrl=curso.materialDescargableUrl,
    )


@router.get("/{id}", response_model=CursoDetail)
async def obtener_curso(id: str, current_user=Depends(get_current_user)):
    """Obtener detalle de un curso específico con sus módulos"""
    
    curso = await prisma.curso.find_unique(
        where={"id": id},
        include={"modulos": True, "instructor": True}
    )
    
    if not curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    
    # Verificar permisos
    if current_user.rol == "ALUMNO":
        if curso.estado != "PUBLICADO":
            raise HTTPException(status_code=403, detail="Este curso aún no está disponible")
        if curso.empresaId and curso.empresaId != current_user.empresaId:
            raise HTTPException(status_code=403, detail="No tienes acceso a este curso")
    
    if current_user.rol == "INSTRUCTOR":
        # Instructor puede ver si es asignado o si ya está publicado
        if curso.instructorId != current_user.id and curso.estado != "PUBLICADO":
            raise HTTPException(status_code=403, detail="No tienes acceso a este curso")
            
    # Ordenar módulos por orden
    curso.modulos.sort(key=lambda m: m.orden)
    
    return CursoDetail(
        id=curso.id,
        nombre=curso.nombre,
        descripcion=curso.descripcion,
        codigo=curso.codigo,
        duracionHoras=curso.duracionHoras,
        vigenciaMeses=curso.vigenciaMeses,
        empresaId=curso.empresaId,
        alumnosEsperados=curso.alumnosEsperados,
        activo=curso.activo,
        modalidad=curso.modalidad,
        instructorId=curso.instructorId,
        instructorNombre=f"{curso.instructor.nombre} {curso.instructor.apellido}" if curso.instructor else None,
        meetingLink=curso.meetingLink,
        meetingPlatform=curso.meetingPlatform,
        estado=curso.estado,
        minimoAprobacion=curso.minimoAprobacion,
        materialDescargableUrl=curso.materialDescargableUrl,
        modulos=curso.modulos,
    )


@router.put("/{id}", response_model=CursoListItem)
async def actualizar_curso(id: str, data: UpdateCursoRequest, current_user=Depends(get_current_user)):
    """Actualizar un curso (SUPER_ADMIN o INSTRUCTOR asignado)"""
    
    if current_user.rol not in ["SUPER_ADMIN", "INSTRUCTOR"]:
        raise HTTPException(status_code=403, detail="No tienes permisos para editar cursos")
    
    # Verificar si existe
    existing = await prisma.curso.find_unique(where={"id": id})
    if not existing:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
        
    # Validaciones por rol
    if current_user.rol == "INSTRUCTOR":
        if existing.instructorId != current_user.id:
            raise HTTPException(status_code=403, detail="No eres el instructor asignado a este curso")
        if existing.estado == "PUBLICADO":
            raise HTTPException(status_code=400, detail="No puedes editar un curso que ya ha sido publicado")
            
    # Preparar datos para actualizar
    update_data = {}
    if data.nombre is not None: update_data["nombre"] = data.nombre
    if data.descripcion is not None: update_data["descripcion"] = data.descripcion
    if data.codigo is not None: update_data["codigo"] = data.codigo
    if data.duracionHoras is not None: update_data["duracionHoras"] = data.duracionHoras
    if data.vigenciaMeses is not None: update_data["vigenciaMeses"] = data.vigenciaMeses
    if data.empresaId is not None: update_data["empresaId"] = data.empresaId
    if data.alumnosEsperados is not None: update_data["alumnosEsperados"] = data.alumnosEsperados
    if data.activo is not None: update_data["activo"] = data.activo
    if data.meetingLink is not None: update_data["meetingLink"] = data.meetingLink
    if data.meetingPlatform is not None: update_data["meetingPlatform"] = data.meetingPlatform
    if data.estado is not None:
        if current_user.rol != "SUPER_ADMIN" and data.estado == "PUBLICADO":
            raise HTTPException(status_code=403, detail="Solo el Super Admin puede publicar cursos")
        update_data["estado"] = data.estado
        if data.estado == "PUBLICADO":
            update_data["activo"] = True
    if data.minimoAprobacion is not None: update_data["minimoAprobacion"] = data.minimoAprobacion
    if data.materialDescargableUrl is not None: update_data["materialDescargableUrl"] = data.materialDescargableUrl
    
    curso = await prisma.curso.update(
        where={"id": id},
        data=update_data,
        include={"instructor": True}
    )
    
    return CursoListItem(
        id=curso.id,
        nombre=curso.nombre,
        descripcion=curso.descripcion,
        codigo=curso.codigo,
        duracionHoras=curso.duracionHoras,
        vigenciaMeses=curso.vigenciaMeses,
        empresaId=curso.empresaId,
        alumnosEsperados=curso.alumnosEsperados,
        modalidad=curso.modalidad,
        instructorId=curso.instructorId,
        instructorNombre=f"{curso.instructor.nombre} {curso.instructor.apellido}" if curso.instructor else None,
        activo=curso.activo,
        meetingLink=curso.meetingLink,
        meetingPlatform=curso.meetingPlatform,
        estado=curso.estado,
        minimoAprobacion=curso.minimoAprobacion,
        materialDescargableUrl=curso.materialDescargableUrl,
    )


@router.post("/{id}/publicar", response_model=CursoListItem)
async def publicar_curso(id: str, current_user=Depends(get_current_user)):
    """Publicar un curso en borrador (Solo SUPER_ADMIN)"""
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos para publicar cursos")
        
    existing = await prisma.curso.find_unique(where={"id": id})
    if not existing:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
        
    curso = await prisma.curso.update(
        where={"id": id},
        data={"estado": "PUBLICADO", "activo": True},
        include={"instructor": True}
    )
    
    return CursoListItem(
        id=curso.id,
        nombre=curso.nombre,
        descripcion=curso.descripcion,
        codigo=curso.codigo,
        duracionHoras=curso.duracionHoras,
        vigenciaMeses=curso.vigenciaMeses,
        empresaId=curso.empresaId,
        alumnosEsperados=curso.alumnosEsperados,
        modalidad=curso.modalidad,
        instructorId=curso.instructorId,
        instructorNombre=f"{curso.instructor.nombre} {curso.instructor.apellido}" if curso.instructor else None,
        activo=curso.activo,
        meetingLink=curso.meetingLink,
        meetingPlatform=curso.meetingPlatform,
        estado=curso.estado,
        minimoAprobacion=curso.minimoAprobacion,
        materialDescargableUrl=curso.materialDescargableUrl,
    )


@router.delete("/{id}")
async def eliminar_curso(id: str, current_user=Depends(get_current_user)):
    """Eliminar un curso (Solo SUPER_ADMIN)"""
    
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar cursos")
    
    # En lugar de eliminar, lo desactivamos si tiene inscripciones
    # Pero para este MVP Beta vamos a permitir eliminar si no tiene inscripciones
    inscripciones_count = await prisma.inscripcion.count(where={"cursoId": id})
    
    if inscripciones_count > 0:
        # Desactivar en lugar de eliminar
        await prisma.curso.update(
            where={"id": id},
            data={"activo": False}
        )
        return {"message": "Curso desactivado porque tiene inscripciones activas"}
    
    await prisma.curso.delete(where={"id": id})
    return {"message": "Curso eliminado exitosamente"}


@router.get("/{id}/modulos", response_model=List[ModuloSummary])
async def listar_modulos(id: str, current_user=Depends(get_current_user)):
    """Listar módulos de un curso en orden secuencial"""
    
    # Verificar que el curso existe y el usuario tiene acceso
    curso = await prisma.curso.find_unique(where={"id": id})
    
    if not curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    
    if current_user.rol == "ALUMNO":
        if curso.empresaId and curso.empresaId != current_user.empresaId:
            raise HTTPException(status_code=403, detail="No tienes acceso a este curso")
    
    # Obtener módulos
    modulos = await prisma.modulo.find_many(
        where={"cursoId": id},
        order={"orden": "asc"}
    )
    
    return modulos


@router.get("/{cursoId}/modulos/{moduloId}", response_model=ModuloDetail)
async def obtener_modulo(
    cursoId: str,
    moduloId: str,
    current_user=Depends(get_current_user)
):
    """
    Obtener detalle de un módulo específico
    Incluye preguntas si es QUIZ, tareas si es PRACTICA
    """
    
    # Verificar acceso al curso
    curso = await prisma.curso.find_unique(where={"id": cursoId})
    if not curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    
    if current_user.rol == "ALUMNO":
        if curso.empresaId and curso.empresaId != current_user.empresaId:
            raise HTTPException(status_code=403, detail="No tienes acceso a este curso")
    
    # Obtener módulo con relaciones según tipo
    modulo = await prisma.modulo.find_unique(
        where={"id": moduloId},
        include={
            "preguntas": True
        }
    )
    
    if not modulo:
        raise HTTPException(status_code=404, detail="Módulo no encontrado")
    
    if modulo.cursoId != cursoId:
        raise HTTPException(status_code=400, detail="Módulo no pertenece a este curso")
    
    # Para estudiantes, no devolver respuestas correctas en las preguntas
    if modulo.preguntas:
        for p in modulo.preguntas:
            if isinstance(p.opciones, str):
                try:
                    p.opciones = json.loads(p.opciones)
                except:
                    p.opciones = []
    
    return modulo


@router.post("/{cursoId}/modulos", response_model=ModuloDetailAdmin)
async def crear_modulo(
    cursoId: str, 
    data: CreateModuloRequest, 
    current_user=Depends(get_current_user)
):
    """Crear un módulo dinámicamente (Solo SUPER_ADMIN)"""
    
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # 1. Crear el módulo base
    modulo_data = {
        "titulo": data.titulo,
        "orden": data.orden,
        "tipo": data.tipo,
        "cursoId": cursoId,
        "contenidoHtml": data.contenidoHtml,
        "videoUrl": data.videoUrl,
        "liveClassUrl": data.liveClassUrl,
        "liveClassPlatform": data.liveClassPlatform
    }
    
    modulo = await prisma.modulo.create(data=modulo_data)
    
    # 2. Si tiene preguntas (Quiz)
    if data.tipo == "QUIZ" and data.preguntas:
        for p in data.preguntas:
            await prisma.pregunta.create(
                data={
                    "moduloId": modulo.id,
                    "pregunta": p.pregunta,
                    "opciones": json.dumps(p.opciones),
                    "respuestaCorrecta": p.respuestaCorrecta,
                    "explicacion": p.explicacion
                }
            )
            
    # Re-obtener con relaciones
    modulo = await prisma.modulo.find_unique(
        where={"id": modulo.id},
        include={"preguntas": True}
    )
    
    if modulo and modulo.preguntas:
        for p in modulo.preguntas:
            if isinstance(p.opciones, str):
                p.opciones = json.loads(p.opciones)
                
    return modulo


@router.get("/{cursoId}/modulos/{moduloId}/admin", response_model=ModuloDetailAdmin)
async def admin_obtener_modulo(
    cursoId: str,
    moduloId: str,
    current_user=Depends(get_current_user)
):
    """
    Obtener detalle de un módulo con respuestas (Solo ADMIN)
    """
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
        
    modulo = await prisma.modulo.find_unique(
        where={"id": moduloId},
        include={
            "preguntas": True
        }
    )
    
    if not modulo or modulo.cursoId != cursoId:
        raise HTTPException(status_code=404, detail="Módulo no encontrado")
        
    if modulo and modulo.preguntas:
        for p in modulo.preguntas:
            if isinstance(p.opciones, str):
                p.opciones = json.loads(p.opciones)
                
    return modulo


@router.put("/{cursoId}/modulos/{moduloId}", response_model=ModuloDetailAdmin)
async def actualizar_modulo(
    cursoId: str,
    moduloId: str,
    data: UpdateModuloRequest,
    current_user=Depends(get_current_user)
):
    """Actualizar contenido de un módulo (Solo SUPER_ADMIN)"""
    
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
        
    # Verificar que existe
    existing = await prisma.modulo.find_unique(where={"id": moduloId})
    if not existing or existing.cursoId != cursoId:
        raise HTTPException(status_code=404, detail="Módulo no encontrado")
        
    # 1. Actualizar campos base
    update_data = {}
    if data.titulo is not None: update_data["titulo"] = data.titulo
    if data.orden is not None: update_data["orden"] = data.orden
    if data.contenidoHtml is not None: update_data["contenidoHtml"] = data.contenidoHtml
    if data.videoUrl is not None: update_data["videoUrl"] = data.videoUrl
    
    # Soporte seguro para liveClassUrl y liveClassPlatform (permitiendo valores nulos/null)
    if "liveClassUrl" in data.model_fields_set:
        update_data["liveClassUrl"] = data.liveClassUrl
    if "liveClassPlatform" in data.model_fields_set:
        update_data["liveClassPlatform"] = data.liveClassPlatform
        
    await prisma.modulo.update(where={"id": moduloId}, data=update_data)
    
    # 2. Si se envían preguntas (Sincronización completa para este módulo)
    if data.preguntas is not None:
        # Borrar anteriores
        await prisma.pregunta.delete_many(where={"moduloId": moduloId})
        # Crear nuevas
        for p in data.preguntas:
            await prisma.pregunta.create(
                data={
                    "moduloId": moduloId,
                    "pregunta": p.pregunta,
                    "opciones": json.dumps(p.opciones),
                    "respuestaCorrecta": p.respuestaCorrecta,
                    "explicacion": p.explicacion
                }
            )
            
    modulo = await prisma.modulo.find_unique(
        where={"id": moduloId},
        include={"preguntas": True}
    )
    
    if modulo and modulo.preguntas:
        for p in modulo.preguntas:
            if isinstance(p.opciones, str):
                p.opciones = json.loads(p.opciones)
                
    return modulo


@router.delete("/{cursoId}/modulos/{moduloId}")
async def eliminar_modulo(
    cursoId: str, 
    moduloId: str, 
    current_user=Depends(get_current_user)
):
    """Eliminar módulo y sus cascadas (Solo SUPER_ADMIN)"""
    
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
        
    # Verificar que pertenece al curso
    modulo = await prisma.modulo.find_unique(where={"id": moduloId})
    if not modulo or modulo.cursoId != cursoId:
        raise HTTPException(status_code=404, detail="Módulo no encontrado")
        
    await prisma.modulo.delete(where={"id": moduloId})
    return {"message": "Módulo eliminado exitosamente"}
