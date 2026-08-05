from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from auth.dependencies import get_current_user
from core.database import prisma

router = APIRouter()

class PreguntaCreate(BaseModel):
    pregunta: str
    opciones: List[str]
    respuestaCorrecta: int
    explicacion: Optional[str] = None
    area: Optional[str] = None
    dificultad: str = "media"

@router.get("")
async def list_preguntas(current_user=Depends(get_current_user)):
    items = await prisma.bancopregunta.find_many(where={"activo": True}, order_by={"createdAt": "desc"})
    return {"items": [{"id": i.id, "pregunta": i.pregunta, "opciones": i.opciones, "respuestaCorrecta": i.respuestaCorrecta, "area": i.area, "dificultad": i.dificultad} for i in items]}

@router.post("")
async def create_pregunta(data: PreguntaCreate, current_user=Depends(get_current_user)):
    item = await prisma.bancopregunta.create(data={"pregunta": data.pregunta, "opciones": data.opciones, "respuestaCorrecta": data.respuestaCorrecta, "explicacion": data.explicacion, "area": data.area, "dificultad": data.dificultad})
    return item

@router.delete("/{id}")
async def delete_pregunta(id: str, current_user=Depends(get_current_user)):
    await prisma.bancopregunta.update(where={"id": id}, data={"activo": False})
    return {"ok": True}
