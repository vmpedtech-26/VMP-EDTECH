from fastapi import APIRouter, Depends, Query
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
    """Lista de empleados / alumnos"""
    where = {"rol": "ALUMNO", "activo": True}
    if empresaId:
        where["empresaId"] = empresaId
    total = await prisma.user.count(where=where)
    users = await prisma.user.find_many(
        where=where,
        include={"empresa": True, "inscripciones": {"include": {"curso": True}}},
        take=limit,
        skip=skip,
        order_by={"nombre": "asc"}
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
        order_by={"nombre": "asc"}
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
