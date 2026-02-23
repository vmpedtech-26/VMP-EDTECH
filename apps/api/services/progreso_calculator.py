from core.database import prisma
from typing import Optional

async def calcular_progreso_curso(alumno_id: str, curso_id: str) -> int:
    """
    Calcular progreso del alumno en un curso (0-100) basado en módulos completados persistentes.
    """
    
    # 1. Obtener todos los módulos del curso
    modulos = await prisma.modulo.find_many(
        where={"cursoId": curso_id}
    )
    
    total_modulos = len(modulos)
    if total_modulos == 0:
        return 0
    
    # 2. Obtener módulos completados persistentes
    completados = await prisma.modulocompletado.count(
        where={
            "alumnoId": alumno_id,
            "cursoId": curso_id
        }
    )
    
    # Calcular porcentaje
    progreso = int((completados / total_modulos) * 100)
    return min(progreso, 100)


async def verificar_curso_completado(alumno_id: str, curso_id: str) -> bool:
    """
    Verificar si el alumno ha completado todos los módulos del curso.
    """
    # 1. Módulos totales
    total = await prisma.modulo.count(where={"cursoId": curso_id})
    if total == 0: return False

    # 2. Módulos completados
    completados = await prisma.modulocompletado.count(
        where={
            "alumnoId": alumno_id,
            "cursoId": curso_id
        }
    )
    
    return completados >= total


async def obtener_proxima_actividad(alumno_id: str, curso_id: str) -> Optional[str]:
    """
    Obtener la próxima actividad pendiente del alumno en un curso.
    """
    
    # 1. Obtener todos los módulos en orden
    modulos = await prisma.modulo.find_many(
        where={"cursoId": curso_id},
        order={"orden": "asc"}
    )
    
    # 2. Obtener IDs de módulos ya completados
    completados_records = await prisma.modulocompletado.find_many(
        where={
            "alumnoId": alumno_id,
            "cursoId": curso_id
        }
    )
    completados_ids = {c.moduloId for c in completados_records}
    
    # 3. Encontrar el primero no completado
    for modulo in modulos:
        if modulo.id not in completados_ids:
            tipo_map = {
                "TEORIA": "Lección:",
                "QUIZ": "Evaluación:",
                "PRACTICA": "Práctica:"
            }
            prefix = tipo_map.get(modulo.tipo, "Módulo:")
            return f"{prefix} {modulo.titulo}"
    
    return None
