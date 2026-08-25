from fastapi import APIRouter, HTTPException, Depends
from typing import List
from schemas.empresas import EmpresaResponse, CreateEmpresaRequest, UpdateEmpresaRequest
from auth.dependencies import get_current_user
from core.database import prisma
from services.sso_crypto import encrypt_secret


def _con_sso_secret_set(empresa) -> dict:
    """Convierte el objeto Company en dict listo para EmpresaResponse, sin exponer el secret."""
    data = empresa.model_dump() if hasattr(empresa, "model_dump") else empresa.dict()
    data["ssoClientSecretSet"] = bool(getattr(empresa, "ssoClientSecret", None))
    data.pop("ssoClientSecret", None)
    return data

router = APIRouter()

@router.get("", response_model=List[EmpresaResponse])
async def listar_empresas(current_user=Depends(get_current_user)):
    """Listar todas las empresas (Solo SUPER_ADMIN)"""
    
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos")

    empresas = await prisma.company.find_many(order={"nombre": "asc"})
    return [_con_sso_secret_set(e) for e in empresas]


@router.post("", response_model=EmpresaResponse)
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

    return _con_sso_secret_set(empresa)


@router.get("/{id}", response_model=EmpresaResponse)
async def obtener_empresa(id: str, current_user=Depends(get_current_user)):
    """Obtener detalle de una empresa (SUPER_ADMIN, o el propio usuario de esa empresa)"""

    if current_user.rol != "SUPER_ADMIN" and current_user.empresaId != id:
        raise HTTPException(status_code=403, detail="No tienes permisos")


    empresa = await prisma.company.find_unique(where={"id": id})
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    return _con_sso_secret_set(empresa)


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

    # El secret llega en texto plano desde el formulario -- se cifra antes de
    # guardar. Un string vacío se interpreta como "no tocar" (no se pisa el
    # secret ya guardado), igual que cualquier campo omitido.
    if "ssoClientSecret" in update_data:
        plain_secret = update_data.pop("ssoClientSecret")
        if plain_secret:
            update_data["ssoClientSecret"] = encrypt_secret(plain_secret)

    if "ssoDomain" in update_data and update_data["ssoDomain"]:
        update_data["ssoDomain"] = update_data["ssoDomain"].strip().lower()

    try:
        empresa = await prisma.company.update(
            where={"id": id},
            data=update_data
        )
    except Exception as exc:
        if "sso_domain" in str(exc).lower() or "ssoDomain" in str(exc):
            raise HTTPException(
                status_code=400,
                detail="Ese dominio ya está en uso por otra empresa con SSO activo",
            )
        raise

    return _con_sso_secret_set(empresa)


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
