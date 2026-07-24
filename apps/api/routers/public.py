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
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error validating credential: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al validar la credencial"
        )


@router.get("/db-test")
async def db_test():
    import os, traceback
    db_url = os.environ.get("DATABASE_URL", "NOT_SET")
    safe_url = db_url[:25] + "..." + db_url[-25:] if len(db_url) > 50 else db_url
    try:
        from core.database import prisma, connect_db
        if not prisma.is_connected():
            await connect_db()
        user_count = await prisma.user.count()
        return {
            "status": "ok",
            "connected": prisma.is_connected(),
            "users_count": user_count,
            "db_url_sample": safe_url
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc(),
            "db_url_sample": safe_url
        }


from pydantic import BaseModel

class ZoomSignatureRequest(BaseModel):
    meetingNumber: str
    role: int


@router.post("/zoom-signature")
async def get_zoom_signature(data: ZoomSignatureRequest):
    """
    Generar firma JWT para Zoom Meeting SDK.
    """
    import os
    import time
    from jose import jwt

    sdk_key = os.getenv("ZOOM_SDK_KEY", "TU_ZOOM_SDK_KEY")
    sdk_secret = os.getenv("ZOOM_SDK_SECRET", "TU_ZOOM_SDK_SECRET")

    if not sdk_key or not sdk_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Credenciales de Zoom no configuradas en el servidor"
        )

    try:
        iat = int(time.time()) - 30
        exp = iat + 60 * 60 * 2  # 2 horas de vigencia
        
        payload = {
            "sdkKey": sdk_key,
            "mn": int(data.meetingNumber),
            "role": data.role,
            "iat": iat,
            "exp": exp,
            "tokenExp": exp
        }
        
        # Encriptar la firma usando HS256
        signature = jwt.encode(payload, sdk_secret, algorithm="HS256")
        return {"signature": signature, "sdkKey": sdk_key}
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El número de reunión de Zoom debe contener solo números"
        )
    except Exception as e:
        print(f"Error generating Zoom signature: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al generar la firma de Zoom"
        )
