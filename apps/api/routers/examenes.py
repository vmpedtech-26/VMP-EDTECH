from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
from schemas.models import (
    GenerateCredencialRequest,
    CredencialResponse,
    EnviarQuizRequest,
    QuizFeedbackResponse,
    PreguntaFeedback
)
from auth.dependencies import get_current_user
from core.database import prisma
from prisma import Json
from core.config import settings
from services.credencial_generator import (
    generate_credencial_number,
    create_credencial_pdf,
    save_credencial_pdf,
    generate_qr_code
)

router = APIRouter()


@router.get("/all")
async def obtener_todos_examenes(current_user=Depends(get_current_user)):
    """Obtener todos los exámenes (solo INSTRUCTOR y SUPER_ADMIN)"""
    if current_user.rol not in ["SUPER_ADMIN", "INSTRUCTOR"]:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="No autorizado")
    
    examenes = await prisma.examen.find_many(
        include={
            "alumno": True,
            "curso": True
        },
        order={"realizadoAt": "desc"}
    )
    
    return [
        {
            "id": e.id,
            "alumnoId": e.alumnoId,
            "cursoId": e.cursoId,
            "calificacion": e.calificacion,
            "aprobado": e.aprobado,
            "realizadoAt": e.realizadoAt.isoformat() if e.realizadoAt else None,
            "alumno": {
                "nombre": e.alumno.nombre,
                "apellido": e.alumno.apellido,
                "dni": e.alumno.dni,
                "email": e.alumno.email
            },
            "curso": {
                "nombre": e.curso.nombre,
                "codigo": e.curso.codigo
            }
        }
        for e in examenes
    ]

    
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
    
    # Check if course is completed — only check estado field (no 'completado' boolean field in model)
    if inscripcion.estado not in ["COMPLETADO", "APROBADO"]:
        raise HTTPException(status_code=400, detail="El curso no está completado")
    
    # Check if credential already exists — use find_first with compound fields
    existing = await prisma.credencial.find_first(
        where={
            "alumnoId": inscripcion.alumnoId,
            "cursoId": inscripcion.cursoId
        }
    )
    
    if existing:
        return {"message": "Credencial ya existe", "pdfUrl": existing.pdfUrl, "numero": existing.numero}
    
    # Get approved photo for student — use find_first (not find_unique) since filtering by state
    foto_credencial = await prisma.fotocredencial.find_first(
        where={
            "alumnoId": inscripcion.alumnoId,
            "estado": "APROBADA"
        }
    )
    
    # Prepare foto path if exists
    foto_path = None
    if foto_credencial:
        # Convert URL to file path
        foto_path = foto_credencial.fotoUrl.replace("/uploads/", "uploads/")
    
    # Generate credential number
    year = datetime.now().year
    count = await prisma.credencial.count()
    numero_credencial = generate_credencial_number(year, count + 1)
    
    # Build QR URL
    qr_url = f"{settings.FRONTEND_URL}/validar/{numero_credencial}"
    
    # Prepare PDF data
    pdf_data = {
        "numero_credencial": numero_credencial,
        "alumno_nombre": f"{inscripcion.alumno.nombre} {inscripcion.alumno.apellido}",
        "dni": inscripcion.alumno.dni,
        "curso_nombre": inscripcion.curso.nombre,
        "curso_codigo": inscripcion.curso.codigo,
        "fecha_emision": datetime.now().strftime("%d/%m/%Y"),
        "fecha_vencimiento": (
            (datetime.now() + timedelta(days=30 * inscripcion.curso.vigenciaMeses)).strftime("%d/%m/%Y")
            if inscripcion.curso.vigenciaMeses
            else None
        ),
        "qr_url": qr_url
    }
    
    # Generate PDF with photo
    pdf_bytes = await create_credencial_pdf(pdf_data, foto_path)
    filename = f"{numero_credencial}.pdf"
    pdf_url = await save_credencial_pdf(pdf_bytes, filename)
    
    # Generate and save QR image URL (stored alongside PDF)
    qr_filename = f"{numero_credencial}_qr.png"
    qr_storage_path_str = f"/storage/credenciales/{qr_filename}"
    
    # Calculate fecha de vencimiento
    fecha_vencimiento = None
    if inscripcion.curso.vigenciaMeses:
        fecha_vencimiento = datetime.now() + timedelta(days=30 * inscripcion.curso.vigenciaMeses)
    
    # Create credential record with all required fields
    credencial = await prisma.credencial.create(
        data={
            "numero": numero_credencial,
            "alumnoId": inscripcion.alumnoId,
            "cursoId": inscripcion.cursoId,
            "pdfUrl": pdf_url,
            "qrCodeUrl": qr_storage_path_str,
            "fechaEmision": datetime.now(),
            "fechaVencimiento": fecha_vencimiento
        }
    )
    
    return {
        "message": "Credencial generada exitosamente",
        "credencial": {
            "id": credencial.id,
            "numero": credencial.numero,
            "pdfUrl": credencial.pdfUrl,
            "qrCodeUrl": credencial.qrCodeUrl,
        },
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

    curso = await prisma.curso.find_unique(where={"id": data.cursoId})
    if not curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    minimo_aprobacion = curso.minimoAprobacion or 70
    
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

    # Determinar si aprobó (según el mínimo configurado en el curso)
    aprobado = calificacion >= minimo_aprobacion

    # Contar intentos previos del alumno para este módulo específico
    # (un curso puede tener más de un módulo QUIZ)
    intentos_previos = await prisma.examen.count(
        where={
            "alumnoId": current_user.id,
            "cursoId": data.cursoId,
            "moduloId": data.moduloId
        }
    )
    intento_actual = intentos_previos + 1

    # Guardar examen en base de datos
    await prisma.examen.create(
        data={
            "alumnoId": current_user.id,
            "cursoId": data.cursoId,
            "moduloId": data.moduloId,
            "respuestas": Json(data.respuestas),
            "calificacion": calificacion,
            "aprobado": aprobado
        }
    )

    # Generar mensaje con información de intento
    if aprobado:
        message = f"¡Felicitaciones! Aprobaste en el intento #{intento_actual} con {calificacion:.1f}%"
    else:
        message = f"Intento #{intento_actual}: Obtuviste {calificacion:.1f}%. Necesitas {minimo_aprobacion:.0f}% para aprobar. Puedes intentarlo nuevamente."
    
    return QuizFeedbackResponse(
        calificacion=calificacion,
        aprobado=aprobado,
        respuestasCorrectas=respuestas_correctas,
        totalPreguntas=total_preguntas,
        feedback=feedback_list,
        message=message
    )
