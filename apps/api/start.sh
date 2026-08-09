#!/bin/sh
# start.sh - Startup script for cloud containers
#
# El código del cliente de Prisma ya se genera una vez durante el build
# (`prisma generate`, ver Build Command en Render) y queda en el venv del
# contenedor -- no hace falta regenerarlo acá. No se invoca el CLI de Prisma
# (fetch/generate) en el arranque: eso dispara "Installing Prisma CLI" vía
# nodeenv y agota los 512MB del plan free de Render en cada deploy.
#
# El Build Command (prisma py fetch + prisma generate, con la env var
# persistente PRISMA_BINARY_CACHE_DIR apuntando a apps/api/.prisma-cache)
# ya deja el binario del query engine en:
#   $PRISMA_BINARY_CACHE_DIR/node_modules/@prisma/engines/query-engine-<platform>
# (nombre SIN el prefijo "prisma-" -- así lo instala el paquete npm "prisma",
# distinto del nombre "prisma-query-engine-<platform>" que el cliente Python
# busca primero en cwd). Copiamos ese binario ya descargado al nombre y
# ubicación exactos que el cliente Python revisa primero, evitando así
# cualquier invocación del CLI de Prisma en el arranque.
#
# NOTA (2026-08-09): confirmado que el binario copiado es un ELF válido y
# funcional (--version responde OK), pero al arrancarlo como servidor el
# proceso muere en silencio (sin traceback, sin código de salida) dentro
# del límite de 512MB/0.15CPU del plan free -- firma característica de un
# OOM-kill del kernel, no un bug de código: correr Uvicorn + el motor de
# Prisma (un segundo proceso en Rust, con su propio pool de conexiones) a
# la vez no entra en ese presupuesto de memoria. La solución de fondo es
# subir el plan de Render (plan Starter o superior).

echo "🚀 Starting VMP API Service..."

echo "📦 Ubicando el binario del Prisma Query Engine ya descargado en el build..."
SRC=$(find "${PRISMA_BINARY_CACHE_DIR:-./.prisma-cache}" -type f -name 'query-engine-*' 2>/dev/null | head -n1)
if [ -n "$SRC" ]; then
    DEST="./prisma-$(basename "$SRC")"
    cp "$SRC" "$DEST"
    chmod +x "$DEST"
    echo "📦 Copiado $SRC -> $DEST"
else
    echo "⚠️  No se encontró el binario del query engine en $PRISMA_BINARY_CACHE_DIR; intentando prisma py fetch como respaldo..."
    python3 -m prisma py fetch || true
    find . -maxdepth 1 -type f -name 'prisma-query-engine-*' -exec chmod +x {} \;
fi

echo "📡 Starting Uvicorn on 0.0.0.0:${PORT:-8000}..."
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}" --proxy-headers --forwarded-allow-ips="*"
