"""
Router de métricas para el panel administrativo.
Proporciona estadísticas y datos para visualización.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timedelta
from typing import Optional
from core.database import prisma
from auth.dependencies import get_current_user
from schemas.models import UserResponse

router = APIRouter()


@router.get("/overview")
async def get_overview_metrics(current_user: UserResponse = Depends(get_current_user)):
    """
    Obtener métricas generales del sistema.
    Requiere autenticación de SUPER_ADMIN.
    """
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver estas métricas"
        )
    
    try:
        # Contar totales
        total_users = await prisma.user.count()
        total_companies = await prisma.company.count()
        total_courses = await prisma.curso.count()
        total_enrollments = await prisma.inscripcion.count()
        total_credentials = await prisma.credencial.count()
        total_quotes = await prisma.cotizacion.count()
        
        # Cotizaciones por estado
        quotes_pending = await prisma.cotizacion.count(where={"status": "pending"})
        quotes_contacted = await prisma.cotizacion.count(where={"status": "contacted"})
        quotes_converted = await prisma.cotizacion.count(where={"status": "converted"})
        quotes_rejected = await prisma.cotizacion.count(where={"status": "rejected"})
        
        # Inscripciones por estado
        enrollments_active = await prisma.inscripcion.count(where={"estado": "ACTIVO"})
        enrollments_completed = await prisma.inscripcion.count(where={"estado": "COMPLETADO"})
        
        # Calcular tasa de conversión
        conversion_rate = (quotes_converted / total_quotes * 100) if total_quotes > 0 else 0
        
        return {
            "totals": {
                "users": total_users,
                "companies": total_companies,
                "courses": total_courses,
                "enrollments": total_enrollments,
                "credentials": total_credentials,
                "quotes": total_quotes
            },
            "quotes": {
                "pending": quotes_pending,
                "contacted": quotes_contacted,
                "converted": quotes_converted,
                "rejected": quotes_rejected,
                "conversion_rate": round(conversion_rate, 2)
            },
            "enrollments": {
                "active": enrollments_active,
                "completed": enrollments_completed,
                "completion_rate": round((enrollments_completed / total_enrollments * 100) if total_enrollments > 0 else 0, 2)
            }
        }
    except Exception as e:
        print(f"Error getting overview metrics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al obtener métricas"
        )


@router.get("/conversions")
async def get_conversion_metrics(
    days: int = 30,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Obtener datos de conversión de cotizaciones en los últimos N días.
    """
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver estas métricas"
        )
    
    try:
        # Calcular fecha de inicio
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Obtener cotizaciones del período
        quotes = await prisma.cotizacion.find_many(
            where={
                "createdAt": {
                    "gte": start_date
                }
            },
            order_by={"createdAt": "asc"}
        )
        
        # Agrupar por día
        daily_data = {}
        for quote in quotes:
            date_key = quote.createdAt.strftime("%Y-%m-%d")
            if date_key not in daily_data:
                daily_data[date_key] = {
                    "date": date_key,
                    "total": 0,
                    "pending": 0,
                    "contacted": 0,
                    "converted": 0,
                    "rejected": 0
                }
            
            daily_data[date_key]["total"] += 1
            daily_data[date_key][quote.status] += 1
        
        return {
            "period_days": days,
            "start_date": start_date.isoformat(),
            "data": list(daily_data.values())
        }
    except Exception as e:
        print(f"Error getting conversion metrics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al obtener datos de conversión"
        )


@router.get("/courses")
async def get_course_metrics(current_user: UserResponse = Depends(get_current_user)):
    """
    Obtener estadísticas por curso.
    """
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver estas métricas"
        )
    
    try:
        courses = await prisma.curso.find_many(
            include={
                "_count": {
                    "select": {
                        "inscripciones": True,
                        "credenciales": True
                    }
                }
            }
        )
        
        course_stats = []
        for course in courses:
            # Contar inscripciones completadas
            completed = await prisma.inscripcion.count(
                where={
                    "cursoId": course.id,
                    "estado": "COMPLETADO"
                }
            )
            
            course_stats.append({
                "id": course.id,
                "nombre": course.nombre,
                "codigo": course.codigo,
                "total_enrollments": course._count.inscripciones,
                "total_credentials": course._count.credenciales,
                "completed_enrollments": completed,
                "completion_rate": round((completed / course._count.inscripciones * 100) if course._count.inscripciones > 0 else 0, 2)
            })
        
        return {
            "courses": course_stats
        }
    except Exception as e:
        print(f"Error getting course metrics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al obtener estadísticas de cursos"
        )


@router.get("/instructor")
async def get_instructor_metrics(current_user: UserResponse = Depends(get_current_user)):
    """
    Obtener métricas para el panel de instructor.
    Filtra por empresa del instructor.
    """
    if current_user.rol not in ["INSTRUCTOR", "SUPER_ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de instructor"
        )
    
    try:
        empresa_id = current_user.empresaId
        
        # Evidencias pendientes de revisión (de su empresa)
        where_pendientes = {"estado": "PENDIENTE"}
        if empresa_id:
            where_pendientes["alumno"] = {"empresaId": empresa_id}
        pending_evidencias = await prisma.evidencia.count(where=where_pendientes)
        
        # Alumnos activos de su empresa
        where_alumnos = {"rol": "ALUMNO"}
        if empresa_id:
            where_alumnos["empresaId"] = empresa_id
        active_alumnos = await prisma.user.count(where=where_alumnos)
        
        # Cursos de la empresa
        if empresa_id:
            cursos_count = await prisma.curso.count(
                where={"empresaId": empresa_id}
            )
        else:
            cursos_count = await prisma.curso.count()
        
        # Credenciales emitidas (de alumnos de su empresa)
        if empresa_id:
            credenciales_count = await prisma.credencial.count(
                where={"alumno": {"empresaId": empresa_id}}
            )
        else:
            credenciales_count = await prisma.credencial.count()
        
        # Inscripciones activas de la empresa
        where_inscripciones = {"estado": "ACTIVO"}
        if empresa_id:
            where_inscripciones["alumno"] = {"empresaId": empresa_id}
        inscripciones_activas = await prisma.inscripcion.count(where=where_inscripciones)
        
        return {
            "pending_evidencias": pending_evidencias,
            "active_alumnos": active_alumnos,
            "cursos_count": cursos_count,
            "credenciales_count": credenciales_count,
            "inscripciones_activas": inscripciones_activas
        }
    except Exception as e:
        print(f"Error getting instructor metrics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al obtener métricas de instructor"
        )

