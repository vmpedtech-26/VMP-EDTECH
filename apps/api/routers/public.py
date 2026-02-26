"""
Router público para validación de credenciales.
No requiere autenticación.
"""
from fastapi import APIRouter, HTTPException, status, Request
from services.credential_validator import credential_validator
from middleware.security import rate_limit_public
from core.database import prisma
from typing import List
from schemas.cursos import CursoListItem

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
@router.get("/cursos", response_model=List[CursoListItem])
async def list_public_courses():
    """
    Listar cursos públicos para la landing page.
    Solo muestra cursos activos y que no sean específicos de una empresa.
    """
    try:
        cursos = await prisma.curso.find_many(
            where={
                "activo": True,
                "empresaId": None
            },
            order={"nombre": "asc"}
        )
        return cursos
    except Exception as e:
        print(f"Error listing public courses: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al obtener los cursos"
        )
