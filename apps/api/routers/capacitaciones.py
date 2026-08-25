from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional
from auth.dependencies import get_current_user, require_admin
from core.database import prisma
from datetime import datetime

router = APIRouter()

@router.get("/pending-actions")
async def pending_actions(current_user=Depends(require_admin)):
    """Dashboard: pending items count"""
    # Count pending essay grades (fotos_credencial pendientes que el user puede evaluar)
    pending_fotos = await prisma.fotocredencial.count(where={"estado": "PENDIENTE"}) if current_user.rol in ["SUPER_ADMIN", "INSTRUCTOR"] else 0
    # Count training requests pending
    pending_requests = await prisma.solicitudcapacitacion.count(where={"estado": "PENDIENTE"}) if current_user.rol in ["SUPER_ADMIN", "INSTRUCTOR"] else 0
    # Count compliance gaps (inscripciones vencidas / sin completar)
    compliance_gaps = 0
    try:
        inscripciones_en_progreso = await prisma.inscripcion.count(where={"estado": "EN_PROGRESO"})
        compliance_gaps = inscripciones_en_progreso
    except:
        pass
    total = pending_fotos + pending_requests + compliance_gaps
    return {
        "pendingEssayGrades": pending_fotos,
        "complianceGaps": compliance_gaps,
        "clientTrainingRequests": pending_requests,
        "total": total
    }

@router.get("/overview")
async def overview(current_user=Depends(require_admin)):
    """Dashboard: general statistics"""
    total_cursos = await prisma.curso.count(where={"activo": True})
    total_empresas = await prisma.company.count(where={"activa": True})
    total_alumnos = await prisma.user.count(where={"rol": "ALUMNO", "activo": True})
    total_inscripciones = await prisma.inscripcion.count()
    completadas = await prisma.inscripcion.count(where={"estado": {"in": ["COMPLETADO", "APROBADO"]}})
    credenciales = await prisma.credencial.count()
    return {
        "cursos": total_cursos,
        "empresas": total_empresas,
        "alumnos": total_alumnos,
        "inscripciones": total_inscripciones,
        "completadas": completadas,
        "credenciales": credenciales,
        "tasaComplecion": round((completadas / total_inscripciones * 100) if total_inscripciones > 0 else 0, 1)
    }

@router.get("/history")
async def history(
    limit: int = Query(50, le=200),
    skip: int = Query(0),
    current_user=Depends(require_admin)
):
    """Historico de capacitaciones completadas"""
    where = {"estado": {"in": ["COMPLETADO", "APROBADO", "REPROBADO"]}}
    total = await prisma.inscripcion.count(where=where)
    inscripciones = await prisma.inscripcion.find_many(
        where=where,
        include={"alumno": True, "curso": True},
        order_by={"updatedAt": "desc"},
        take=limit,
        skip=skip
    )
    items = []
    for i in inscripciones:
        items.append({
            "id": i.id,
            "alumno": {"id": i.alumno.id, "nombre": f"{i.alumno.nombre} {i.alumno.apellido}", "email": i.alumno.email},
            "curso": {"id": i.curso.id, "nombre": i.curso.nombre, "codigo": i.curso.codigo},
            "estado": i.estado,
            "progreso": i.progreso,
            "finDate": i.finDate.isoformat() if i.finDate else None,
            "updatedAt": i.updatedAt.isoformat()
        })
    return {"items": items, "total": total}

@router.get("/sessions")
async def list_sessions(
    limit: int = Query(50),
    current_user=Depends(require_admin)
):
    """Sesiones programadas"""
    try:
        sesiones = await prisma.sesioncapacitacion.find_many(
            include={"curso": True, "instructor": True},
            order={"fechaInicio": "asc"},
            take=limit
        )
        items = []
        for s in sesiones:
            items.append({
                "id": s.id,
                "titulo": s.titulo,
                "curso": {"id": s.curso.id, "nombre": s.curso.nombre},
                "fechaInicio": s.fechaInicio.isoformat(),
                "fechaFin": s.fechaFin.isoformat() if s.fechaFin else None,
                "modalidad": s.curso.modalidad if s.curso else None,
                "ubicacion": s.lugar,
                "urlOnline": s.meetLink,
                "capacidad": None,
                "instructor": {"nombre": f"{s.instructor.nombre} {s.instructor.apellido}"} if s.instructor else None
            })
        return {"items": items}
    except Exception as e:
        return {"items": [], "error": str(e)}

@router.post("/sessions")
async def create_session(data: dict, current_user=Depends(require_admin)):
    """Crear sesión"""
    fecha_inicio = datetime.fromisoformat(data["fechaInicio"])
    sesion = await prisma.sesioncapacitacion.create(data={
        "cursoId": data["cursoId"],
        "titulo": data["titulo"],
        "fechaInicio": fecha_inicio,
        "fechaFin": datetime.fromisoformat(data["fechaFin"]) if data.get("fechaFin") else fecha_inicio,
        "lugar": data.get("ubicacion"),
        "plataforma": data.get("modalidad"),
    })
    return sesion

@router.get("/training-requests")
async def training_requests(
    skip: int = 0,
    limit: int = 50,
    current_user=Depends(require_admin)
):
    """Solicitudes de capacitación de clientes"""
    try:
        solicitudes = await prisma.solicitudcapacitacion.find_many(
            include={"empresa": True, "curso": True},
            order_by={"createdAt": "desc"},
            take=limit,
            skip=skip
        )
        total = await prisma.solicitudcapacitacion.count()
        items = []
        for s in solicitudes:
            items.append({
                "id": s.id,
                "empresa": {"id": s.empresa.id, "nombre": s.empresa.nombre},
                "curso": {"id": s.curso.id, "nombre": s.curso.nombre},
                "solicitante": {"nombre": s.solicitanteNombre, "email": s.solicitanteEmail},
                "cantidadPersonas": s.cantidadPersonas,
                "estado": s.estado,
                "observaciones": s.observaciones,
                "createdAt": s.createdAt.isoformat()
            })
        return {"items": items, "total": total}
    except Exception as e:
        return {"items": [], "total": 0, "error": str(e)}

