from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from schemas.models import (
    EnviarQuizRequest,
    QuizFeedbackResponse,
    PreguntaFeedback
)
from auth.dependencies import get_current_user
from core.database import prisma
from services.credential_service import generate_credential_for_student

router = APIRouter()


@router.post("/enviar-quiz", response_model=QuizFeedbackResponse)
async def enviar_quiz(
    data: EnviarQuizRequest,
    current_user = Depends(get_current_user)
):
    """
    Enviar respuestas de quiz con feedback inmediato
    Calcula calificación y retorna feedback por pregunta
    """
    
    # Verificar que el módulo existe y es tipo QUIZ
    modulo = await prisma.modulo.find_unique(
        where={"id": data.moduloId},
        include={"preguntas": True}
    )
    
    if not modulo:
        raise HTTPException(status_code=404, detail="Módulo no encontrado")
    
    if modulo.tipo != "QUIZ":
        raise HTTPException(status_code=400, detail="Este módulo no es un quiz")
    
    if modulo.cursoId != data.cursoId:
        raise HTTPException(status_code=400, detail="Módulo no pertenece a este curso")
    
    # Verificar inscripción
    inscripcion = await prisma.inscripcion.find_first(
        where={
            "alumnoId": current_user.id,
            "cursoId": data.cursoId
        }
    )
    
    if not inscripcion:
        raise HTTPException(status_code=403, detail="No estás inscrito en este curso")
    
    # Calificar quiz
    preguntas = modulo.preguntas
    total_preguntas = len(preguntas)
    respuestas_correctas = 0
    feedback_list = []
    
    for pregunta in preguntas:
        respuesta_elegida = data.respuestas.get(pregunta.id)
        
        if respuesta_elegida is None:
            # No respondió esta pregunta
            feedback_list.append(PreguntaFeedback(
                preguntaId=pregunta.id,
                correcta=False,
                respuestaElegida=-1,
                respuestaCorrecta=pregunta.respuestaCorrecta,
                explicacion=pregunta.explicacion
            ))
        else:
            correcta = (respuesta_elegida == pregunta.respuestaCorrecta)
            if correcta:
                respuestas_correctas += 1
            
            feedback_list.append(PreguntaFeedback(
                preguntaId=pregunta.id,
                correcta=correcta,
                respuestaElegida=respuesta_elegida,
                respuestaCorrecta=pregunta.respuestaCorrecta,
                explicacion=pregunta.explicacion
            ))
    
    # Calcular calificación (0-100)
    calificacion = (respuestas_correctas / total_preguntas) * 100 if total_preguntas > 0 else 0
    
    # Determinar si aprobó (70% mínimo)
    aprobado = calificacion >= 70
    
    # Guardar examen en base de datos
    await prisma.examen.create(
        data={
            "alumnoId": current_user.id,
            "cursoId": data.cursoId,
            "respuestas": data.respuestas,
            "calificacion": calificacion,
            "aprobado": aprobado
        }
    )
    
    # Generar mensaje
    credencial_info = None
    if aprobado:
        message = f"¡Felicitaciones! Aprobaste con {calificacion:.1f}%"
        
        # ===== AUTO-GENERACIÓN DE CREDENCIAL =====
        # Al aprobar el examen, generar credencial automáticamente
        try:
            result = await generate_credential_for_student(
                alumno_id=current_user.id,
                curso_id=data.cursoId,
            )
            if result.get("already_existed"):
                message += " — Ya tenías una credencial para este curso."
            else:
                message += " — ¡Tu credencial ha sido generada!"
                credencial_info = {
                    "numero": result["credencial"].numero,
                    "pdfUrl": result["pdfUrl"]
                }
            
            # Marcar inscripción como APROBADO
            await prisma.inscripcion.update_many(
                where={
                    "alumnoId": current_user.id,
                    "cursoId": data.cursoId
                },
                data={
                    "estado": "APROBADO",
                    "finDate": datetime.now()
                }
            )
        except Exception as e:
            print(f"[CREDENCIAL AUTO-GEN] Error: {e}")
            # No falla el quiz si falla la generación
    else:
        message = f"No aprobaste. Obtuviste {calificacion:.1f}%. Necesitas 70% para aprobar. Puedes intentarlo nuevamente."
    
    return QuizFeedbackResponse(
        calificacion=calificacion,
        aprobado=aprobado,
        respuestasCorrectas=respuestas_correctas,
        totalPreguntas=total_preguntas,
        feedback=feedback_list,
        message=message,
        credencialInfo=credencial_info
    )
