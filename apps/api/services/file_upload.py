import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from typing import Optional

# Configuración
UPLOAD_DIR = Path("uploads/credenciales")
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

# Crear directorios si no existen
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
EVIDENCE_DIR = Path("uploads/evidencias")
EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)

async def save_credencial_photo(file: UploadFile) -> str:
    # ... existing implementation
    return await save_file(file, UPLOAD_DIR, "/uploads/credenciales")

async def save_evidence_photo(file: UploadFile) -> str:
    """Guardar foto de evidencia y retornar URL"""
    return await save_file(file, EVIDENCE_DIR, "/uploads/evidencias")

async def save_file(file: UploadFile, directory: Path, url_prefix: str) -> str:
    # Validar extensión
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Formato de archivo no permitido. Use: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Leer contenido y validar tamaño
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Archivo demasiado grande. Máximo: {MAX_FILE_SIZE / 1024 / 1024} MB"
        )
    
    # Generar nombre único
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = directory / unique_filename
    
    # Guardar archivo
    with open(file_path, "wb") as f:
        f.write(content)
    
    return f"{url_prefix}/{unique_filename}"


def delete_credencial_photo(file_url: str) -> bool:
    """Eliminar foto de credencial del sistema de archivos"""
    return delete_file(file_url, UPLOAD_DIR)

def delete_evidence_photo(file_url: str) -> bool:
    """Eliminar foto de evidencia del sistema de archivos"""
    return delete_file(file_url, EVIDENCE_DIR)

def delete_file(file_url: str, directory: Path) -> bool:
    try:
        # Extraer filename de URL
        filename = file_url.split("/")[-1]
        file_path = directory / filename
        
        if file_path.exists():
            file_path.unlink()
            return True
        return False
    except Exception:
        return False
