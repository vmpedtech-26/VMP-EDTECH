from fastapi import APIRouter, HTTPException, Depends, Response
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from prisma import Prisma
from prisma.models import User
import logging
import json

from auth.dependencies import get_current_user

async def get_db():
    db = Prisma()
    await db.connect()
    try:
        yield db
    finally:
        await db.disconnect()

from services.pdf_presupuesto import generar_pdf_presupuesto
from services.ia_presupuesto import completar_formulario_desde_texto, redactar_alcance, sugerir_tarifas
from services import storage_service

logger = logging.getLogger(__name__)
router = APIRouter()

# ─── SCHEMAS ───
# Los nombres de campo acá coinciden con los que ya usa el frontend
# (PresupuestoForm/CuadroTarifario/lib/api/presupuestos-hse.ts), no con los
# nombres de columna internos de Prisma -- este router es el único punto de
# traducción entre ambos.

class ItemPresupuesto(BaseModel):
    codigo: str
    concepto: str
    unidad: str
    cantidad: float
    precio_unitario: float
    importe: float

class IndicadorHSE(BaseModel):
    """Fila libre de indicador HSE (ej: TRIR, LTIFR, o cualquier otro que se
    quiera mostrar). No hay un set fijo -- el usuario arma la lista que quiera."""
    concepto: str
    valor: str

class PresupuestoCreate(BaseModel):
    cliente_nombre: str
    cliente_cuit: str
    recurso_nombre: str
    recurso_cargo: str = "Técnico en Higiene y Seguridad"
    recurso_matricula: str
    fecha_desde: datetime
    fecha_hasta: datetime
    cantidad_jornadas: int
    horario: str = "09:00 a 18:00 hs"
    lugar_prestacion: str
    items: List[ItemPresupuesto] = []
    indicadores_hse: List[IndicadorHSE] = []
    vigencia_oferta: Optional[str] = None
    alcance_tecnico: Optional[str] = None
    entregables: Optional[str] = None
    exclusiones: Optional[str] = None
    condiciones_comerciales: Optional[str] = None
    estado: Optional[str] = None

class PresupuestoUpdate(BaseModel):
    estado: Optional[str] = None
    cliente_nombre: Optional[str] = None
    cliente_cuit: Optional[str] = None
    recurso_nombre: Optional[str] = None
    recurso_cargo: Optional[str] = None
    recurso_matricula: Optional[str] = None
    fecha_desde: Optional[datetime] = None
    fecha_hasta: Optional[datetime] = None
    cantidad_jornadas: Optional[int] = None
    horario: Optional[str] = None
    lugar_prestacion: Optional[str] = None
    items: Optional[List[ItemPresupuesto]] = None
    indicadores_hse: Optional[List[IndicadorHSE]] = None
    vigencia_oferta: Optional[str] = None
    alcance_tecnico: Optional[str] = None
    entregables: Optional[str] = None
    exclusiones: Optional[str] = None
    condiciones_comerciales: Optional[str] = None

class IATextoRequest(BaseModel):
    texto: str

# ─── AUTH DEPENDENCY ───

def check_super_admin(current_user: User = Depends(get_current_user)):
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    return current_user


# ─── SERIALIZACIÓN (Prisma camelCase -> contrato snake_case del frontend) ───

def _calcular_totales(items: List[ItemPresupuesto]):
    subtotal = sum(item.importe for item in items)
    iva = round(subtotal * 0.21, 2)
    total = round(subtotal + iva, 2)
    return round(subtotal, 2), iva, total


def serialize_presupuesto(p) -> dict:
    try:
        items = json.loads(p.itemsJson) if p.itemsJson else []
    except (json.JSONDecodeError, TypeError):
        items = []

    try:
        indicadores_hse = json.loads(p.indicadoresHseJson) if p.indicadoresHseJson else []
    except (json.JSONDecodeError, TypeError):
        indicadores_hse = []

    return {
        "id": p.id,
        "numero_cotizacion": p.numeroCotizacion,
        "cliente_nombre": p.clienteNombre,
        "cliente_cuit": p.clienteCuit,
        "recurso_nombre": p.recursoNombre,
        "recurso_cargo": p.recursoTitulo,
        "recurso_matricula": p.recursoMatricula,
        "fecha_desde": p.fechaDesde,
        "fecha_hasta": p.fechaHasta,
        "cantidad_jornadas": p.jornadas,
        "horario": p.horario,
        "lugar_prestacion": p.lugar,
        "alcance_tecnico": p.alcanceTexto,
        "entregables": p.entregablesTexto,
        "exclusiones": p.exclusionesTexto,
        "condiciones_comerciales": p.condicionesTexto,
        "items": items,
        "indicadores_hse": indicadores_hse,
        "vigencia_oferta": p.vigenciaOferta,
        "subtotal": p.importeNeto,
        "iva": p.iva,
        "total": p.total,
        "estado": p.estado,
        "fecha_emision": p.fechaEmision,
        "pdf_url": p.pdfUrl,
        "createdAt": p.createdAt,
    }


