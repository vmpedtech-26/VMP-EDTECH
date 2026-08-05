from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from auth.dependencies import get_current_user
from core.database import prisma

router = APIRouter()

class PlantillaCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    preguntas: List[dict]
    tiempoLimite: Optional[int] = None
    notaMinima: float = 60

@router.get("")
async def list_plantillas(current_user=Depends(get_current_user)):
    items = await prisma.plantillaevaluacion.find_many(where={"activa": True})
    return {"items": [{"id": i.id, "nombre": i.nombre, "descripcion": i.descripcion, "tiempoLimite": i.tiempoLimite, "notaMinima": i.notaMinima} for i in items]}

@router.post("")
async def create_plantilla(data: PlantillaCreate, current_user=Depends(get_current_user)):
    item = await prisma.plantillaevaluacion.create(data={"nombre": data.nombre, "descripcion": data.descripcion, "preguntas": data.preguntas, "tiempoLimite": data.tiempoLimite, "notaMinima": data.notaMinima})
    return item

@router.delete("/{id}")
async def delete_plantilla(id: str, current_user=Depends(get_current_user)):
    await prisma.plantillaevaluacion.update(where={"id": id}, data={"activa": False})
    return {"ok": True}
