from core.database import prisma

async def sincronizar_asistencia_alumno(alumno_id: str, curso_id: str):
    """
    Sincroniza y crea registros de asistencia para un alumno recién inscripto
    en todas las sesiones activas (PROGRAMADA, EN_CURSO) de un curso.
    """
    try:
        # 1. Obtener todas las sesiones activas del curso
        sesiones = await prisma.sesionCapacitacion.find_many(
            where={
                "cursoId": curso_id,
                "estado": {
                    "in": ["PROGRAMADA", "EN_CURSO"]
                }
            }
        )
        
        # 2. Para cada sesión, verificar e insertar la asistencia si no existe
        for sesion in sesiones:
            existing = await prisma.asistenciaSesion.find_unique(
                where={
                    "sesionId_alumnoId": {
                        "sesionId": sesion.id,
                        "alumnoId": alumno_id
                    }
                }
            )
            if not existing:
                await prisma.asistenciaSesion.create(
                    data={
                        "sesionId": sesion.id,
                        "alumnoId": alumno_id,
                        "presente": False
                    }
                )
    except Exception as e:
        # Silenciar y registrar en logs para evitar interrumpir el flujo principal de inscripción
        print(f"⚠️ Error sincronizando asistencia para alumno {alumno_id} en curso {curso_id}: {e}")
