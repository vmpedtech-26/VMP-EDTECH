import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException

from services import storage_service

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

CONTENT_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}


def compress_image(data: bytes, ext: str, quality: int = 80, max_size: tuple = (800, 800)) -> bytes:
    """Redimensiona (manteniendo proporción) y recomprime una imagen en memoria."""
    from io import BytesIO
    from PIL import Image

    img = Image.open(BytesIO(data))
    img.thumbnail(max_size)

    output = BytesIO()
    ext = ext.lower()
    if ext in (".jpg", ".jpeg"):
        if img.mode != "RGB":
            img = img.convert("RGB")
        img.save(output, format="JPEG", quality=quality, optimize=True)
    elif ext == ".webp":
        img.save(output, format="WEBP", quality=quality)
    else:
        img.save(output, format="PNG", optimize=True)

    return output.getvalue()


async def _guardar_imagen(file: UploadFile, carpeta: str) -> str:
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Formato de archivo no permitido. Use: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Archivo demasiado grande. Máximo: {MAX_FILE_SIZE / 1024 / 1024} MB"
        )

    unique_filename = f"{uuid.uuid4()}{file_ext}"
    key = f"{carpeta}/{unique_filename}"
    return storage_service.upload_bytes(content, key, CONTENT_TYPES[file_ext])


async def save_credencial_photo(file: UploadFile) -> str:
    """Guardar foto de credencial y retornar su URL pública."""
    return await _guardar_imagen(file, "credenciales")


def delete_credencial_photo(file_url: str) -> bool:
    """Eliminar foto de credencial del almacenamiento."""
    return storage_service.delete_by_url(file_url)


async def save_evidence_photo(file: UploadFile) -> str:
    """Guardar foto de evidencia de tarea práctica y retornar su URL pública."""
    return await _guardar_imagen(file, "evidencias")


def delete_evidence_photo(file_url: str) -> bool:
    """Eliminar foto de evidencia del almacenamiento."""
    return storage_service.delete_by_url(file_url)