async def _siguiente_numero(db: Prisma) -> tuple[str, object]:
    anio = datetime.now().year
    contador_obj = await db.contadorcotizacion.find_unique(where={"anio": anio})
    if not contador_obj:
        contador_obj = await db.contadorcotizacion.create(data={"anio": anio, "contador": 144})
    nuevo_contador = contador_obj.contador + 1
    await db.contadorcotizacion.update(where={"id": contador_obj.id}, data={"contador": nuevo_contador})
    return f"VMP-{anio}-{nuevo_contador}", contador_obj


# ─── RUTAS ESTÁTICAS (deben ir ANTES de /{id}) ───

@router.get("")
async def list_presupuestos(
    estado: Optional[str] = None,
    cliente: Optional[str] = None,
    desde: Optional[datetime] = None,
    hasta: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(check_super_admin),
    db: Prisma = Depends(get_db)
):
    try:
        where = {}
        if estado:
            where["estado"] = estado
        if cliente:
            where["clienteNombre"] = {"contains": cliente, "mode": "insensitive"}
        if desde or hasta:
            where["createdAt"] = {}
            if desde:
                where["createdAt"]["gte"] = desde
            if hasta:
                where["createdAt"]["lte"] = hasta

        presupuestos = await db.presupuestohse.find_many(
            where=where,
            skip=skip,
            take=limit,
            order={"createdAt": "desc"}
        )
        return [serialize_presupuesto(p) for p in presupuestos]
    except Exception as e:
        logger.error(f"Error list_presupuestos: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("")
async def create_presupuesto(
    data: PresupuestoCreate,
    current_user: User = Depends(check_super_admin),
    db: Prisma = Depends(get_db)
):
    try:
        numero, _ = await _siguiente_numero(db)
        subtotal, iva, total = _calcular_totales(data.items)

        presupuesto = await db.presupuestohse.create(
            data={
                "numeroCotizacion": numero,
                "clienteNombre": data.cliente_nombre,
                "clienteCuit": data.cliente_cuit,
                "recursoNombre": data.recurso_nombre,
                "recursoTitulo": data.recurso_cargo,
                "recursoMatricula": data.recurso_matricula,
                "fechaDesde": data.fecha_desde,
                "fechaHasta": data.fecha_hasta,
                "jornadas": data.cantidad_jornadas,
                "horario": data.horario,
                "lugar": data.lugar_prestacion,
                "importeNeto": subtotal,
                "iva": iva,
                "total": total,
                "itemsJson": json.dumps([item.dict() for item in data.items]),
                "indicadoresHseJson": json.dumps([i.dict() for i in data.indicadores_hse]) if data.indicadores_hse else None,
                "vigenciaOferta": data.vigencia_oferta,
                "alcanceTexto": data.alcance_tecnico,
                "entregablesTexto": data.entregables,
                "exclusionesTexto": data.exclusiones,
                "condicionesTexto": data.condiciones_comerciales,
                "createdBy": current_user.email,
                "estado": data.estado or "BORRADOR",
            }
        )
        return serialize_presupuesto(presupuesto)
    except Exception as e:
        logger.error(f"Error create_presupuesto: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/siguiente-numero")
async def siguiente_numero_preview(
    current_user: User = Depends(check_super_admin),
    db: Prisma = Depends(get_db)
):
    anio = datetime.now().year
    contador_obj = await db.contadorcotizacion.find_unique(where={"anio": anio})
    cont = 144
    if contador_obj:
        cont = contador_obj.contador + 1
    return {"siguiente": f"VMP-{anio}-{cont}"}


@router.get("/plantillas")
async def get_plantillas_route(
    current_user: User = Depends(check_super_admin),
    db: Prisma = Depends(get_db)
):
    plantillas = await db.plantillapresupuesto.find_many(where={"activa": True})
    return [
        {
            "id": pl.id,
            "nombre": pl.nombre,
            "descripcion": pl.descripcion,
            "items": json.loads(pl.itemsDefaultJson) if pl.itemsDefaultJson else [],
            "alcance_tecnico": pl.alcanceDefault,
            "entregables": pl.entregablesDefault,
            "exclusiones": pl.exclusionesDefault,
            "condiciones_comerciales": pl.condicionesDefault,
        }
        for pl in plantillas
    ]


@router.post("/ia/completar")
async def ia_completar(
    data: IATextoRequest,
    current_user: User = Depends(check_super_admin),
):
    return await completar_formulario_desde_texto(data.texto)


@router.post("/ia/redactar-alcance")
async def ia_redactar_alcance(
    data: IATextoRequest,
    current_user: User = Depends(check_super_admin),
):
    return await redactar_alcance(data.texto)


@router.post("/ia/sugerir-tarifas")
async def ia_sugerir_tarifas(
    data: IATextoRequest,
    current_user: User = Depends(check_super_admin),
):
    return await sugerir_tarifas(data.texto)


# ─── RUTAS DINÁMICAS /{id} (siempre al final) ───

@router.get("/{id}")
async def get_presupuesto(
    id: str,
    current_user: User = Depends(check_super_admin),
    db: Prisma = Depends(get_db)
):
    presupuesto = await db.presupuestohse.find_unique(where={"id": id})
    if not presupuesto:
        raise HTTPException(status_code=404, detail="No encontrado")
    return serialize_presupuesto(presupuesto)


@router.put("/{id}")
async def update_presupuesto(
    id: str,
    data: PresupuestoUpdate,
    current_user: User = Depends(check_super_admin),
    db: Prisma = Depends(get_db)
):
    try:
        existing = await db.presupuestohse.find_unique(where={"id": id})
        if not existing:
            raise HTTPException(status_code=404, detail="No encontrado")

        payload = data.dict(exclude_unset=True)
        update_data = {}

        if "items" in payload and payload["items"] is not None:
            items = data.items
            update_data["itemsJson"] = json.dumps([i.dict() for i in items])
            subtotal, iva, total = _calcular_totales(items)
            update_data["importeNeto"] = subtotal
            update_data["iva"] = iva
            update_data["total"] = total

        if "indicadores_hse" in payload and payload["indicadores_hse"] is not None:
            update_data["indicadoresHseJson"] = json.dumps([i.dict() for i in data.indicadores_hse])

        field_map = {
            "cliente_nombre": "clienteNombre",
            "cliente_cuit": "clienteCuit",
            "recurso_nombre": "recursoNombre",
            "recurso_cargo": "recursoTitulo",
            "recurso_matricula": "recursoMatricula",
            "fecha_desde": "fechaDesde",
            "fecha_hasta": "fechaHasta",
            "cantidad_jornadas": "jornadas",
            "horario": "horario",
            "lugar_prestacion": "lugar",
            "alcance_tecnico": "alcanceTexto",
            "entregables": "entregablesTexto",
            "exclusiones": "exclusionesTexto",
            "condiciones_comerciales": "condicionesTexto",
            "vigencia_oferta": "vigenciaOferta",
            "estado": "estado",
        }
        for key, value in payload.items():
            if key in ("items", "indicadores_hse"):
                continue
            prisma_key = field_map.get(key)
            if prisma_key:
                update_data[prisma_key] = value

        presupuesto = await db.presupuestohse.update(where={"id": id}, data=update_data)
        return serialize_presupuesto(presupuesto)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error update_presupuesto: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}")
