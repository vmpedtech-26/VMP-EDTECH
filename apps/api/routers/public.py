"""
Router público para validación de credenciales.
No requiere autenticación.
"""
import re
import unicodedata
from fastapi import APIRouter, HTTPException, status, Request
from services.credential_validator import credential_validator
from middleware.security import rate_limit_public
from core.database import prisma

router = APIRouter()


def slugify(texto: str) -> str:
    """Convierte un nombre de empresa en un slug URL-friendly (sin tildes, minúsculas, guiones)."""
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode("ascii")
    texto = texto.lower().strip()
    texto = re.sub(r"[^a-z0-9]+", "-", texto)
    return texto.strip("-")


@router.get("/empresa/{slug}")
async def obtener_empresa_por_slug(slug: str):
    """
    Resuelve el slug de una empresa (usado en los links de auto-registro
    /registro/{slug}) a sus datos públicos básicos. No requiere autenticación.
    """
    empresas = await prisma.company.find_many(where={"activa": True})
    slug_normalizado = slug.lower().strip()

    for empresa in empresas:
        if slugify(empresa.nombre) == slug_normalizado:
            return {"id": empresa.id, "nombre": empresa.nombre, "slug": slugify(empresa.nombre)}

    raise HTTPException(status_code=404, detail="No encontramos una empresa con ese enlace de registro")


@router.get("/validar/{numero}")
@rate_limit_public()
async def validate_credential(request: Request, numero: str):
    """
    Validar credencial públicamente.
    
    Endpoint público que permite verificar la validez de una credencial
    usando su número único (ej: VMP-2026-00001).
    
    No requiere autenticación.
    """
    try:
        result = await credential_validator.validate_credential(numero)
        return result
    except Exception as e:
        print(f"Error validating credential: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al validar la credencial"
        )

@router.get("/organization/branding")
async def get_org_branding():
    """Branding público de la organización"""
    try:
        branding = await prisma.orgbranding.find_first(where={"activo": True})
        if branding:
            return {
                "id": branding.id, "code": branding.codigo, "name": branding.nombre,
                "brandTag": branding.brandTag, "tagline": branding.tagline,
                "theme": branding.tema, "logoDataUrl": branding.logoUrl, "faviconDataUrl": branding.faviconUrl
            }
    except:
        pass
    return {
        "id": "vmp-org-001", "code": "vmp-edtech", "name": "VMP - EDTECH",
        "brandTag": "VMP", "tagline": "Capacitaciones Profesionales",
        "theme": "light", "logoDataUrl": None, "faviconDataUrl": None
    }
