"""
Almacenamiento de archivos (fotos de credencial, evidencias, PDFs de
credenciales) en un backend S3-compatible (Cloudflare R2, AWS S3, etc.).

En Render (plan free) el disco del contenedor es efímero -- todo lo que no
esté bajo el código fuente se pierde en cada deploy -- y además nunca hubo
un StaticFiles montado para servir esos archivos vía HTTP, así que las
URLs guardadas en la base (/storage/..., /uploads/...) nunca respondieron
nada. Por eso los archivos se suben directamente a un bucket S3-compatible
y se guarda su URL pública real.

boto3 se importa recién adentro de las funciones (no a nivel de módulo):
es una librería pesada y en el plan free de Render ese margen de memoria
le hace falta al motor de Prisma durante el arranque.
"""
from core.config import settings

_client = None


def is_configured() -> bool:
    return bool(
        settings.S3_ENDPOINT_URL
        and settings.S3_ACCESS_KEY_ID
        and settings.S3_SECRET_ACCESS_KEY
        and settings.S3_BUCKET_NAME
    )


def _get_client():
    global _client
    if _client is None:
        import boto3
        from botocore.client import Config as BotoConfig

        _client = boto3.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT_URL,
            aws_access_key_id=settings.S3_ACCESS_KEY_ID,
            aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY,
            config=BotoConfig(signature_version="s3v4"),
            region_name=settings.S3_REGION,
        )
    return _client


def _public_base_url() -> str:
    base = settings.S3_PUBLIC_URL_BASE or f"{settings.S3_ENDPOINT_URL}/{settings.S3_BUCKET_NAME}"
    return base.rstrip("/")


def upload_bytes(data: bytes, key: str, content_type: str) -> str:
    """Sube un archivo al bucket configurado y devuelve su URL pública."""
    if not is_configured():
        raise RuntimeError(
            "Almacenamiento de archivos no configurado. Definí S3_ENDPOINT_URL, "
            "S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY y S3_BUCKET_NAME en las "
            "variables de entorno del servidor."
        )
    client = _get_client()
    client.put_object(
        Bucket=settings.S3_BUCKET_NAME,
        Key=key,
        Body=data,
        ContentType=content_type,
    )
    return f"{_public_base_url()}/{key}"


def delete_by_url(url: str) -> bool:
    """Borra el objeto correspondiente a una URL pública previamente devuelta por upload_bytes."""
    if not is_configured() or not url:
        return False
    try:
        base = _public_base_url()
        key = url[len(base):].lstrip("/") if url.startswith(base) else url.split("/")[-1]
        _get_client().delete_object(Bucket=settings.S3_BUCKET_NAME, Key=key)
        return True
    except Exception:
        return False
