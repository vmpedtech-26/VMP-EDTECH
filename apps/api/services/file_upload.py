import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from typing import Optional
from PIL import Image
import io

from core.config import settings

def compress_image(contents: bytes, file_ext: str, quality: int = 85, max_size: tuple = (800, 800)) -> bytes:
    """
    Comprime y redimensiona una imagen en memoria para ahorrar almacenamiento
    y reducir el consumo de tokens en Gemini Vision.
    Preserva transparencias en imágenes PNG (esencial para firmas).
    """
    try:
        img = Image.open(io.BytesIO(contents))
        
        # Convertir a RGB si se guarda como JPEG
        if file_ext.lower() in [".jpg", ".jpeg"] and img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
            
        # Redimensionar manteniendo relación de aspecto
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        output_buffer = io.BytesIO()
        # Determinar formato de salida
        save_format = "PNG" if file_ext.lower() == ".png" else "JPEG"
        
        if save_format == "JPEG":
            img.save(output_buffer, format=save_format, quality=quality, optimize=True)
        else:
            img.save(output_buffer, format=save_format, optimize=True)
            
        return output_buffer.getvalue()
    except Exception as e:
        print(f"Advertencia al procesar/comprimir imagen con Pillow: {e}")
        return contents # Retornar imagen original si ocurre un fallo
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
            
        # Comprimir y optimizar imagen
        content = compress_image(content, file_ext, quality=85, max_size=(800, 800))
        
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

# --- Firmas de Instructores ---
SIGNATURES_DIR = STORAGE_ROOT / "uploads" / "firmas"

async def save_instructor_signature(file: UploadFile, instructor_id: str) -> str:
    """
    Guardar firma digitalizada del instructor
    """
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Formato no permitido. Use: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    SIGNATURES_DIR.mkdir(parents=True, exist_ok=True)
    
    # Guardamos siempre como png para conservar transparencias
    filename = f"signature_{instructor_id}.png"
    file_path = SIGNATURES_DIR / filename
    
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="Archivo demasiado grande")
            
        # Comprimir y optimizar firma (preservando formato PNG para transparencia)
        content = compress_image(content, ".png", quality=85, max_size=(500, 500))
        
        with open(file_path, "wb") as buffer:
            buffer.write(content)
            
        return f"/uploads/firmas/{filename}"
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error al guardar firma: {str(e)}")

def get_instructor_signature_path(instructor_id: str) -> Optional[Path]:
    SIGNATURES_DIR.mkdir(parents=True, exist_ok=True)
    file_path = SIGNATURES_DIR / f"signature_{instructor_id}.png"
    if file_path.exists():
        return file_path
    return None
