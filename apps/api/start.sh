#!/bin/sh
# start.sh - Startup script for cloud containers
#
# El código del cliente de Prisma ya se genera una vez durante el build
# (`prisma generate`, ver Build Command en Render) y queda en el venv del
# contenedor -- no hace falta regenerarlo acá. No se invoca el CLI de Prisma
# (fetch/generate) en el arranque: eso dispara "Installing Prisma CLI" vía
# nodeenv y agota los 512MB del plan free de Render en cada deploy.

echo "🚀 Starting VMP API Service..."

# El Build Command (prisma py fetch + prisma generate, con la env var
# persistente PRISMA_BINARY_CACHE_DIR apuntando a apps/api/.prisma-cache)
# ya deja el binario del query engine en:
#   $PRISMA_BINARY_CACHE_DIR/node_modules/prisma/query-engine-<platform>
# (nombre SIN el prefijo "prisma-" -- así lo instala el paquete npm "prisma",
# que es distinto del nombre "prisma-query-engine-<platform>" que el cliente
# Python busca). En vez de volver a invocar el CLI de Prisma acá (lo que
# dispara "Installing Prisma CLI" vía nodeenv y agota los 512MB del plan
# free), copiamos ese binario ya descargado al nombre y ubicación exactos
# que el cliente Python revisa primero (cwd/prisma-query-engine-<platform>).

echo "📦 Ubicando el binario del Prisma Query Engine ya descargado en el build..."
SRC=$(find "${PRISMA_BINARY_CACHE_DIR:-./.prisma-cache}" -type f -name 'query-engine-*' 2>/dev/null | head -n1)
if [ -n "$SRC" ]; then
    DEST="./prisma-$(basename "$SRC")"
    cp "$SRC" "$DEST"
    chmod +x "$DEST"
    echo "📦 Copiado $SRC -> $DEST"
    echo "🔍 DEBUG file: $(file "$DEST" 2>&1)"
    echo "🔍 DEBUG ls -la: $(ls -la "$DEST" 2>&1)"
    echo "🔍 DEBUG intentando --version:"
    "$DEST" --version 2>&1
    echo "🔍 DEBUG exit code de --version: $?"
else
    echo "⚠️  No se encontró el binario del query engine en $PRISMA_BINARY_CACHE_DIR; intentando prisma py fetch como respaldo..."
    python3 -m prisma py fetch || true
    find . -maxdepth 1 -type f -name 'prisma-query-engine-*' -exec chmod +x {} \;
fi

echo "📡 Starting Uvicorn on 0.0.0.0:${PORT:-8000}..."
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}" --proxy-headers --forwarded-allow-ips="*"
