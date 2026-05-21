#!/bin/sh
# start.sh - Professional startup script for Railway
set -e

echo "🚀 Starting VMP API Service..."

# 1. Generate Prisma Client (Ensure it matches current environment)
echo "📦 Generating Prisma Client..."
python -m prisma generate

# 2. Try to push database schema (Skip if fails to prevent hang)
# We use a timeout to prevent infinite hanging
echo "🗄️ Synchronizing database schema..."
if [ -n "$DATABASE_URL" ]; then
    # Run db push with a 30s timeout
    timeout 30s python -m prisma db push --accept-data-loss || echo "⚠️ Database sync timed out or failed, proceeding anyway..."
else
    echo "⚠️ DATABASE_URL not set, skipping sync."
fi

# 3. Start Celery worker in background (if needed)
echo "⚙️ Starting Celery worker in background..."
celery -A core.celery_app worker --loglevel=info &

# 4. Start the application
echo "📡 Starting Uvicorn on port ${PORT:-8000}..."
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1 --proxy-headers --forwarded-allow-ips="*"