@router.post("/training-requests")
async def create_training_request(data: dict, current_user=Depends(get_current_user)):
    """Crear solicitud de capacitación"""
    solicitud = await prisma.solicitudcapacitacion.create(data={
        "empresaId": data["empresaId"],
        "cursoId": data["cursoId"],
        "solicitanteNombre": data["solicitanteNombre"],
        "solicitanteEmail": data["solicitanteEmail"],
        "cantidadPersonas": data.get("cantidadPersonas", 1),
        "observaciones": data.get("observaciones"),
    })
    return solicitud

@router.patch("/training-requests/{id}")
async def update_training_request(id: str, data: dict, current_user=Depends(require_admin)):
    """Actualizar estado de solicitud"""
    solicitud = await prisma.solicitudcapacitacion.update(
        where={"id": id},
        data={"estado": data["estado"]}
    )
    return solicitud

@router.get("/acta-curso/{cursoId}")
async def obtener_acta_curso(cursoId: str, current_user=Depends(get_current_user)):
    """Obtener acta de calificaciones y asistencias de una capacitación (Estilo Blister)"""
    if current_user.rol not in ["SUPER_ADMIN", "INSTRUCTOR"]:
        raise HTTPException(status_code=403, detail="No autorizado")

    where_clause = {"cursoId": cursoId}
    if current_user.rol == "INSTRUCTOR":
        where_clause["alumno"] = {"is": {"empresaId": current_user.empresaId}}

    inscripciones = await prisma.inscripcion.find_many(
        where=where_clause,
        include={"alumno": True, "curso": True}
    )

    alumno_ids = [inc.alumnoId for inc in inscripciones]

    ultimo_examen_por_alumno = {}
    if alumno_ids:
        examenes = await prisma.examen.find_many(
            where={"alumnoId": {"in": alumno_ids}, "cursoId": cursoId},
            order={"realizadoAt": "desc"}
        )
        for ex in examenes:
            # order desc: el primero que aparece por alumno es el más reciente
            ultimo_examen_por_alumno.setdefault(ex.alumnoId, ex)

    credencial_por_alumno = {}
    if alumno_ids:
        credenciales = await prisma.credencial.find_many(
            where={"alumnoId": {"in": alumno_ids}, "cursoId": cursoId}
        )
        for cred in credenciales:
            credencial_por_alumno.setdefault(cred.alumnoId, cred)

    acta = []
    for inc in inscripciones:
        examen = ultimo_examen_por_alumno.get(inc.alumnoId)
        credencial = credencial_por_alumno.get(inc.alumnoId)

        acta.append({
            "inscripcionId": inc.id,
            "alumno": f"{inc.alumno.nombre} {inc.alumno.apellido}",
            "dni": inc.alumno.dni,
            "email": inc.alumno.email,
            "estado": inc.estado,
            "progreso": inc.progreso,
            "nota": examen.calificacion if examen else None,
            "aprobado": examen.aprobado if examen else False,
            "credencialNumero": credencial.numero if credencial else None,
            "qrUrl": credencial.qrCodeUrl if credencial else None
        })
        
    return {"cursoId": cursoId, "alumnos": acta, "total": len(acta)}


@router.post("/generar-examen-plantilla")
async def generar_examen_desde_plantilla(plantillaId: str, current_user=Depends(get_current_user)):
    """Generar set de examen aleatorio a partir de una plantilla del Banco de Preguntas (Estilo Blister)"""
    plantilla = await prisma.plantillaevaluacion.find_unique(where={"id": plantillaId})
    if not plantilla:
        raise HTTPException(status_code=404, detail="Plantilla de evaluación no encontrada")
        
    preguntas_config = plantilla.preguntas or []
    # Cargar preguntas del banco
    preguntas_ids = [p.get("preguntaId") for p in preguntas_config if isinstance(p, dict) and "preguntaId" in p]
    
    banco_preguntas = await prisma.bancopregunta.find_many(
        where={"id": {"in": preguntas_ids}, "activo": True}
    )
    
    return {
        "plantillaId": plantilla.id,
        "nombre": plantilla.nombre,
        "tiempoLimite": plantilla.tiempoLimite,
        "notaMinima": plantilla.notaMinima,
        "preguntas": [
            {
                "id": b.id,
                "pregunta": b.pregunta,
                "opciones": b.opciones,
                "dificultad": b.dificultad
            } for b in banco_preguntas
        ]
    }

@router.get("/clientes/customers")
async def clientes_customers(current_user=Depends(require_admin)):
    """Clientes del módulo capacitaciones"""
    empresas = await prisma.company.find_many(
        where={"activa": True},
        include={"usuarios": True, "solicitudes": True},
        order_by={"nombre": "asc"}
    )
    items = []
    for e in empresas:
        alumnos = [u for u in (e.usuarios or []) if u.rol == "ALUMNO"]
        solicitudes_pendientes = len([s for s in (e.solicitudes or []) if s.estado == "PENDIENTE"])
        items.append({
            "id": e.id,
            "nombre": e.nombre,
            "cuit": e.cuit,
            "email": e.email,
            "telefono": e.telefono,
            "totalAlumnos": len(alumnos),
            "solicitudesPendientes": solicitudes_pendientes,
        })
    return {"items": items, "total": len(items)}
