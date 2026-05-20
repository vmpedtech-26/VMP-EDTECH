from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from auth.dependencies import get_current_user
from core.database import prisma

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

    thirty_days = datetime.now() + timedelta(days=30) if 'timedelta' in globals() else None

    import datetime as dt
    thirty_days = dt.datetime.now() + dt.timedelta(days=30)

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
                if dt.datetime.now() < cred.fechaVencimiento <= thirty_days:
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
