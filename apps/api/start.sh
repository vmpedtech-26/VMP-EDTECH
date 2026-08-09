#!/bin/sh
# start.sh - Startup script for cloud containers
#
# El cliente de Prisma ya se genera una vez durante el build (`prisma generate`,
# ver build command). Volver a hacer `prisma py fetch` + `prisma generate` en
# cada arranque es redundante -- descarga binarios y genera el cliente de nuevo
# usando memoria extra en un momento en el que el proceso ya está compitiendo
# por RAM con uvicorn arrancando, y en el plan free de Render (512MB) eso
# alcanza a tirar el proceso por Out Of Memory en cada deploy.

echo "🚀 Starting VMP API Service..."

echo "📡 Starting Uvicorn on 0.0.0.0:${PORT:-8000}..."
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}" --proxy-headers --forwarded-allow-ips="*"
