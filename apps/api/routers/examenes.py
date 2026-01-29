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

@router.post("/generar-credencial", response_model=CredencialResponse)
async def generar_credencial(
    data: GenerateCredencialRequest,
    current_user = Depends(get_current_user)
):
    """
    Generar credencial profesional al completar un curso
    Solo admins pueden generar credenciales para otros usuarios
    Alumnos solo pueden generar para sí mismos si tienen inscripción aprobada
    """
    
    # Verificar permisos
    if current_user.rol == "ALUMNO" and current_user.id != data.alumnoId:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    # Verificar que el alumno existe
    alumno = await prisma.user.find_unique(where={"id": data.alumnoId})
    if not alumno:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Verificar que el curso existe
    curso = await prisma.curso.find_unique(where={"id": data.cursoId})
    if not curso:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Verificar que el curso fue completado y aprobado
    inscripcion = await prisma.inscripcion.find_first(
        where={
            "alumnoId": data.alumnoId,
            "cursoId": data.cursoId,
            "estado": "APROBADO"
        }
    )
    
    if not inscripcion:
        raise HTTPException(
            status_code=400,
            detail="Course not completed or not approved"
        )
    
    # Verificar si ya existe una credencial para este curso
    existing_credencial = await prisma.credencial.find_first(
        where={
            "alumnoId": data.alumnoId,
            "cursoId": data.cursoId
        }
    )
    
    if existing_credencial:
        raise HTTPException(
            status_code=400,
            detail="Credential already exists for this course"
        )
    
    # Generar número único
    year = datetime.now().year
    # Contar credenciales del año actual para sequential
    count = await prisma.credencial.count(
        where={"numero": {"startswith": f"VMP-{year}-"}}
    )
    numero_credencial = generate_credencial_number(year, count + 1)
    
    # Calcular fecha de vencimiento
    fecha_emision = datetime.now()
    fecha_vencimiento = None
    if curso.vigenciaMeses:
        fecha_vencimiento = fecha_emision + relativedelta(months=curso.vigenciaMeses)
    
    # URL de verificación pública
    qr_url = f"https://vmpservicios.com/verify/{numero_credencial}"
    
    # Generar PDF
    pdf_data = {
        "numero_credencial": numero_credencial,
        "alumno_nombre": f"{alumno.nombre} {alumno.apellido}".upper(),
        "dni": alumno.dni,
        "curso_nombre": curso.nombre,
        "curso_codigo": curso.codigo,
        "fecha_emision": fecha_emision.strftime("%d/%m/%Y"),
        "fecha_vencimiento": fecha_vencimiento.strftime("%d/%m/%Y") if fecha_vencimiento else None,
        "qr_url": qr_url
    }
    
    pdf_bytes = create_credencial_pdf(pdf_data)
    
    # Guardar PDF
    pdf_filename = f"{numero_credencial}.pdf"
    pdf_url = await save_credencial_pdf(pdf_bytes, pdf_filename)
    
    # Crear registro en base de datos
    credencial = await prisma.credencial.create(
        data={
            "numero": numero_credencial,
            "alumnoId": data.alumnoId,
            "cursoId": data.cursoId,
            "pdfUrl": pdf_url,
            "qrCodeUrl": qr_url,
            "fechaEmision": fecha_emision,
            "fechaVencimiento": fecha_vencimiento
        },
        include={"curso": True}
    )
    
    return CredencialResponse(
        id=credencial.id,
        numero=credencial.numero,
        pdfUrl=credencial.pdfUrl,
        qrCodeUrl=credencial.qrCodeUrl,
        fechaEmision=credencial.fechaEmision.isoformat(),
        fechaVencimiento=credencial.fechaVencimiento.isoformat() if credencial.fechaVencimiento else None,
        curso=credencial.curso
    )

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

