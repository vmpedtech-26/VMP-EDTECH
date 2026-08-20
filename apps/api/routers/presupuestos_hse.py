from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from prisma import Prisma
from prisma.models import User
import logging
import os
import json

from auth.jwt import get_current_user

async def get_db():
    db = Prisma()
    await db.connect()
    try:
        yield db
    finally:
        await db.disconnect()

from services.pdf_presupuesto import generar_pdf_presupuesto
from services.ia_presupuesto import completar_formulario_desde_texto, redactar_alcance, sugerir_tarifas

logger = logging.getLogger(__name__)
router = APIRouter()

# ─── SCHEMAS ───

class ItemPresupuesto(BaseModel):
    codigo: str
    concepto: str
    unidad: str
    cantidad: float
    precio_unitario: float
    importe: float

class PresupuestoCreate(BaseModel):
    cliente_nombre: str
    cliente_cuit: str
    recurso_nombre: str
    recurso_titulo: str = "Técnico en Higiene y Seguridad"
    recurso_matricula: str
    fecha_desde: datetime
    fecha_hasta: datetime
    jornadas: int
    horario: str = "09:00 a 18:00 hs"
    lugar: str
    importe_neto: float
    iva: float
    total: float
    items: List[ItemPresupuesto]
    alcance_texto: Optional[str] = None
    entregables_texto: Optional[str] = None
    exclusiones_texto: Optional[str] = None
    condiciones_texto: Optional[str] = None

class PresupuestoUpdate(BaseModel):
    estado: Optional[str] = None
    cliente_nombre: Optional[str] = None
    cliente_cuit: Optional[str] = None
    recurso_nombre: Optional[str] = None
    recurso_titulo: Optional[str] = None
    recurso_matricula: Optional[str] = None
    fecha_desde: Optional[datetime] = None
    fecha_hasta: Optional[datetime] = None
    jornadas: Optional[int] = None
    horario: Optional[str] = None
    lugar: Optional[str] = None
    importe_neto: Optional[float] = None
    iva: Optional[float] = None
    total: Optional[float] = None
    items: Optional[List[ItemPresupuesto]] = None
    alcance_texto: Optional[str] = None
    entregables_texto: Optional[str] = None
    exclusiones_texto: Optional[str] = None
    condiciones_texto: Optional[str] = None

class IATextoRequest(BaseModel):
    texto: str

class IAAcanceRequest(BaseModel):
    tipo_servicio: str
    datos: dict

class IATarifasRequest(BaseModel):
    tipo_servicio: str

# ─── AUTH DEPENDENCY ───

def check_super_admin(current_user: User = Depends(get_current_user)):
    if current_user.rol.value != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    return current_user


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
        return presupuestos
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
        anio = datetime.now().year
        contador_obj = await db.contadorcotizacion.find_unique(where={"anio": anio})
        if not contador_obj:
            contador_obj = await db.contadorcotizacion.create(data={"anio": anio, "contador": 144})

        nuevo_contador = contador_obj.contador + 1
        await db.contadorcotizacion.update(where={"id": contador_obj.id}, data={"contador": nuevo_contador})
        numero = f"VMP-{anio}-{nuevo_contador}"

        items_json = json.dumps([item.dict() for item in data.items])

        presupuesto = await db.presupuestohse.create(
            data={
                "numeroCotizacion": numero,
                "clienteNombre": data.cliente_nombre,
                "clienteCuit": data.cliente_cuit,
                "recursoNombre": data.recurso_nombre,
                "recursoTitulo": data.recurso_titulo,
                "recursoMatricula": data.recurso_matricula,
                "fechaDesde": data.fecha_desde,
                "fechaHasta": data.fecha_hasta,
                "jornadas": data.jornadas,
                "horario": data.horario,
                "lugar": data.lugar,
                "importeNeto": data.importe_neto,
                "iva": data.iva,
                "total": data.total,
                "itemsJson": items_json,
                "alcanceTexto": data.alcance_texto,
                "entregablesTexto": data.entregables_texto,
                "exclusionesTexto": data.exclusiones_texto,
                "condicionesTexto": data.condiciones_texto,
                "createdBy": current_user.email,
                "estado": "BORRADOR"
            }
        )
        return presupuesto
    except Exception as e:
        logger.error(f"Error create_presupuesto: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/siguiente-numero")
async def siguiente_numero(
    current_user: User = Depends(check_super_admin),
    db: Prisma = Depends(get_db)
):
    try:
        anio = datetime.now().year
        contador_obj = await db.contadorcotizacion.find_unique(where={"anio": anio})
        cont = 144
        if contador_obj:
            cont = contador_obj.contador + 1
        return {"siguiente": f"VMP-{anio}-{cont}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/plantillas")
