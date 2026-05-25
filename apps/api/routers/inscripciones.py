from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
from schemas.inscripciones import (
    MisCursosResponse,
    MisCursosItem,
    InscripcionDetailResponse,
    InscribirseRequest,
    CompletarModuloRequest,
    CompletarModuloResponse
)
from auth.dependencies import get_current_user
from core.database import prisma
from services.progreso_calculator import (
    calcular_progreso_curso,
    verificar_curso_completado,
    obtener_proxima_actividad
)
from services.credential_service import generate_credential_for_student

router = APIRouter()

@router.get("/mis-cursos", response_model=MisCursosResponse)
async def obtener_mis_cursos(current_user=Depends(get_current_user)):
    """Obtener cursos del usuario actual con estado de progreso"""
    
    # Obtener inscripciones del usuario
    inscripciones = await prisma.inscripcion.find_many(
        where={"alumnoId": current_user.id},
        include={"curso": True}
    )
    
    cursos_list = []
    horas_acumuladas = 0
    cursos_activos = 0
    cursos_completados = 0
    
    for inscripcion in inscripciones:
        curso = inscripcion.curso
        
        # Calcular progreso actual
        progreso = await calcular_progreso_curso(current_user.id, curso.id)
        
        # Obtener próxima actividad
        proxima_actividad = await obtener_proxima_actividad(current_user.id, curso.id)
        
        # Actualizar inscripción si el progreso cambió
        if inscripcion.progreso != progreso:
            await prisma.inscripcion.update(
                where={"id": inscripcion.id},
                data={"progreso": progreso}
            )
        
        cursos_list.append(MisCursosItem(
            id=curso.id,
            nombre=curso.nombre,
            descripcion=curso.descripcion,
            codigo=curso.codigo,
            duracionHoras=curso.duracionHoras,
            progreso=progreso,
            estado=inscripcion.estado,
            proximaActividad=proxima_actividad
        ))
        
        # Calcular stats
        if inscripcion.estado in ["COMPLETADO", "APROBADO"]:
            cursos_completados += 1
            horas_acumuladas += curso.duracionHoras
        elif inscripcion.estado == "EN_PROGRESO":
            cursos_activos += 1
    
    return MisCursosResponse(
        cursos=cursos_list,
        stats={
            "cursosActivos": cursos_activos,
            "cursosCompletados": cursos_completados,
            "credencialesObtenidas": cursos_completados,
            "horasAcumuladas": horas_acumuladas
        }
    )


@router.post("/{cursoId}/inscribir", response_model=InscripcionDetailResponse)
async def inscribirse_en_curso(cursoId: str, current_user=Depends(get_current_user)):
    """Inscribirse en un curso"""
    
    # Verificar que el curso existe
    curso = await prisma.curso.find_unique(where={"id": cursoId})
    if not curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    
    # Verificar permisos de empresa
    if current_user.rol == "ALUMNO":
        if curso.empresaId and curso.empresaId != current_user.empresaId:
            raise HTTPException(
                status_code=403,
                detail="Este curso no está disponible para tu empresa"
            )
    
    # Verificar si ya está inscrito
    existing = await prisma.inscripcion.find_first(
        where={
            "alumnoId": current_user.id,
            "cursoId": cursoId
        }
    )
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Ya estás inscrito en este curso"
        )
    
    # Crear inscripción
    inscripcion = await prisma.inscripcion.create(
        data={
            "alumnoId": current_user.id,
            "cursoId": cursoId,
            "progreso": 0,
            "estado": "NO_INICIADO"
        }
    )
    
    insc_dict = inscripcion.model_dump()
    insc_dict["modulosCompletados"] = []
    return insc_dict


@router.get("/{cursoId}", response_model=InscripcionDetailResponse)
async def obtener_inscripcion(cursoId: str, current_user=Depends(get_current_user)):
    """Obtener estado de inscripción específica"""
    
    inscripcion = await prisma.inscripcion.find_first(
        where={
            "alumnoId": current_user.id,
            "cursoId": cursoId
        }
    )
    
    if not inscripcion:
        raise HTTPException(
            status_code=404,
            detail="No estás inscrito en este curso"
        )
    
    insc_dict = inscripcion.model_dump()
    import json
    try:
        insc_dict["modulosCompletados"] = json.loads(inscripcion.modulosCompletados) if inscripcion.modulosCompletados else []
    except:
        insc_dict["modulosCompletados"] = []
        
    return insc_dict


