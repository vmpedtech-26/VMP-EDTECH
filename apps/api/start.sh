#!/bin/sh
# start.sh - Resilient startup script for cloud containers

echo "🚀 Starting VMP API Service..."

PYTHON_BIN=$(which python3 || which python)

# 1. Generate Prisma Client
echo "📦 Generating Prisma Client..."
$PYTHON_BIN -m prisma generate || true

# 2. Start Uvicorn Server
echo "📡 Starting Uvicorn on 0.0.0.0:${PORT:-8000}..."
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}" --proxy-headers --forwarded-allow-ips="*"
