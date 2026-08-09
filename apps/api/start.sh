#!/bin/sh
# start.sh - Startup script for cloud containers
#
# El código del cliente de Prisma ya se genera una vez durante el build
# (`prisma generate`, ver Build Command en Render) y queda en el venv del
# contenedor -- no hace falta regenerarlo acá.
#
# El binario del query engine se descarga en el build hacia la carpeta que
# indica la env var persistente PRISMA_BINARY_CACHE_DIR (dentro de apps/api,
# para que sobreviva al pasaje de build a runtime). `prisma py fetch` acá
# solo verifica que siga estando (no debería re-descargar nada si ya está).
# NO se vuelve a correr `prisma generate` (esa regeneración completa del
# cliente vía el CLI de Prisma en Node fue lo que agotaba los 512MB del plan
# free en cada arranque).
#
# El binario a veces pierde el bit de ejecución al persistir del build al
# runtime -- nos aseguramos de que quede ejecutable antes de arrancar.

echo "🚀 Starting VMP API Service..."

# --- DIAGNÓSTICO TEMPORAL: sacar una vez resuelto el problema de arranque ---
# NO usar `find /` (cuelga el arranque en este entorno) -- solo miramos las
# carpetas puntuales donde puede estar el binario.
echo "🔍 DEBUG pwd=$(pwd)"
echo "🔍 DEBUG PRISMA_BINARY_CACHE_DIR=$PRISMA_BINARY_CACHE_DIR"
for d in "." "$PRISMA_BINARY_CACHE_DIR" "$HOME/.cache/prisma-python" "/opt/render/.cache/prisma-python"; do
    if [ -n "$d" ] && [ -d "$d" ]; then
        echo "🔍 DEBUG contenido de $d (hasta 3 niveles):"
        find "$d" -maxdepth 3 2>/dev/null
    else
        echo "🔍 DEBUG $d no existe"
    fi
done
# --- FIN DIAGNÓSTICO TEMPORAL ---

echo "📦 Verificando binario del Prisma Query Engine..."
timeout 20 python3 -m prisma py fetch || echo "🔍 DEBUG prisma py fetch fallo o tardo demasiado (exit $?)"

if [ -n "$PRISMA_BINARY_CACHE_DIR" ] && [ -d "$PRISMA_BINARY_CACHE_DIR" ]; then
    find "$PRISMA_BINARY_CACHE_DIR" -type f -name 'prisma-query-engine-*' -exec chmod +x {} \;
fi
find . -maxdepth 1 -type f -name 'prisma-query-engine-*' -exec chmod +x {} \;

echo "📡 Starting Uvicorn on 0.0.0.0:${PORT:-8000}..."
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}" --proxy-headers --forwarded-allow-ips="*"
