import json
from core.database import prisma
from typing import Optional


async def _teoria_completados_guardados(alumno_id: str, curso_id: str) -> set[str]:
    """IDs de módulos de teoría que el alumno marcó como leídos (Inscripcion.modulosCompletados)."""
    inscripcion = await prisma.inscripcion.find_first(
        where={"alumnoId": alumno_id, "cursoId": curso_id}
    )
    if not inscripcion or not inscripcion.modulosCompletados:
        return set()
    try:
        return set(json.loads(inscripcion.modulosCompletados))
    except (json.JSONDecodeError, TypeError):
        return set()


async def calcular_modulos_completados(alumno_id: str, curso_id: str, modulos=None) -> list[str]:
    """
    Determina, a partir de las fuentes reales de cada tipo de módulo, cuáles
    completó de verdad el alumno:
      - TEORIA: el alumno lo marcó como leído (no hay nada que "aprobar").
      - QUIZ: existe un Examen aprobado para ese módulo específico.
      - PRACTICA: todas sus tareas que requieren foto tienen evidencia aprobada.

    No confía en nada que mande el cliente al completar un módulo -- para
    QUIZ/PRACTICA siempre se vuelve a verificar contra la base.

    `modulos`: lista ya cargada (mismo orden por `orden`), opcional -- para
    que un caller que ya la tiene (p.ej. calcular_progreso_y_proxima_actividad)
    no dispare la misma query dos veces.
    """
    if modulos is None:
        modulos = await prisma.modulo.find_many(
            where={"cursoId": curso_id},
            order={"orden": "asc"}
        )

    teoria_vistos = await _teoria_completados_guardados(alumno_id, curso_id)

    completados = []
    for modulo in modulos:
        if modulo.tipo == "TEORIA":
            if modulo.id in teoria_vistos:
                completados.append(modulo.id)

        elif modulo.tipo == "QUIZ":
            examen = await prisma.examen.find_first(
                where={
                    "alumnoId": alumno_id,
                    "moduloId": modulo.id,
                    "aprobado": True
                }
            )
            if examen:
                completados.append(modulo.id)

        elif modulo.tipo == "PRACTICA":
            tareas = await prisma.tareapractica.find_many(
                where={"moduloId": modulo.id}
            )

            todas_completadas = True
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
                        todas_completadas = False
                        break

            if todas_completadas and len(tareas) > 0:
                completados.append(modulo.id)

    return completados


async def marcar_teoria_vista(alumno_id: str, curso_id: str, modulo_id: str) -> None:
    """Registra que el alumno terminó de leer un módulo de teoría."""
    inscripcion = await prisma.inscripcion.find_first(
        where={"alumnoId": alumno_id, "cursoId": curso_id}
    )
    if not inscripcion:
        return

    vistos = await _teoria_completados_guardados(alumno_id, curso_id)
    if modulo_id in vistos:
        return
    vistos.add(modulo_id)

    await prisma.inscripcion.update(
        where={"id": inscripcion.id},
        data={"modulosCompletados": json.dumps(list(vistos))}
    )


async def calcular_progreso_curso(alumno_id: str, curso_id: str) -> int:
    """
    Calcular progreso del alumno en un curso (0-100)

    Args:
        alumno_id: ID del alumno
        curso_id: ID del curso

    Returns:
        int: Porcentaje de progreso (0-100)
    """
    total_modulos = await prisma.modulo.count(where={"cursoId": curso_id})
    if total_modulos == 0:
        return 0

    completados = await calcular_modulos_completados(alumno_id, curso_id)
    return int((len(completados) / total_modulos) * 100)


async def calcular_progreso_y_proxima_actividad(alumno_id: str, curso_id: str) -> tuple[int, Optional[str]]:
    """
    Progreso (0-100) y próxima actividad pendiente en un solo cálculo.

    calcular_modulos_completados() ya hace varias queries por módulo (examen/
    evidencia según el tipo); calcular_progreso_curso() y
    obtener_proxima_actividad() lo llamaban cada uno por separado, duplicando
    esa ronda completa de queries. Esta función la corre una sola vez y
    deriva ambos valores del mismo resultado -- pensada para listados como
    "Mis Cursos" que antes hacían esto por cada curso inscripto.
    """
    modulos = await prisma.modulo.find_many(
        where={"cursoId": curso_id},
        order={"orden": "asc"}
    )
    if not modulos:
        return 0, None

    completados_ids = await calcular_modulos_completados(alumno_id, curso_id, modulos=modulos)
    completados = set(completados_ids)

    progreso = int((len(completados) / len(modulos)) * 100)

    proxima_actividad = None
    for modulo in modulos:
        if modulo.id in completados:
            continue
        if modulo.tipo == "TEORIA":
            proxima_actividad = f"Módulo Teórico: {modulo.titulo}"
        elif modulo.tipo == "QUIZ":
            proxima_actividad = f"Quiz: {modulo.titulo}"
        elif modulo.tipo == "PRACTICA":
            proxima_actividad = f"Práctica (Pendiente Aprobación): {modulo.titulo}"
        break

    return progreso, proxima_actividad


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
    modulos = await prisma.modulo.find_many(
        where={"cursoId": curso_id},
        order={"orden": "asc"}
    )
    completados = set(await calcular_modulos_completados(alumno_id, curso_id))

    for modulo in modulos:
        if modulo.id in completados:
            continue

        if modulo.tipo == "TEORIA":
            return f"Módulo Teórico: {modulo.titulo}"
        elif modulo.tipo == "QUIZ":
            return f"Quiz: {modulo.titulo}"
        elif modulo.tipo == "PRACTICA":
            return f"Práctica (Pendiente Aprobación): {modulo.titulo}"

    return None
