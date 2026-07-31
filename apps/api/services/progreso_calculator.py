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
    
    modulos_completados = 0
    
    for modulo in modulos:
        # Verificar según tipo de módulo
        if modulo.tipo == "TEORIA":
            # Para teoría, verificamos si hay un registro en tareas completadas
            # o usamos otra lógica (por ahora simplificado)
            # TODO: Implementar tracking de módulos completados
            pass
            
        elif modulo.tipo == "QUIZ":
            # Verificar si existe examen aprobado para este módulo
            examen = await prisma.examen.find_first(
                where={
                    "alumnoId": alumno_id,
                    "cursoId": curso_id,
                    # Falta moduloId en el schema actual de Examen
                    # Por ahora verificamos que haya aprobado
                    "aprobado": True
                }
            )
            if examen:
                modulos_completados += 1
                
        elif modulo.tipo == "PRACTICA":
            # Verificar que todas las tareas prácticas tengan evidencias
            tareas = await prisma.tareapractica.find_many(
                where={"moduloId": modulo.id}
            )
            
            todas_completadas = True
            for tarea in tareas:
                if tarea.requiereFoto:
                    # Verificar que exista evidencia
                    evidencia = await prisma.evidencia.find_first(
                        where={
                            "tareaId": tarea.id,
                            "alumnoId": alumno_id,
                            "estado": "APROBADA"
                        }
                    )
                    if not evidencia:
                        todas_completadas = False
                        break
            
            if todas_completadas and len(tareas) > 0:
                modulos_completados += 1
    
    # Calcular porcentaje
    progreso = int((modulos_completados / total_modulos) * 100)
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
    
    for modulo in modulos:
        # Verificar si este módulo está completado
        # (usando la misma lógica que calcular_progreso_curso)
        # Si no está completado, retornarlo como próxima actividad
        
        if modulo.tipo == "TEORIA":
            # Simplificado: retornar como próxima si es el primero no completado
            return f"Módulo Teórico: {modulo.titulo}"
            
        elif modulo.tipo == "QUIZ":
            examen = await prisma.examen.find_first(
                where={
                    "alumnoId": alumno_id,
                    "cursoId": curso_id,
                    "aprobado": True
                }
            )
            if not examen:
                return f"Quiz: {modulo.titulo}"
                
        elif modulo.tipo == "PRACTICA":
            tareas = await prisma.tareapractica.find_many(
                where={"moduloId": modulo.id}
            )
            
            for tarea in tareas:
                if tarea.requiereFoto:
                    evidencia = await prisma.evidencia.find_first(
                        where={
                            "tareaId": tarea.id,
                            "alumnoId": alumno_id,
                            "estado": "APROBADA"
                        }
                    )
                    if not evidencia:
                        return f"Práctica (Pendiente Aprobación): {modulo.titulo}"
    
    return None
