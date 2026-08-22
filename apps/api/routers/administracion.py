from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from auth.dependencies import get_current_user, require_super_admin
from core.database import prisma

router = APIRouter()

# ========== SECTORES ==========
class SectorCreate(BaseModel):
    nombre: str

@router.get("/sectors")
async def list_sectors(current_user=Depends(get_current_user)):
    items = await prisma.sector.find_many(where={"activo": True}, order_by={"nombre": "asc"})
    return {"items": [{"id": i.id, "nombre": i.nombre} for i in items]}

@router.post("/sectors")
async def create_sector(data: SectorCreate, current_user=Depends(require_super_admin)):
    item = await prisma.sector.create(data={"nombre": data.nombre})
    return item

@router.delete("/sectors/{id}")
async def delete_sector(id: str, current_user=Depends(require_super_admin)):
    await prisma.sector.update(where={"id": id}, data={"activo": False})
    return {"ok": True}

# ========== PUESTOS ==========
class PuestoCreate(BaseModel):
    nombre: str
    sectorId: Optional[str] = None

@router.get("/job-positions")
async def list_puestos(current_user=Depends(get_current_user)):
    items = await prisma.puesto.find_many(where={"activo": True}, include={"sector": True}, order_by={"nombre": "asc"})
    return {"items": [{"id": i.id, "nombre": i.nombre, "sector": {"nombre": i.sector.nombre} if i.sector else None} for i in items]}

@router.post("/job-positions")
async def create_puesto(data: PuestoCreate, current_user=Depends(require_super_admin)):
    item = await prisma.puesto.create(data={"nombre": data.nombre, "sectorId": data.sectorId})
    return item

@router.delete("/job-positions/{id}")
async def delete_puesto(id: str, current_user=Depends(require_super_admin)):
    await prisma.puesto.update(where={"id": id}, data={"activo": False})
    return {"ok": True}

# ========== LOCALIDADES ==========
class LocalidadCreate(BaseModel):
    nombre: str
    provincia: Optional[str] = None

@router.get("/service-locations")
async def list_localidades(current_user=Depends(get_current_user)):
    items = await prisma.localidad.find_many(where={"activo": True}, order_by={"nombre": "asc"})
    return {"items": [{"id": i.id, "nombre": i.nombre, "provincia": i.provincia} for i in items]}

@router.post("/service-locations")
async def create_localidad(data: LocalidadCreate, current_user=Depends(require_super_admin)):
    item = await prisma.localidad.create(data={"nombre": data.nombre, "provincia": data.provincia})
    return item

@router.delete("/service-locations/{id}")
async def delete_localidad(id: str, current_user=Depends(require_super_admin)):
    await prisma.localidad.update(where={"id": id}, data={"activo": False})
    return {"ok": True}

# ========== ÁREAS OPERATIVAS ==========
class AreaCreate(BaseModel):
    nombre: str

@router.get("/operational-areas")
async def list_areas(current_user=Depends(get_current_user)):
    items = await prisma.areaoperativa.find_many(where={"activo": True}, order_by={"nombre": "asc"})
    return {"items": [{"id": i.id, "nombre": i.nombre} for i in items]}

@router.post("/operational-areas")
async def create_area(data: AreaCreate, current_user=Depends(require_super_admin)):
    item = await prisma.areaoperativa.create(data={"nombre": data.nombre})
    return item

@router.delete("/operational-areas/{id}")
async def delete_area(id: str, current_user=Depends(require_super_admin)):
    await prisma.areaoperativa.update(where={"id": id}, data={"activo": False})
    return {"ok": True}

# ========== COURSES ADMIN ==========
@router.get("/courses")
async def list_courses_admin(current_user=Depends(get_current_user)):
    cursos = await prisma.curso.find_many(order_by={"nombre": "asc"})
    return {"items": [{"id": c.id, "nombre": c.nombre, "codigo": c.codigo, "activo": c.activo, "duracionHoras": c.duracionHoras} for c in cursos]}

# ========== USERS ADMIN ==========
@router.get("/users")
async def list_users_admin(current_user=Depends(require_super_admin)):
    users = await prisma.user.find_many(include={"empresa": True}, order_by={"nombre": "asc"})
    return {"items": [{"id": u.id, "nombre": f"{u.nombre} {u.apellido}", "email": u.email, "rol": u.rol, "activo": u.activo, "empresa": u.empresa.nombre if u.empresa else None} for u in users]}

# ========== APPEARANCE ==========
@router.get("/appearance")
async def get_appearance(current_user=Depends(get_current_user)):
    try:
        branding = await prisma.orgbranding.find_first(where={"activo": True})
        if branding:
            return {"nombre": branding.nombre, "brandTag": branding.brandTag, "tagline": branding.tagline, "tema": branding.tema, "colorPrimario": branding.colorPrimario}
    except:
        pass
    return {"nombre": "VMP - EDTECH", "brandTag": "VMP", "tagline": "Capacitaciones Profesionales", "tema": "light", "colorPrimario": "#3AAFA9"}

class AppearanceUpdate(BaseModel):
    nombre: Optional[str] = None
    brandTag: Optional[str] = None
    tagline: Optional[str] = None
    tema: Optional[str] = None
    colorPrimario: Optional[str] = None

@router.patch("/appearance")
async def update_appearance(data: AppearanceUpdate, current_user=Depends(require_super_admin)):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    try:
        existing = await prisma.orgbranding.find_first(where={"activo": True})
        if existing:
            updated = await prisma.orgbranding.update(where={"id": existing.id}, data=update_data)
        else:
            updated = await prisma.orgbranding.create(data={"nombre": update_data.get("nombre", "VMP - EDTECH"), "codigo": "vmp", **update_data})
        return updated
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
