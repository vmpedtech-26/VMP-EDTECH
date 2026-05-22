#!/bin/sh
# start.sh - Professional startup script for Railway

echo "🚀 Starting VMP API Service..."

{
    # 1. Generate Prisma Client (Ensure it matches current environment)
    echo "📦 Generating Prisma Client..."
    python -m prisma generate

    # 2. Try to push database schema (Skip if fails to prevent hang)
    echo "🗄️ Synchronizing database schema..."
    if [ -n "$DATABASE_URL" ]; then
        timeout 30s python -m prisma db push --accept-data-loss || echo "⚠️ Database sync timed out or failed, proceeding anyway..."
    else
        echo "⚠️ DATABASE_URL not set, skipping sync."
    fi

    # 3. Start Celery worker in background (if needed)
    echo "⚙️ Starting Celery worker in background..."
    celery -A core.celery_app worker --loglevel=info &

    # 4. Start the application
    echo "📡 Starting Uvicorn on port ${PORT:-8000}..."
    uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}" --workers 1 --proxy-headers --forwarded-allow-ips="*"
} > crash.log 2>&1

# 5. If anything crashes, start the fallback server so we can read crash.log!
echo "⚠️ Crash detected! Starting fallback server to serve crash.log..."
python fallback_server.py