async def delete_presupuesto(
    id: str,
    current_user: User = Depends(check_super_admin),
    db: Prisma = Depends(get_db)
):
    presupuesto = await db.presupuestohse.find_unique(where={"id": id})
    if not presupuesto:
        raise HTTPException(status_code=404, detail="No encontrado")
    if presupuesto.estado != "BORRADOR":
        raise HTTPException(status_code=400, detail="Solo se pueden eliminar borradores")
    await db.presupuestohse.delete(where={"id": id})
    return {"message": "Eliminado"}


@router.post("/{id}/duplicar")
async def duplicar_presupuesto(
    id: str,
    current_user: User = Depends(check_super_admin),
    db: Prisma = Depends(get_db)
):
    original = await db.presupuestohse.find_unique(where={"id": id})
    if not original:
        raise HTTPException(status_code=404, detail="No encontrado")

    numero, _ = await _siguiente_numero(db)

    nuevo = await db.presupuestohse.create(
        data={
            "numeroCotizacion": numero,
            "clienteNombre": original.clienteNombre,
            "clienteCuit": original.clienteCuit,
            "recursoNombre": original.recursoNombre,
            "recursoTitulo": original.recursoTitulo,
            "recursoMatricula": original.recursoMatricula,
            "fechaDesde": original.fechaDesde,
            "fechaHasta": original.fechaHasta,
            "jornadas": original.jornadas,
            "horario": original.horario,
            "lugar": original.lugar,
            "importeNeto": original.importeNeto,
            "iva": original.iva,
            "total": original.total,
            "itemsJson": original.itemsJson,
            "indicadoresHseJson": original.indicadoresHseJson,
            "vigenciaOferta": original.vigenciaOferta,
            "alcanceTexto": original.alcanceTexto,
            "entregablesTexto": original.entregablesTexto,
            "exclusionesTexto": original.exclusionesTexto,
            "condicionesTexto": original.condicionesTexto,
            "createdBy": current_user.email,
            "estado": "BORRADOR"
        }
    )
    return serialize_presupuesto(nuevo)


