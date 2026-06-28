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


@router.get("/db-push")
async def run_db_push():
    """
    Endpoint temporal para forzar la sincronización del esquema Prisma
    en la base de datos de producción desde el propio contenedor.
    """
    import subprocess
    import sys
    try:
        # Ejecutar prisma db push usando el binario de python del entorno
        result = subprocess.run(
            [sys.executable, "-m", "prisma", "db", "push", "--accept-data-loss"],
            capture_output=True,
            text=True,
            check=True
        )
        return {
            "status": "success",
            "stdout": result.stdout,
            "stderr": result.stderr
        }
    except subprocess.CalledProcessError as e:
        return {
            "status": "error",
            "message": str(e),
            "stdout": e.stdout,
            "stderr": e.stderr
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


@router.get("/debug-auth")
async def debug_auth(email: str = "admin@vmpservicios.com", password: str = "AdminVMP2026!"):
    """
    Endpoint temporal de diagnóstico de autenticación para producción.
    """
    from auth.jwt import verify_password
    from core.database import prisma
    try:
        user = await prisma.user.find_unique(where={"email": email})
        if not user:
            # List all users in DB for debug
            all_users = await prisma.user.find_many(select={"email": True, "rol": True})
            emails = [u.email for u in all_users]
            return {
                "status": "user_not_found",
                "searched_email": email,
                "existing_emails": emails
            }
            
        # Test verify
        is_ok = verify_password(password, user.passwordHash)
        return {
            "status": "user_found",
            "email": user.email,
            "rol": user.rol,
            "hash_in_db": user.passwordHash,
            "verify_result": is_ok,
            "password_tested_len": len(password)
        }
    except Exception as e:
        import traceback
        return {
            "status": "error",
            "error_class": e.__class__.__name__,
            "message": str(e),
            "traceback": traceback.format_exc()
        }


