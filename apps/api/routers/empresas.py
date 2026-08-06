from fastapi import APIRouter, HTTPException, Depends
from typing import List
from schemas.empresas import EmpresaResponse, CreateEmpresaRequest, UpdateEmpresaRequest
from auth.dependencies import get_current_user
from core.database import prisma

router = APIRouter()

@router.get("/", response_model=List[EmpresaResponse])
async def listar_empresas(current_user=Depends(get_current_user)):
    """Listar todas las empresas (Solo SUPER_ADMIN)"""
    
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
        
    return await prisma.company.find_many(order={"nombre": "asc"})


@router.post("/", response_model=EmpresaResponse)
async def crear_empresa(data: CreateEmpresaRequest, current_user=Depends(get_current_user)):
    """Crear una nueva empresa (Solo SUPER_ADMIN)"""
    
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    # Normalizar CUIT (si ingresan 8 dígitos tipo DNI, anteponer 30 y calcular/pad a 11 dígitos)
    clean_cuit = "".join(filter(str.isdigit, data.cuit))
    if len(clean_cuit) == 8:
        clean_cuit = f"30{clean_cuit}0"
    elif len(clean_cuit) < 11:
        clean_cuit = clean_cuit.zfill(11)
    
    # Verificar CUIT único
    existing = await prisma.company.find_unique(where={"cuit": clean_cuit})
    if existing:
        raise HTTPException(status_code=400, detail=f"El CUIT {clean_cuit} ya está registrado a nombre de '{existing.nombre}'")
        
    empresa = await prisma.company.create(
        data={
            "nombre": data.nombre,
            "cuit": clean_cuit,
            "direccion": data.direccion,
            "telefono": data.telefono,
            "email": data.email,
            "activa": data.activa
        }
    )
    
    return empresa


@router.get("/{id}", response_model=EmpresaResponse)
async def obtener_empresa(id: str, current_user=Depends(get_current_user)):
    """Obtener detalle de una empresa (Solo SUPER_ADMIN)"""
    
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
        
    empresa = await prisma.company.find_unique(where={"id": id})
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
        
    return empresa


@router.put("/{id}", response_model=EmpresaResponse)
async def actualizar_empresa(id: str, data: UpdateEmpresaRequest, current_user=Depends(get_current_user)):
    """Actualizar datos de una empresa (Solo SUPER_ADMIN)"""
    
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
        
    # Verificar existencia
    existing = await prisma.company.find_unique(where={"id": id})
    if not existing:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
        
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    
    empresa = await prisma.company.update(
        where={"id": id},
        data=update_data
    )
    
    return empresa


@router.delete("/{id}")
async def eliminar_empresa(id: str, current_user=Depends(get_current_user)):
    """Eliminar o desactivar empresa (Solo SUPER_ADMIN)"""
    
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")
        
    # Verificar si tiene usuarios
    usuarios_count = await prisma.user.count(where={"empresaId": id})
    
    if usuarios_count > 0:
        # Desactivar en lugar de borrar
        await prisma.company.update(
            where={"id": id},
            data={"activa": False}
        )
        return {"message": "Empresa desactivada porque tiene usuarios asociados"}
        
    await prisma.company.delete(where={"id": id})
    return {"message": "Empresa eliminada exitosamente"}
