import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from typing import Optional

# Configuración
UPLOAD_DIR = Path("uploads/credenciales")
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

# Crear directorio si no existe
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

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
    
    # Leer contenido y validar tamaño
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Archivo demasiado grande. Máximo: {MAX_FILE_SIZE / 1024 / 1024} MB"
        )
    
    # Generar nombre único
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Guardar archivo
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Retornar URL (ajustar según tu configuración de static files)
    # Por ahora retornamos path relativo
    return f"/uploads/credenciales/{unique_filename}"


def delete_credencial_photo(file_url: str) -> bool:
    """
    Eliminar foto de credencial del sistema de archivos
    
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
