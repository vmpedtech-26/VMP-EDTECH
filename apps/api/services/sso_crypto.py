import base64
import hashlib

from core.config import settings


def _get_fernet():
    from cryptography.fernet import Fernet

    if not settings.SSO_ENCRYPTION_KEY:
        raise RuntimeError("SSO_ENCRYPTION_KEY no está configurada")

    # Permite usar cualquier string como clave (igual que JWT_SECRET) en vez
    # de exigir una clave Fernet urlsafe-base64 de 32 bytes generada aparte.
    derived_key = base64.urlsafe_b64encode(
        hashlib.sha256(settings.SSO_ENCRYPTION_KEY.encode("utf-8")).digest()
    )
    return Fernet(derived_key)


def encrypt_secret(plaintext: str) -> str:
    return _get_fernet().encrypt(plaintext.encode("utf-8")).decode("utf-8")


def decrypt_secret(ciphertext: str) -> str:
    return _get_fernet().decrypt(ciphertext.encode("utf-8")).decode("utf-8")
