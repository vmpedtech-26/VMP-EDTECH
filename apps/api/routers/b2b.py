from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
from auth.dependencies import get_current_user
from core.database import prisma
from services.asistencia_service import sincronizar_asistencia_alumno

router = APIRouter()

class EmployeeMetrics(BaseModel):
    totalEmployees: int
    activeCourses: int
    completedCourses: int
    expiringCredentials: int
    employees: List[dict]

@router.get("/dashboard", response_model=EmployeeMetrics)
async def get_b2b_dashboard(current_user=Depends(get_current_user)):
    """Obtener métricas de la empresa del usuario actual. Solo para SUPERVISOR o roles con empresaId."""
    if current_user.rol not in ["SUPERVISOR", "SUPER_ADMIN", "INSTRUCTOR"] and not current_user.empresaId:
        raise HTTPException(status_code=403, detail="No perteneces a una empresa registrada como B2B o no tienes permisos.")
    
    empresa_id = current_user.empresaId
    if not empresa_id and current_user.rol in ["SUPER_ADMIN", "INSTRUCTOR"]:
        # Si es admin, por ahora devolvemos error. En el futuro podría pasar un empresaId por param.
        raise HTTPException(status_code=400, detail="Los admins deben especificar una empresa para ver el dashboard B2B.")

    # Buscar empleados de la empresa
    empleados = await prisma.user.find_many(
        where={"empresaId": empresa_id},
        include={
            "inscripciones": {
                "include": {"curso": True}
            },
            "credenciales": True
        }
    )

    total_employees = len(empleados)
    active_courses = 0
    completed_courses = 0
    expiring_credentials = 0

    employee_data = []

    thirty_days = datetime.now() + timedelta(days=30)

    for emp in empleados:
        emp_active = 0
        emp_completed = 0
        emp_creds = []

        for insc in emp.inscripciones:
            if insc.estado == "COMPLETADO" or insc.estado == "APROBADO":
                completed_courses += 1
                emp_completed += 1
            else:
                active_courses += 1
                emp_active += 1

        for cred in emp.credenciales:
            is_expiring = False
            if cred.fechaVencimiento:
                if datetime.now() < cred.fechaVencimiento <= thirty_days:
                    expiring_credentials += 1
                    is_expiring = True
            
            emp_creds.append({
                "numero": cred.numero,
                "vencimiento": cred.fechaVencimiento.isoformat() if cred.fechaVencimiento else None,
                "is_expiring": is_expiring
            })

        employee_data.append({
            "id": emp.id,
            "nombre": emp.nombre,
            "apellido": emp.apellido,
            "dni": emp.dni,
            "active_courses": emp_active,
            "completed_courses": emp_completed,
            "credenciales": emp_creds
        })

    return {
        "totalEmployees": total_employees,
        "activeCourses": active_courses,
        "completedCourses": completed_courses,
        "expiringCredentials": expiring_credentials,
        "employees": employee_data
    }

class EmpleadoCreate(BaseModel):
    nombre: str
    apellido: str
    dni: str
    email: str

@router.post("/empleados")
async def crear_empleado(data: EmpleadoCreate, current_user=Depends(get_current_user)):
    """Alta de un chofer/empleado en la flota (Solo SUPERVISOR)"""
    if current_user.rol not in ["SUPERVISOR", "SUPER_ADMIN", "INSTRUCTOR"] or not current_user.empresaId:
        raise HTTPException(status_code=403, detail="Sin permisos B2B")
    
    from auth.jwt import hash_password
    import secrets
    import string
    
    # Generar contraseña temporal segura
    alphabet = string.ascii_letters + string.digits
    temp_password = ''.join(secrets.choice(alphabet) for i in range(10)) + "!"

    existing_user = await prisma.user.find_unique(where={"email": data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    existing_dni = await prisma.user.find_unique(where={"dni": data.dni})
    if existing_dni:
        raise HTTPException(status_code=400, detail="El DNI ya está registrado")

    new_emp = await prisma.user.create(
        data={
            "email": data.email,
            "passwordHash": hash_password(temp_password),
            "nombre": data.nombre,
            "apellido": data.apellido,
            "dni": data.dni,
            "rol": "ALUMNO",
            "empresaId": current_user.empresaId,
            "activo": True
        }
    )

    return {
        "message": "Empleado creado con éxito",
        "empleado": {"id": new_emp.id, "email": new_emp.email},
        "temp_password": temp_password
    }

@router.get("/cursos")
async def listar_cursos_b2b(current_user=Depends(get_current_user)):
    """Listar cursos disponibles para asignar"""
    if current_user.rol not in ["SUPERVISOR", "SUPER_ADMIN", "INSTRUCTOR"]:
        raise HTTPException(status_code=403, detail="Sin permisos")
        
    cursos = await prisma.curso.find_many(where={"activo": True})
    return [{"id": c.id, "nombre": c.nombre, "codigo": c.codigo} for c in cursos]

class AsignacionMasiva(BaseModel):
    cursoId: str
    alumnoIds: List[str]

@router.post("/asignar-curso")
async def asignar_curso_masivo(data: AsignacionMasiva, current_user=Depends(get_current_user)):
    """Asigna un curso a múltiples choferes de la flota"""
    if current_user.rol not in ["SUPERVISOR", "SUPER_ADMIN", "INSTRUCTOR"] or not current_user.empresaId:
        raise HTTPException(status_code=403, detail="Sin permisos B2B")
    
    curso = await prisma.curso.find_unique(where={"id": data.cursoId})
    if not curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
        
    # Verificar que los alumnos pertenezcan a la empresa
    alumnos = await prisma.user.find_many(
        where={
            "id": {"in": data.alumnoIds},
            "empresaId": current_user.empresaId
        }
    )
    
    if len(alumnos) != len(data.alumnoIds):
        raise HTTPException(status_code=400, detail="Uno o más empleados no pertenecen a tu empresa o no existen.")
        
    asignados = 0
    ya_existian = 0
    
    for al in alumnos:
        existing = await prisma.inscripcion.find_unique(
            where={
                "alumnoId_cursoId": {
                    "alumnoId": al.id,
                    "cursoId": curso.id
                }
            }
        )
        if not existing:
            await prisma.inscripcion.create(
                data={
                    "alumnoId": al.id,
                    "cursoId": curso.id,
                    "estado": "NO_INICIADO"
                }
            )
            # Sincronizar asistencia en sesiones programadas
            await sincronizar_asistencia_alumno(al.id, curso.id)
            asignados += 1
        else:
            ya_existian += 1
            
    return {
        "message": f"Se asignaron {asignados} cursos correctamente. {ya_existian} ya estaban asignados."
    }
