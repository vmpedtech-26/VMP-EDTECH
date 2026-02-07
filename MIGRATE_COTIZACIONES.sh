#!/bin/bash

# Script para aplicar la migración de Cotizaciones
# VMP Servicios - Backend Integration

set -e

echo "🔄 Aplicando migración de Cotizaciones..."

cd "$(dirname "$0")/apps/api"

# Activar entorno virtual si existe
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Generar migración de Prisma
echo "📝 Generando cliente de Prisma..."
prisma generate

# Aplicar migración a la base de datos
echo "🗄️  Aplicando migración a la base de datos..."
prisma db push

echo "✅ Migración completada exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "  1. Iniciar el backend: cd apps/api && uvicorn main:app --reload"
echo "  2. Iniciar el frontend: cd apps/web && npm run dev"
echo "  3. Probar el formulario en: http://localhost:3000/#cotizar"