@router.post("/{cursoId}/modulos/{moduloId}/completar", response_model=CompletarModuloResponse)
async def completar_modulo(
    cursoId: str,
    moduloId: str,
    data: CompletarModuloRequest,
    current_user=Depends(get_current_user)
):
    """Marcar módulo como completado y actualizar progreso"""
    
    # Verificar inscripción
    inscripcion = await prisma.inscripcion.find_first(
        where={
            "alumnoId": current_user.id,
            "cursoId": cursoId
        }
    )
    
    if not inscripcion:
        raise HTTPException(status_code=404, detail="No estás inscrito en este curso")
    
    # Verificar módulo
    modulo = await prisma.modulo.find_unique(where={"id": moduloId})
    if not modulo or modulo.cursoId != cursoId:
        raise HTTPException(status_code=404, detail="Módulo no encontrado")
    
    # Actualizar estado a EN_PROGRESO si es la primera vez
    import json
    
    update_data = {}
    if inscripcion.estado == "NO_INICIADO":
        update_data["estado"] = "EN_PROGRESO"
        update_data["inicioDate"] = datetime.now()
        
    # Añadir a modulosCompletados
    completados = []
    try:
        completados = json.loads(inscripcion.modulosCompletados) if inscripcion.modulosCompletados else []
    except:
        pass
        
    if moduloId not in completados:
        completados.append(moduloId)
        update_data["modulosCompletados"] = json.dumps(completados)
        
    # Guardar actualización parcial (estado y modulos)
    if update_data:
        await prisma.inscripcion.update(
            where={"id": inscripcion.id},
            data=update_data
        )
    
    # Calcular nuevo progreso (ya leerá de la DB actualizada)
    nuevo_progreso = await calcular_progreso_curso(current_user.id, cursoId)
    
    # Actualizar progreso
    await prisma.inscripcion.update(
        where={"id": inscripcion.id},
        data={"progreso": nuevo_progreso}
    )
    
    # Verificar si el curso está completado
    curso_completado = await verificar_curso_completado(current_user.id, cursoId)
    
    credencial_generada = False
    credencial_numero = None
    
    if curso_completado:
        # Actualizar estado a COMPLETADO
        await prisma.inscripcion.update(
            where={"id": inscripcion.id},
            data={
                "estado": "COMPLETADO",
                "finDate": datetime.now()
            }
        )
        
        # Generar Credencial automáticamente usando el servicio centralizado
        try:
            result = await generate_credential_for_student(
                alumno_id=current_user.id,
                curso_id=cursoId,
            )
            if not result.get("already_existed"):
                credencial_generada = True
                credencial_numero = result["credencial"].numero
        except Exception as e:
            print(f"[CREDENCIAL AUTO-GEN] Error al completar módulo: {e}")
    
    return CompletarModuloResponse(
        success=True,
        nuevoProgreso=nuevo_progreso,
        cursoCompletado=curso_completado,
        credencialGenerada=credencial_generada,
        credencialNumero=credencial_numero,
        message="Módulo completado exitosamente" if not curso_completado else "¡Felicitaciones! Has completado el curso"
    )


# ============= ENDPOINTS ADMINISTRATIVOS ADICIONALES =============
from pydantic import BaseModel
from typing import Optional

class InscripcionCreateRequest(BaseModel):
    alumnoId: str
    cursoId: str


class UpdateProgresoRequest(BaseModel):
    progreso: int
    estado: Optional[str] = None


@router.post("", response_model=dict)
async def crear_inscripcion_manual(
    data: InscripcionCreateRequest,
    current_user=Depends(get_current_user)
):
    """Creación manual de inscripción por parte de un administrador"""
    # Verificar si ya existe
    existing = await prisma.inscripcion.find_first(
        where={
            "alumnoId": data.alumnoId,
            "cursoId": data.cursoId
        }
    )
    if existing:
        return existing.model_dump()
        
    inscripcion = await prisma.inscripcion.create(
        data={
            "alumnoId": data.alumnoId,
            "cursoId": data.cursoId,
            "progreso": 0,
            "estado": "NO_INICIADO"
        }
    )
    return inscripcion.model_dump()


@router.get("/alumno/{alumno_id}", response_model=List[dict])
async def obtener_inscripciones_por_alumno(
    alumno_id: str,
    current_user=Depends(get_current_user)
):
    """Obtener todas las inscripciones asociadas a un alumno"""
    inscripciones = await prisma.inscripcion.find_many(
        where={"alumnoId": alumno_id}
    )
    return [i.model_dump() for i in inscripciones]


@router.patch("/{id}/progreso", response_model=dict)
async def actualizar_progreso_inscripcion(
    id: str,
    data: UpdateProgresoRequest,
    current_user=Depends(get_current_user)
):
    """Actualización manual/administrativa del progreso y estado de una inscripción"""
    estado = data.estado
    if data.progreso >= 100 and not estado:
        estado = "COMPLETADO"
    elif data.progreso > 0 and not estado:
        estado = "EN_PROGRESO"
        
    update_data = {
        "progreso": data.progreso
    }
    if estado:
        update_data["estado"] = estado
        if estado == "COMPLETADO":
            update_data["finDate"] = datetime.now()
            
    inscripcion = await prisma.inscripcion.update(
        where={"id": id},
        data=update_data
    )
    
    # Si pasa a COMPLETADO, generar credencial si no existe
    if estado == "COMPLETADO":
        try:
            await generate_credential_for_student(
                alumno_id=inscripcion.alumnoId,
                curso_id=inscripcion.cursoId
            )
        except Exception as e:
            print(f"[CREDENCIAL MANUAL] Error al autogenerar al actualizar progreso: {e}")
            
    return inscripcion.model_dump()

