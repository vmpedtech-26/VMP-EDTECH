from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from core.config import settings

# Se usa la librería bcrypt directamente en vez de passlib.CryptContext: el
# self-test interno de passlib (detect_wrap_bug, que corre una sola vez por
# proceso para detectar un bug histórico de bcrypt) rompe con "password
# cannot be longer than 72 bytes" en algunas combinaciones de versión de
# bcrypt -- no tiene relación con las contraseñas reales de los usuarios,
# es un test interno con un string fijo. bcrypt.hashpw/checkpw producen el
# mismo formato de hash estándar ($2b$...) que ya usa passlib, así que es
# compatible con los hashes ya guardados en la base sin migrar nada.
MAX_PASSWORD_BYTES = 72


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    password_bytes = password.encode("utf-8")[:MAX_PASSWORD_BYTES]
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    password_bytes = plain_password.encode("utf-8")[:MAX_PASSWORD_BYTES]
    return bcrypt.checkpw(password_bytes, hashed_password.encode("utf-8"))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT token"""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None
