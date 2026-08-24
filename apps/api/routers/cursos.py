from fastapi import APIRouter, HTTPException, Depends
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
from core.security_utils import sanitize_rich_html

router = APIRouter()

@router.get("", response_model=List[CursoListItem])
async def listar_cursos(current_user=Depends(get_current_user)):
    """
    Listar todos los cursos activos
    Si el usuario es ALUMNO, filtra por su empresa
    Si el usuario es SUPER_ADMIN o INSTRUCTOR, ve todos los disponibles para su rol
    """
    
    where_clause = {}
    if current_user.rol != "SUPER_ADMIN":
        where_clause["activo"] = True
    
    # Si es alumno, filtrar por empresa
    if current_user.rol == "ALUMNO" and current_user.empresaId:
        where_clause["empresaId"] = current_user.empresaId
    
    cursos = await prisma.curso.find_many(
        where=where_clause,
        order={"nombre": "asc"}
    )
    
    return cursos


@router.post("", response_model=CursoListItem)
async def crear_curso(data: CreateCursoRequest, current_user=Depends(get_current_user)):
    """Crear un nuevo curso (Solo SUPER_ADMIN)"""

    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos para crear cursos")

    # Verificar si el código ya existe
    existing = await prisma.curso.find_unique(where={"codigo": data.codigo})
    if existing:
        raise HTTPException(status_code=400, detail="El código de curso ya existe")

    if data.empresaId:
        empresa = await prisma.company.find_unique(where={"id": data.empresaId})
        if not empresa:
            raise HTTPException(status_code=400, detail="La empresa seleccionada no existe")

    if data.plantillaEvaluacionId:
        plantilla = await prisma.plantillaevaluacion.find_unique(where={"id": data.plantillaEvaluacionId})
        if not plantilla:
            raise HTTPException(status_code=400, detail="La plantilla de evaluación seleccionada no existe")

    curso = await prisma.curso.create(
        data={
            "nombre": data.nombre,
            "descripcion": data.descripcion,
            "codigo": data.codigo,
            "duracionHoras": data.duracionHoras,
            "vigenciaMeses": data.vigenciaMeses,
            "empresaId": data.empresaId,
            "modalidad": data.modalidad,
            "maxParticipantes": data.maxParticipantes,
            "linkClase": data.linkClase,
            "tipoEvaluacion": data.tipoEvaluacion,
            "usaTelemetriaObd2": data.usaTelemetriaObd2,
            "plantillaEvaluacionId": data.plantillaEvaluacionId,
            "minimoAprobacion": data.minimoAprobacion,
            "activo": True
        }
    )

    return curso


@router.get("/{id}", response_model=CursoDetail)
async def obtener_curso(id: str, current_user=Depends(get_current_user)):
    """Obtener detalle de un curso específico con sus módulos"""
    
    curso = await prisma.curso.find_unique(
        where={"id": id},
        include={"modulos": True}
    )
    
    if not curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    
    # Verificar permisos
    if current_user.rol == "ALUMNO":
        if curso.empresaId and curso.empresaId != current_user.empresaId:
            raise HTTPException(
                status_code=403,
                detail="No tienes acceso a este curso"
            )
    
    # Ordenar módulos por orden
    curso.modulos.sort(key=lambda m: m.orden)
    
    return curso


