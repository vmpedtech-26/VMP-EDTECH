"""
Router público para validación de credenciales.
No requiere autenticación.
"""
from fastapi import APIRouter, HTTPException, status, Request
from services.credential_validator import credential_validator
from middleware.security import rate_limit_public

router = APIRouter()


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
