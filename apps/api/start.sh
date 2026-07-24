#!/bin/sh
# start.sh - Resilient startup script for cloud containers

echo "🚀 Starting VMP API Service..."

export PRISMA_PY_CACHE_DIR="$(pwd)/.prisma-cache"
mkdir -p "$PRISMA_PY_CACHE_DIR"

PYTHON_BIN=$(which python3 || which python)

# 1. Fetch Prisma Query Engine Binary & Generate Client
echo "📦 Fetching Prisma Query Engine & Generating Client..."
$PYTHON_BIN -m prisma py fetch || true
$PYTHON_BIN -m prisma generate || true

# 2. Start Uvicorn Server
echo "📡 Starting Uvicorn on 0.0.0.0:${PORT:-8000}..."
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}" --proxy-headers --forwarded-allow-ips="*"
