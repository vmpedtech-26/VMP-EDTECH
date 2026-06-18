from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
import json
from datetime import datetime

# Prisma is usually imported from the app database connection
# Assuming the main app uses prisma client initialized globally or injected
from prisma.models import Obd2Session, Inscripcion
from core.database import prisma
router = APIRouter(prefix="/obd2", tags=["obd2"])

class Obd2MetricInput(BaseModel):
    fuerza_frenado: Optional[float] = None
    aceleracion: Optional[float] = None
    curvas_score: Optional[float] = None
    esquivo_alce: Optional[bool] = None
    raw_data: Optional[str] = None

@router.post("/metrics/{inscripcion_id}")
async def upload_metrics(inscripcion_id: str, data: Obd2MetricInput):
    """
    Sube métricas OBD2 para una inscripción específica (alumno + curso).
    """
    inscripcion = await prisma.inscripcion.find_unique(where={"id": inscripcion_id})
    if not inscripcion:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")

    session = await prisma.obd2session.create(
        data={
            "inscripcionId": inscripcion_id,
            "fuerzaFrenado": data.fuerza_frenado,
            "aceleracion": data.aceleracion,
            "curvasScore": data.curvas_score,
            "esquivoAlce": data.esquivo_alce,
            "rawData": data.raw_data
        }
    )
    return {"status": "success", "session_id": session.id}

@router.get("/metrics/{inscripcion_id}")
async def get_metrics(inscripcion_id: str):
    """
    Devuelve las sesiones OBD2 registradas para la inscripción de un alumno en un curso.
    """
    sessions = await prisma.obd2session.find_many(
        where={"inscripcionId": inscripcion_id},
        order={"fecha": "desc"}
    )
    return sessions
