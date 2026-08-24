"""
Servicio para validar credenciales públicamente.
"""
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from core.database import prisma


class CredentialValidator:
    """Validador de credenciales públicas"""

    @staticmethod
    def _mask_dni(dni: str) -> str:
        """Enmascara el DNI para la verificación pública: el número de credencial
        es secuencial y adivinable (VMP-2026-00001, 00002...), así que este endpoint
        no requiere autenticación. Exponer el DNI completo permitiría recolectar en
        masa datos de identidad de todos los alumnos certificados."""
        if not dni or len(dni) <= 4:
            return "***"
        return f"***{dni[-4:]}"

    async def validate_credential(self, numero: str) -> Dict[str, Any]:
        """
        Valida una credencial por su número único.
        
        Args:
            numero: Número de credencial (ej: VMP-2026-00001)
            
        Returns:
            Dict con información pública de la credencial
        """
        # Normalizar término de búsqueda
        clean_num = numero.strip().upper()
        raw_code = clean_num.replace('BLT-RT/', '').replace('BLT-RT-', '').replace('VMP-2026-', '').replace('BLT-RT', '')
        
        possible_numbers = [
            clean_num,
            f"BLT-RT/{raw_code}",
            f"BLT-RT-{raw_code}",
            f"VMP-2026-{raw_code}",
            raw_code
        ]
        
        # Buscar credencial
        credencial = await prisma.credencial.find_first(
            where={
                "numero": {
                    "in": possible_numbers
                }
            },
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
            now = datetime.now(timezone.utc)
            vencimiento = credencial.fechaVencimiento if credencial.fechaVencimiento.tzinfo else credencial.fechaVencimiento.replace(tzinfo=timezone.utc)
            is_expired = now > vencimiento
        
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
                    "dni": self._mask_dni(credencial.alumno.dni)
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