@router.put("/{id}", response_model=CursoListItem)
async def actualizar_curso(id: str, data: UpdateCursoRequest, current_user=Depends(get_current_user)):
    """Actualizar un curso (Solo SUPER_ADMIN)"""
    
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos para editar cursos")

    # Verificar si existe
    existing = await prisma.curso.find_unique(where={"id": id})
    if not existing:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    if data.empresaId is not None and data.empresaId != "":
        empresa = await prisma.company.find_unique(where={"id": data.empresaId})
        if not empresa:
            raise HTTPException(status_code=400, detail="La empresa seleccionada no existe")

    if data.plantillaEvaluacionId is not None and data.plantillaEvaluacionId != "":
        plantilla = await prisma.plantillaevaluacion.find_unique(where={"id": data.plantillaEvaluacionId})
        if not plantilla:
            raise HTTPException(status_code=400, detail="La plantilla de evaluación seleccionada no existe")

    # Preparar datos para actualizar
    update_data = {}
    if data.nombre is not None: update_data["nombre"] = data.nombre
    if data.descripcion is not None: update_data["descripcion"] = data.descripcion
    if data.codigo is not None: update_data["codigo"] = data.codigo
    if data.duracionHoras is not None: update_data["duracionHoras"] = data.duracionHoras
    if data.vigenciaMeses is not None: update_data["vigenciaMeses"] = data.vigenciaMeses
    if data.activo is not None: update_data["activo"] = data.activo
    if data.empresaId is not None: update_data["empresaId"] = data.empresaId or None
    if data.modalidad is not None: update_data["modalidad"] = data.modalidad
    if data.maxParticipantes is not None: update_data["maxParticipantes"] = data.maxParticipantes
    if data.linkClase is not None: update_data["linkClase"] = data.linkClase
    if data.tipoEvaluacion is not None: update_data["tipoEvaluacion"] = data.tipoEvaluacion
    if data.usaTelemetriaObd2 is not None: update_data["usaTelemetriaObd2"] = data.usaTelemetriaObd2
    if data.plantillaEvaluacionId is not None: update_data["plantillaEvaluacionId"] = data.plantillaEvaluacionId or None
    if data.minimoAprobacion is not None: update_data["minimoAprobacion"] = data.minimoAprobacion

    curso = await prisma.curso.update(
        where={"id": id},
        data=update_data
    )
    
    return curso


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
            "preguntas": True,
            "tareasPracticas": True
        }
    )
    
    if not modulo:
        raise HTTPException(status_code=404, detail="Módulo no encontrado")
    
    if modulo.cursoId != cursoId:
        raise HTTPException(status_code=400, detail="Módulo no pertenece a este curso")
    
    # Para estudiantes, no devolver respuestas correctas en las preguntas
    if current_user.rol == "ALUMNO" and modulo.preguntas:
        # Las preguntas ya se retornan sin respuestaCorrecta gracias al schema PreguntaResponse
        pass
    
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
        "contenidoHtml": sanitize_rich_html(data.contenidoHtml) if data.contenidoHtml else None,
        "videoUrl": data.videoUrl
    }
    
    modulo = await prisma.modulo.create(data=modulo_data)
    
    # 2. Si tiene preguntas (Quiz)
    if data.tipo == "QUIZ" and data.preguntas:
        for p in data.preguntas:
            await prisma.pregunta.create(
                data={
                    "moduloId": modulo.id,
                    "pregunta": p.pregunta,
                    "opciones": p.opciones,
                    "respuestaCorrecta": p.respuestaCorrecta,
                    "explicacion": p.explicacion
                }
            )

    # 3. Si tiene tareas prácticas (Practica)
    if data.tipo == "PRACTICA" and data.tareasPracticas:
        for t in data.tareasPracticas:
            await prisma.tareapractica.create(
                data={
                    "moduloId": modulo.id,
                    "descripcion": t.descripcion,
                    "requiereFoto": t.requiereFoto
                }
            )

    # Re-obtener con relaciones
    return await prisma.modulo.find_unique(
        where={"id": modulo.id},
        include={"preguntas": True, "tareasPracticas": True}
    )


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
            "preguntas": True,
            "tareasPracticas": True
        }
    )

    if not modulo or modulo.cursoId != cursoId:
        raise HTTPException(status_code=404, detail="Módulo no encontrado")

    curso = await prisma.curso.find_unique(where={"id": cursoId})

    return {
        "id": modulo.id,
        "titulo": modulo.titulo,
        "orden": modulo.orden,
        "tipo": modulo.tipo,
        "contenidoHtml": modulo.contenidoHtml,
        "videoUrl": modulo.videoUrl,
        "liveClassUrl": modulo.liveClassUrl,
        "liveClassDate": modulo.liveClassDate,
        "liveClassPlatform": modulo.liveClassPlatform,
        "preguntas": modulo.preguntas,
        "tareasPracticas": modulo.tareasPracticas,
        "minimoAprobacion": curso.minimoAprobacion if curso else 70,
    }


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
    if data.contenidoHtml is not None: update_data["contenidoHtml"] = sanitize_rich_html(data.contenidoHtml)
    if data.videoUrl is not None: update_data["videoUrl"] = data.videoUrl
    if data.liveClassUrl is not None: update_data["liveClassUrl"] = data.liveClassUrl
    
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
                    "opciones": p.opciones,
                    "respuestaCorrecta": p.respuestaCorrecta,
                    "explicacion": p.explicacion
                }
            )

    # 3. Si se envían tareas prácticas (Sincronización completa para este módulo)
    if data.tareasPracticas is not None:
        # Borrar anteriores (las evidencias ya subidas se borran en cascada)
        await prisma.tareapractica.delete_many(where={"moduloId": moduloId})
        # Crear nuevas
        for t in data.tareasPracticas:
            await prisma.tareapractica.create(
                data={
                    "moduloId": moduloId,
                    "descripcion": t.descripcion,
                    "requiereFoto": t.requiereFoto
                }
            )

    return await prisma.modulo.find_unique(
        where={"id": moduloId},
        include={"preguntas": True, "tareasPracticas": True}
    )


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
