from fastapi import APIRouter, Depends, Query
from auth.dependencies import get_current_user
from core.database import prisma

router = APIRouter()

@router.get("")
async def list_notificaciones(
    limit: int = Query(12, le=50),
    current_user=Depends(get_current_user)
):
    try:
        items = await prisma.notificacionitem.find_many(
            where={"userId": current_user.id},
            order_by={"createdAt": "desc"},
            take=limit
        )
        unread = await prisma.notificacionitem.count(where={"userId": current_user.id, "leida": False})
        return {
            "items": [{"id": i.id, "titulo": i.titulo, "mensaje": i.mensaje, "tipo": i.tipo, "leida": i.leida, "url": i.url, "createdAt": i.createdAt.isoformat()} for i in items],
            "unread": unread
        }
    except Exception as e:
        return {"items": [], "unread": 0}

@router.get("/unread-count")
async def unread_count(current_user=Depends(get_current_user)):
    try:
        count = await prisma.notificacionitem.count(where={"userId": current_user.id, "leida": False})
        return {"count": count}
    except:
        return {"count": 0}

@router.patch("/{id}/read")
async def mark_read(id: str, current_user=Depends(get_current_user)):
    await prisma.notificacionitem.update(where={"id": id}, data={"leida": True})
    return {"ok": True}

@router.patch("/mark-all-read")
async def mark_all_read(current_user=Depends(get_current_user)):
    await prisma.notificacionitem.update_many(where={"userId": current_user.id, "leida": False}, data={"leida": True})
    return {"ok": True}