async def get_plantillas_route(
    current_user: User = Depends(check_super_admin),
    db: Prisma = Depends(get_db)
):
    try:
        plantillas = await db.plantillapresupuesto.find_many(where={"activa": True})
        return plantillas
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ia/completar")
async def ia_completar(
    data: IATextoRequest,
    current_user: User = Depends(check_super_admin),
    db: Prisma = Depends(get_db)
):
    try:
        res = await completar_formulario_desde_texto(data.texto, [])
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ia/redactar-alcance")
async def ia_redactar_alcance(
    data: IAAcanceRequest,
    current_user: User = Depends(check_super_admin),
    db: Prisma = Depends(get_db)
):
    try:
        res = await redactar_alcance(data.tipo_servicio, data.datos)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ia/sugerir-tarifas")
async def ia_sugerir_tarifas(
    data: IATarifasRequest,
    current_user: User = Depends(check_super_admin),
    db: Prisma = Depends(get_db)
):
    try:
        res = await sugerir_tarifas(data.tipo_servicio, [])
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
    return presupuesto


@router.put("/{id}")
async def update_presupuesto(
    id: str,
    data: PresupuestoUpdate,
    current_user: User = Depends(check_super_admin),
    db: Prisma = Depends(get_db)
):
    try:
        update_data = {}
        for key, value in data.dict(exclude_unset=True).items():
            if key == "items":
                update_data["itemsJson"] = json.dumps([i.dict() for i in value])
            elif key == "cliente_nombre":
                update_data["clienteNombre"] = value
            elif key == "cliente_cuit":
                update_data["clienteCuit"] = value
            elif key == "recurso_nombre":
                update_data["recursoNombre"] = value
            elif key == "recurso_titulo":
                update_data["recursoTitulo"] = value
            elif key == "recurso_matricula":
                update_data["recursoMatricula"] = value
            elif key == "fecha_desde":
                update_data["fechaDesde"] = value
            elif key == "fecha_hasta":
                update_data["fechaHasta"] = value
            elif key == "importe_neto":
                update_data["importeNeto"] = value
            elif key == "alcance_texto":
                update_data["alcanceTexto"] = value
            elif key == "entregables_texto":
                update_data["entregablesTexto"] = value
            elif key == "exclusiones_texto":
                update_data["exclusionesTexto"] = value
            elif key == "condiciones_texto":
                update_data["condicionesTexto"] = value
            else:
                update_data[key] = value

        presupuesto = await db.presupuestohse.update(
            where={"id": id},
            data=update_data
        )
        return presupuesto
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

    anio = datetime.now().year
    contador_obj = await db.contadorcotizacion.find_unique(where={"anio": anio})
    if not contador_obj:
        contador_obj = await db.contadorcotizacion.create(data={"anio": anio, "contador": 144})
    nuevo_contador = contador_obj.contador + 1
    await db.contadorcotizacion.update(where={"id": contador_obj.id}, data={"contador": nuevo_contador})
    numero = f"VMP-{anio}-{nuevo_contador}"

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
            "alcanceTexto": original.alcanceTexto,
            "entregablesTexto": original.entregablesTexto,
            "exclusionesTexto": original.exclusionesTexto,
            "condicionesTexto": original.condicionesTexto,
            "createdBy": current_user.email,
            "estado": "BORRADOR"
        }
    )
    return nuevo


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
        "alcance_texto": presupuesto.alcanceTexto,
        "entregables_texto": presupuesto.entregablesTexto,
        "exclusiones_texto": presupuesto.exclusionesTexto,
        "condiciones_texto": presupuesto.condicionesTexto
    }
    try:
        pdf_bytes = generar_pdf_presupuesto(data)
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        storage_dir = os.path.join(base_dir, "storage", "presupuestos")
        os.makedirs(storage_dir, exist_ok=True)
        pdf_path = os.path.join(storage_dir, f"{presupuesto.numeroCotizacion}.pdf")
        with open(pdf_path, "wb") as f:
            f.write(pdf_bytes)
        pdf_url = f"/storage/presupuestos/{presupuesto.numeroCotizacion}.pdf"
        await db.presupuestohse.update(where={"id": id}, data={"pdfUrl": pdf_url})
        return {"message": "PDF generado", "pdf_url": pdf_url}
    except Exception as e:
        logger.error(f"Error generar_pdf: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{id}/pdf")
async def descargar_pdf(
    id: str,
    current_user: User = Depends(check_super_admin),
    db: Prisma = Depends(get_db)
):
    presupuesto = await db.presupuestohse.find_unique(where={"id": id})
    if not presupuesto or not presupuesto.pdfUrl:
        raise HTTPException(status_code=404, detail="PDF no encontrado")
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    file_path = os.path.join(base_dir, presupuesto.pdfUrl.lstrip("/"))
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Archivo físico no encontrado")
    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=f"Presupuesto_{presupuesto.numeroCotizacion}.pdf"
    )
