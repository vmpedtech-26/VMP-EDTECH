#!/bin/sh
# start.sh - Professional startup script for Railway

echo "🚀 Starting VMP API Service..."

# Determine Python / venv
PYTHON_BIN=$(which python3 || which python)
VENV_PYTHON="/opt/venv/bin/python"
if [ -f "$VENV_PYTHON" ]; then
    PYTHON_BIN="$VENV_PYTHON"
    export PATH="/opt/venv/bin:$PATH"
fi

echo "🐍 Using Python: $PYTHON_BIN"
$PYTHON_BIN --version

# 1. Generate Prisma Client (force-regenerate so it works with current Python)
echo "📦 Generating Prisma Client..."
$PYTHON_BIN -m prisma generate || prisma generate || echo "⚠️ Prisma generate failed"

# Verify prisma is importable
$PYTHON_BIN -c "from prisma import Prisma; print('✅ Prisma Client OK')" || {
    echo "❌ Prisma Client still broken, attempting pip install..."
    pip install prisma --quiet
    $PYTHON_BIN -m prisma generate
}

# 2. Sync database schema
echo "🗄️ Synchronizing database schema..."
if [ -n "$DATABASE_URL" ]; then
    timeout 30s $PYTHON_BIN -m prisma db push --accept-data-loss || echo "⚠️ DB sync skipped"
else
    echo "⚠️ DATABASE_URL not set, skipping sync."
fi

# 3. Start Celery worker in background
echo "⚙️ Starting Celery worker in background..."
celery -A core.celery_app worker --loglevel=info &

# 4. Start the application
echo "📡 Starting Uvicorn on port ${PORT:-8000}..."
uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}" --workers 1 --proxy-headers --forwarded-allow-ips="*"

# 5. Fallback if crash
echo "⚠️ Crash detected! Starting fallback server..."
$PYTHON_BIN fallback_server.py
