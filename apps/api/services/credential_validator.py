"""
Servicio para validar credenciales públicamente.
"""
from datetime import datetime
from typing import Optional, Dict, Any
from core.database import prisma


class CredentialValidator:
    """Validador de credenciales públicas"""
    
    async def validate_credential(self, numero: str) -> Dict[str, Any]:
        """
        Valida una credencial por su número único.
        
        Args:
            numero: Número de credencial (ej: VMP-2026-00001)
            
        Returns:
            Dict con información pública de la credencial
        """
        # Buscar credencial
        credencial = await prisma.credencial.find_unique(
            where={"numero": numero},
            include={
                "alumno": {
                    "include": {
                        "empresa": True
                    }
                },
                "curso": True
            }
        )
        
        if not credencial:
            return {
                "valid": False,
                "status": "not_found",
                "message": "Credencial no encontrada"
            }
        
        # Verificar expiración
        is_expired = False
        if credencial.fechaVencimiento:
            is_expired = datetime.utcnow() > credencial.fechaVencimiento
        
        # Preparar respuesta con datos públicos
        return {
            "valid": not is_expired,
            "status": "expired" if is_expired else "valid",
            "credential": {
                "numero": credencial.numero,
                "fechaEmision": credencial.fechaEmision.isoformat(),
                "fechaVencimiento": credencial.fechaVencimiento.isoformat() if credencial.fechaVencimiento else None,
                "alumno": {
                    "nombre": credencial.alumno.nombre,
                    "apellido": credencial.alumno.apellido,
                    "dni": credencial.alumno.dni
                },
                "curso": {
                    "nombre": credencial.curso.nombre,
                    "codigo": credencial.curso.codigo,
                    "descripcion": credencial.curso.descripcion
                },
                "empresa": {
                    "nombre": credencial.alumno.empresa.nombre if credencial.alumno.empresa else None,
                    "cuit": credencial.alumno.empresa.cuit if credencial.alumno.empresa else None
                } if credencial.alumno.empresa else None
            }
        }


# Instancia global del validador
credential_validator = CredentialValidator()