@router.post("/{id}/generar-pdf")
async def generar_pdf(
    id: str,
    current_user: User = Depends(check_super_admin),
    db: Prisma = Depends(get_db)
):
    presupuesto = await db.presupuestohse.find_unique(where={"id": id})
    if not presupuesto:
        raise HTTPException(status_code=404, detail="No encontrado")

    items = json.loads(presupuesto.itemsJson) if presupuesto.itemsJson else []
    try:
        indicadores_hse = json.loads(presupuesto.indicadoresHseJson) if presupuesto.indicadoresHseJson else []
    except (json.JSONDecodeError, TypeError):
        indicadores_hse = []
    data = {
        "numero_cotizacion": presupuesto.numeroCotizacion,
        "cliente_nombre": presupuesto.clienteNombre,
        "cliente_cuit": presupuesto.clienteCuit,
        "recurso_nombre": presupuesto.recursoNombre,
        "recurso_titulo": presupuesto.recursoTitulo,
        "recurso_matricula": presupuesto.recursoMatricula,
        "fecha_emision": presupuesto.fechaEmision.strftime('%d/%m/%Y'),
        "fecha_desde": presupuesto.fechaDesde.strftime('%d/%m/%Y'),
        "fecha_hasta": presupuesto.fechaHasta.strftime('%d/%m/%Y'),
        "jornadas": presupuesto.jornadas,
        "horario": presupuesto.horario,
        "lugar": presupuesto.lugar,
        "importe_neto": presupuesto.importeNeto,
        "iva": presupuesto.iva,
        "total": presupuesto.total,
        "items": items,
        "indicadores_hse": indicadores_hse,
        "vigencia_oferta": presupuesto.vigenciaOferta,
        "alcance_texto": presupuesto.alcanceTexto,
        "entregables_texto": presupuesto.entregablesTexto,
        "exclusiones_texto": presupuesto.exclusionesTexto,
        "condiciones_texto": presupuesto.condicionesTexto
    }
    try:
        pdf_bytes = generar_pdf_presupuesto(data)

        if storage_service.is_configured():
            pdf_url = storage_service.upload_bytes(
                pdf_bytes,
                f"presupuestos-hse/{presupuesto.numeroCotizacion}.pdf",
                "application/pdf",
            )
            await db.presupuestohse.update(where={"id": id}, data={"pdfUrl": pdf_url})
        else:
            logger.warning("S3 no configurado: el PDF de presupuesto no se persiste entre deploys")

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="Presupuesto_{presupuesto.numeroCotizacion}.pdf"'
            },
        )
    except Exception as e:
        logger.error(f"Error generar_pdf: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{id}/pdf")
async def descargar_pdf(
    id: str,
    current_user: User = Depends(check_super_admin),
    db: Prisma = Depends(get_db)
):
    from fastapi.responses import RedirectResponse

    presupuesto = await db.presupuestohse.find_unique(where={"id": id})
    if not presupuesto or not presupuesto.pdfUrl:
        raise HTTPException(status_code=404, detail="PDF no encontrado. Generalo primero desde el detalle del presupuesto.")
    return RedirectResponse(presupuesto.pdfUrl)
