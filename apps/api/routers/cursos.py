from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from schemas.cursos import (
    CursoListItem, 
    CursoDetail, 
    ModuloDetail, 
    ModuloSummary,
    ModuloDetailAdmin,
    CreateCursoRequest,
    UpdateCursoRequest,
    CreateModuloRequest,
    UpdateModuloRequest,
    AsistenciaClaseResponse
)
from auth.dependencies import get_current_user
from core.database import prisma
from constants.templates import EVALUATION_TEMPLATES

router = APIRouter()

@router.get("/verificar-codigo")
async def verificar_codigo(codigo: str, current_user=Depends(get_current_user)):
    """Verificar si un código de curso está disponible"""
    
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    existing = await prisma.curso.find_unique(where={"codigo": codigo})
    return {"disponible": existing is None}


@router.get("/templates")
async def listar_plantillas(current_user=Depends(get_current_user)):
    """Listar plantillas de evaluación disponibles (Solo SUPER_ADMIN)"""
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    return [
        {"id": k, "titulo": v["titulo"], "preguntas": len(v["preguntas"])}
        for k, v in EVALUATION_TEMPLATES.items()
    ]


@router.get("/", response_model=List[CursoListItem])
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


@router.post("/", response_model=CursoListItem)
async def crear_curso(data: CreateCursoRequest, current_user=Depends(get_current_user)):
    """Crear un nuevo curso (Solo SUPER_ADMIN)"""
    
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos para crear cursos")
    
    # Verificar si el código ya existe
    existing = await prisma.curso.find_unique(where={"codigo": data.codigo})
    if existing:
        raise HTTPException(status_code=400, detail="El código de curso ya existe")
    
    curso = await prisma.curso.create(
        data={
            "nombre": data.nombre,
            "descripcion": data.descripcion,
            "codigo": data.codigo,
            "duracionHoras": data.duracionHoras,
            "vigenciaMeses": data.vigenciaMeses,
            "empresaId": data.empresaId,
            "activo": True
        }
    )

    modulo_orden = 1

    # 1. Crear Clase en Vivo si se proporcionó URL
    if data.liveClassUrl:
        platform_name = "Clase en Vivo (Meet)" if data.liveClassPlatform == "google_meet" else "Clase en Vivo (Teams)"
        await prisma.modulo.create(
            data={
                "cursoId": curso.id,
                "titulo": platform_name,
                "orden": modulo_orden,
                "tipo": "TEORIA",
                "liveClassUrl": data.liveClassUrl,
                "liveClassPlatform": data.liveClassPlatform,
                "contenidoHtml": f"<p>Haga clic en el siguiente enlace para unirse a la clase en vivo:</p><p><a href='{data.liveClassUrl}' target='_blank' class='text-primary font-bold'>{data.liveClassUrl}</a></p>"
            }
        )
        modulo_orden += 1

    # 2. Crear Evaluación si se seleccionó una plantilla
    if data.evaluationTemplateId and data.evaluationTemplateId in EVALUATION_TEMPLATES:
        template = EVALUATION_TEMPLATES[data.evaluationTemplateId]
        
        modulo_quiz = await prisma.modulo.create(
            data={
                "cursoId": curso.id,
                "titulo": template["titulo"],
                "orden": modulo_orden,
                "tipo": "QUIZ"
            }
        )
        
        for p in template["preguntas"]:
            await prisma.pregunta.create(
                data={
                    "moduloId": modulo_quiz.id,
                    "pregunta": p["pregunta"],
                    "opciones": p["opciones"],
                    "respuestaCorrecta": p["respuestaCorrecta"],
                    "explicacion": p.get("explicacion")
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
    
    # Preparar datos para actualizar
    update_data = {}
    if data.nombre is not None: update_data["nombre"] = data.nombre
    if data.descripcion is not None: update_data["descripcion"] = data.descripcion
    if data.codigo is not None: update_data["codigo"] = data.codigo
    if data.duracionHoras is not None: update_data["duracionHoras"] = data.duracionHoras
    if data.vigenciaMeses is not None: update_data["vigenciaMeses"] = data.vigenciaMeses
    if data.activo is not None: update_data["activo"] = data.activo
    
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


@router.get("/{id}/asistencia")
async def obtener_asistencia_curso(id: str, current_user=Depends(get_current_user)):
    """Obtener reporte de asistencia para un curso (Instructor/Admin)"""
    
    if current_user.rol not in ["INSTRUCTOR", "SUPER_ADMIN"]:
        raise HTTPException(status_code=403, detail="No tienes permisos")
        
    # 1. Obtener módulos con clase en vivo
    modulos_vivos = await prisma.modulo.find_many(
        where={
            "cursoId": id,
            "liveClassUrl": {"not": None}
        },
        order={"orden": "asc"}
    )
    
    # 2. Obtener inscritos
    inscritos = await prisma.inscripcion.find_many(
        where={"cursoId": id},
        include={"alumno": True}
    )
    
    # 3. Obtener todas las asistencias del curso
    asistencias = await prisma.asistenciaclase.find_many(
        where={"cursoId": id}
    )
    
    return {
        "modulos": modulos_vivos,
        "alumnos": [i.alumno for i in inscritos],
        "asistencias": asistencias
    }


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
        "contenidoHtml": data.contenidoHtml,
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
            
    # 3. Si tiene tareas (Práctica)
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
    if data.liveClassUrl is not None: update_data["liveClassUrl"] = data.liveClassUrl
    if data.liveClassPlatform is not None: update_data["liveClassPlatform"] = data.liveClassPlatform
    if data.liveClassDate is not None: update_data["liveClassDate"] = data.liveClassDate
    
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
            
    # 3. Si se envían tareas
    if data.tareasPracticas is not None:
        await prisma.tareapractica.delete_many(where={"moduloId": moduloId})
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


@router.post("/{cursoId}/modulos/{moduloId}/asistir", response_model=AsistenciaClaseResponse)
async def registrar_asistencia(
    cursoId: str,
    moduloId: str,
    current_user=Depends(get_current_user)
):
    """Registrar asistencia a una clase en vivo y marcar módulo como completado"""
    
    # 1. Verificar inscripción
    inscripcion = await prisma.inscripcion.find_first(
        where={"alumnoId": current_user.id, "cursoId": cursoId}
    )
    
    if not inscripcion:
        raise HTTPException(status_code=403, detail="No estás inscrito en este curso")
        
    # 2. Registrar asistencia
    try:
        asistencia = await prisma.asistenciaclase.create(
            data={
                "alumnoId": current_user.id,
                "moduloId": moduloId,
                "cursoId": cursoId
            }
        )
    except Exception:
        # Probablemente ya registró asistencia (unique constraint)
        asistencia = await prisma.asistenciaclase.find_unique(
            where={
                "alumnoId_moduloId": {
                    "alumnoId": current_user.id,
                    "moduloId": moduloId
                }
            }
        )
        if not asistencia:
            raise HTTPException(status_code=500, detail="Error al registrar asistencia")

    # 3. Marcar módulo como completado automáticamente
    await prisma.modulocompletado.upsert(
        where={
            "alumnoId_moduloId": {
                "alumnoId": current_user.id,
                "moduloId": moduloId
            }
        },
        data={
            "create": {
                "alumnoId": current_user.id,
                "moduloId": moduloId,
                "cursoId": cursoId
            },
            "update": {}
        }
    )
    
    return asistencia
