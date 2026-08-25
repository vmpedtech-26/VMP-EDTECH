"""
Servicio para validar credenciales públicamente.
"""
import hmac
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from core.database import prisma
from services.credential_service import calculate_credential_signature


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

        # Verificar firma criptográfica (HMAC-SHA256): detecta si alguien
        # modificó el registro en la base directamente (ej. cambiar el DNI o
        # el curso de una credencial ya emitida). Las credenciales emitidas
        # antes de que existiera este campo no tienen firma -- no se las
        # marca como inválidas por eso, quedan como "not_signed".
        signature_valid: Optional[bool] = None
        signature_status = "not_signed"
        if credencial.firmaCriptografica:
            fecha_emision_str = credencial.fechaEmision.strftime("%Y-%m-%d")
            expected_signature = calculate_credential_signature(
                credencial.numero, credencial.alumnoId, credencial.cursoId, fecha_emision_str
            )
            signature_valid = hmac.compare_digest(expected_signature, credencial.firmaCriptografica)
            signature_status = "verified" if signature_valid else "invalid"

        is_valid = (not is_expired) and (signature_valid is not False)

        if is_expired:
            status = "expired"
        elif signature_valid is False:
            status = "invalid"
        else:
            status = "valid"

        # Preparar respuesta con datos públicos
        return {
            "valid": is_valid,
            "status": status,
            "signatureValid": signature_valid,
            "signatureStatus": signature_status,
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
