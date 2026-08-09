#!/bin/sh
# start.sh - Startup script for cloud containers
#
# El código del cliente de Prisma ya se genera una vez durante el build
# (`prisma generate`, ver Build Command en Render) y queda en el venv del
# contenedor -- no hace falta regenerarlo acá.
#
# El binario del query engine SÍ hace falta re-asegurarlo acá: el Build
# Command lo descarga con PRISMA_PY_CACHE_DIR=./.prisma-cache (una ruta
# relativa), pero ese export es local al shell del build y no persiste como
# variable de entorno del proceso en runtime, así que en el arranque Prisma
# lo busca en su cache por default y no lo encuentra (BinaryNotFoundError).
# `prisma py fetch` solo descarga ese binario (liviano); NO se vuelve a
# correr `prisma generate` (esa regeneración completa del cliente vía el
# CLI de Prisma en Node fue lo que agotaba los 512MB del plan free en cada
# arranque).

echo "🚀 Starting VMP API Service..."

echo "📦 Verificando binario del Prisma Query Engine..."
python3 -m prisma py fetch || true

echo "📡 Starting Uvicorn on 0.0.0.0:${PORT:-8000}..."
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}" --proxy-headers --forwarded-allow-ips="*"
