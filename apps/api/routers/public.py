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

