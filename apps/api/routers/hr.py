from fastapi import APIRouter, Depends, Query, HTTPException
from auth.dependencies import get_current_user
from core.database import prisma

router = APIRouter()

@router.get("/employees")
async def list_employees(
    skip: int = 0,
    limit: int = 50,
    empresaId: str = Query(None),
    current_user=Depends(get_current_user)
):
    """Lista de empleados / alumnos (Solo SUPER_ADMIN o INSTRUCTOR para su empresa)"""
    where = {"rol": "ALUMNO", "activo": True}

    if current_user.rol == "INSTRUCTOR":
        # Siempre se filtra por la empresa del instructor -- si no tiene una
        # asignada, debe ver una lista vacía, nunca la de toda la plataforma.
        where["empresaId"] = current_user.empresaId
    elif current_user.rol == "SUPER_ADMIN":
        if empresaId:
            where["empresaId"] = empresaId
    else:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    total = await prisma.user.count(where=where)
    users = await prisma.user.find_many(
        where=where,
        include={"empresa": True, "inscripciones": {"include": {"curso": True}}},
        take=limit,
        skip=skip,
        order={"nombre": "asc"}
    )
    items = []
    for u in users:
        inscripciones_activas = len([i for i in (u.inscripciones or []) if i.estado not in ["COMPLETADO", "APROBADO", "REPROBADO"]])
        items.append({
            "id": u.id,
            "nombre": u.nombre,
            "apellido": u.apellido,
            "email": u.email,
            "dni": u.dni,
            "telefono": u.telefono,
            "empresa": {"id": u.empresa.id, "nombre": u.empresa.nombre} if u.empresa else None,
            "inscripcionesActivas": inscripciones_activas,
            "totalInscripciones": len(u.inscripciones or []),
        })
    return {"items": items, "total": total}

@router.get("/courses")
async def list_courses(current_user=Depends(get_current_user)):
    """Catálogo de cursos (HR view)"""
    cursos = await prisma.curso.find_many(
        where={"activo": True},
        include={"_count": True},
        order={"nombre": "asc"}
    )
    return {"items": [
        {
            "id": c.id,
            "nombre": c.nombre,
            "descripcion": c.descripcion,
            "codigo": c.codigo,
            "duracionHoras": c.duracionHoras,
            "vigenciaMeses": c.vigenciaMeses,
        } for c in cursos
    ]}
