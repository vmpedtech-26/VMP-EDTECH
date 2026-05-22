from core.database import prisma
from typing import Optional

async def calcular_progreso_curso(alumno_id: str, curso_id: str) -> int:
    """
    Calcular progreso del alumno en un curso (0-100)
    
    Args:
        alumno_id: ID del alumno
        curso_id: ID del curso
        
    Returns:
        int: Porcentaje de progreso (0-100)
    """
    
    # Obtener todos los módulos del curso
    modulos = await prisma.modulo.find_many(
        where={"cursoId": curso_id},
        order={"orden": "asc"}
    )
    
    total_modulos = len(modulos)
    if total_modulos == 0:
        return 0
    
    # Calculate progress using modulosCompletados from Inscripcion
    inscripcion = await prisma.inscripcion.find_first(
        where={
            "alumnoId": alumno_id,
            "cursoId": curso_id
        }
    )
    
    if not inscripcion:
        return 0
        
    import json
    try:
        completados = json.loads(inscripcion.modulosCompletados) if inscripcion.modulosCompletados else []
    except:
        completados = []
        
    modulos_completados = len(completados)
    
    # Calcular porcentaje
    progreso = int((modulos_completados / total_modulos) * 100) if total_modulos > 0 else 0
    return progreso


async def verificar_curso_completado(alumno_id: str, curso_id: str) -> bool:
    """
    Verificar si el alumno ha completado todos los módulos del curso
    
    Args:
        alumno_id: ID del alumno
        curso_id: ID del curso
        
    Returns:
        bool: True si el curso está completado
    """
    progreso = await calcular_progreso_curso(alumno_id, curso_id)
    return progreso >= 100


async def obtener_proxima_actividad(alumno_id: str, curso_id: str) -> Optional[str]:
    """
    Obtener la próxima actividad pendiente del alumno en un curso
    
    Args:
        alumno_id: ID del alumno
        curso_id: ID del curso
        
    Returns:
        str: Descripción de la próxima actividad, o None si no hay
    """
    
    # Obtener módulos del curso en orden
    modulos = await prisma.modulo.find_many(
        where={"cursoId": curso_id},
        order={"orden": "asc"}
    )
    
    inscripcion = await prisma.inscripcion.find_first(
        where={
            "alumnoId": alumno_id,
            "cursoId": curso_id
        }
    )
    
    import json
    completados = []
    if inscripcion and inscripcion.modulosCompletados:
        try:
            completados = json.loads(inscripcion.modulosCompletados)
        except:
            pass

    for modulo in modulos:
        if modulo.id not in completados:
            return f"Pendiente: Módulo {modulo.orden} - {modulo.titulo}"
            
    return None
