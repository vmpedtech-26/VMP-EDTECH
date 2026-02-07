from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from dateutil.relativedelta import relativedelta
from schemas.models import (
    GenerateCredencialRequest,
    CredencialResponse,
    EnviarQuizRequest,
    QuizFeedbackResponse,
    PreguntaFeedback
)
from auth.dependencies import get_current_user
from core.database import prisma
from services.credencial_generator import (
    generate_credencial_number,
    create_credencial_pdf,
    save_credencial_pdf
)

router = APIRouter()

    
@router.post("/generar-credencial/{inscripcionId}")
async def generate_credencial(
    inscripcionId: str,
    current_user=Depends(get_current_user)
):
    """Generate credential PDF for completed course"""
    
    # Get inscripcion with related data
    inscripcion = await prisma.inscripcion.find_unique(
        where={"id": inscripcionId},
        include={
            "alumno": True,
            "curso": True
        }
    )
    
    if not inscripcion:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")
    
    # Verify user has permission
    if current_user.rol not in ["SUPER_ADMIN", "INSTRUCTOR"]:
        if current_user.id != inscripcion.alumnoId:
            raise HTTPException(status_code=403, detail="No autorizado")
    
    # Check if course is completed
    if not inscripcion.completado:
        raise HTTPException(status_code=400, detail="El curso no está completado")
    
    # Check if credential already exists
    existing = await prisma.credencial.find_first(
        where={
            "alumnoId": inscripcion.alumnoId,
            "cursoId": inscripcion.cursoId
        }
    )
    
    if existing:
        return {"message": "Credencial ya existe", "pdfUrl": existing.pdfUrl}
    
    # Get approved photo for student
    foto_credencial = await prisma.fotocredencial.find_unique(
        where={
            "alumnoId": inscripcion.alumnoId,
            "estado": "APROBADA"
        }
    )
    
    # Prepare foto path if exists
    foto_path = None
    if foto_credencial:
        # Convert URL to file path
        # Assuming fotoUrl is like "/uploads/credenciales/filename.jpg"
        foto_path = foto_credencial.fotoUrl.replace("/uploads/", "uploads/")
    
    # Generate credential number
    year = datetime.now().year
    count = await prisma.credencial.count()
    numero_credencial = generate_credencial_number(year, count + 1)
    
    # Prepare PDF data
    pdf_data = {
        "numero_credencial": numero_credencial,
        "alumno_nombre": f"{inscripcion.alumno.nombre} {inscripcion.alumno.apellido}",
        "dni": inscripcion.alumno.dni,
        "curso_nombre": inscripcion.curso.nombre,
        "curso_codigo": inscripcion.curso.id[:8].upper(),
        "fecha_emision": datetime.now().strftime("%d/%m/%Y"),
        "fecha_vencimiento": None,  # Could add expiration logic
        "qr_url": f"{settings.FRONTEND_URL}/verificar/{numero_credencial}"
    }
    
    # Generate PDF with photo
    pdf_bytes = await create_credencial_pdf(pdf_data, foto_path)
    filename = f"{numero_credencial}.pdf"
    pdf_url = await save_credencial_pdf(pdf_bytes, filename)
    
    # Create credential record
    credencial = await prisma.credencial.create(
        data={
            "alumnoId": inscripcion.alumnoId,
            "cursoId": inscripcion.cursoId,
            "codigoVerifica": numero_credencial,
            "pdfUrl": pdf_url,
            "fechaEmision": datetime.now(),
            "fechaVenc": datetime.now() + timedelta(days=365*2)  # 2 years validity
        }
    )
    
    return {
        "message": "Credencial generada exitosamente",
        "credencial": credencial,
        "pdfUrl": pdf_url
    }

@router.get("/mis-credenciales", response_model=list[CredencialResponse])
async def get_my_credenciales(current_user = Depends(get_current_user)):
    """Obtener todas las credenciales del usuario actual"""
    
    credenciales = await prisma.credencial.find_many(
        where={"alumnoId": current_user.id},
        include={"curso": True},
        order={"createdAt": "desc"}
    )
    
    return [
        CredencialResponse(
            id=c.id,
            numero=c.numero,
            pdfUrl=c.pdfUrl,
            qrCodeUrl=c.qrCodeUrl,
            fechaEmision=c.fechaEmision.isoformat(),
            fechaVencimiento=c.fechaVencimiento.isoformat() if c.fechaVencimiento else None,
            curso=c.curso
        )
        for c in credenciales
    ]

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
    if aprobado:
        message = f"¡Felicitaciones! Aprobaste con {calificacion:.1f}%"
    else:
        message = f"No aprobaste. Obtuviste {calificacion:.1f}%. Necesitas 70% para aprobar. Puedes intentarlo nuevamente."
    
    return QuizFeedbackResponse(
        calificacion=calificacion,
        aprobado=aprobado,
        respuestasCorrectas=respuestas_correctas,
        totalPreguntas=total_preguntas,
        feedback=feedback_list,
        message=message
    )

