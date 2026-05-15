import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from typing import Optional

from core.config import settings

# Configuración
STORAGE_ROOT = Path(settings.STORAGE_PATH)
UPLOAD_DIR = STORAGE_ROOT / "uploads" / "credenciales"
EVIDENCIAS_DIR = STORAGE_ROOT / "uploads" / "evidencias"
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

# Directorios (se aseguran en main.py al inicio)
UPLOAD_DIR = STORAGE_ROOT / "uploads" / "credenciales"
EVIDENCIAS_DIR = STORAGE_ROOT / "uploads" / "evidencias"

async def save_credencial_photo(file: UploadFile) -> str:
    """
    Guardar foto de credencial y retornar URL
    
    Args:
        file: Archivo subido desde FastAPI
        
    Returns:
        str: URL del archivo guardado
        
    Raises:
        HTTPException: Si el archivo no es válido
    """
    
    # Validar extensión
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Formato de archivo no permitido. Use: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Generar nombre único
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / filename
    
    # Guardar archivo
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="Archivo demasiado grande")
            
        with open(file_path, "wb") as buffer:
            buffer.write(content)
            
        return f"/uploads/credenciales/{filename}"
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error al guardar archivo: {str(e)}")

async def delete_credencial_photo(file_url: str) -> bool:
    """
    Eliminar foto de credencial
    
    Args:
        file_url: URL de la foto a eliminar
        
    Returns:
        bool: True si se eliminó exitosamente
    """
    try:
        # Extraer filename de URL
        filename = file_url.split("/")[-1]
        file_path = UPLOAD_DIR / filename
        
        if file_path.exists():
            file_path.unlink()
            return True
        return False
    except Exception:
        return False

async def save_evidence_photo(file: UploadFile) -> str:
    """
    Guardar foto de evidencia y retornar URL
    """
    # Validar extensión
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Formato de archivo no permitido. Use: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Generar nombre único
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = EVIDENCIAS_DIR / filename

    # Guardar archivo
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
             raise HTTPException(status_code=400, detail="Archivo demasiado grande")
        
        with open(file_path, "wb") as buffer:
            buffer.write(content)
            
        return f"/uploads/evidencias/{filename}"
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error al guardar archivo: {str(e)}")

async def delete_evidence_photo(file_url: str) -> bool:
    """
    Eliminar foto de evidencia
    """
    try:
        # Extraer filename de URL
        filename = file_url.split("/")[-1]
        file_path = EVIDENCIAS_DIR / filename

        if file_path.exists():
            file_path.unlink()
            return True
        return False
    except Exception:
        return False
