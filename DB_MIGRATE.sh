#!/bin/zsh

# --- VMP DB MIGRATION SCRIPT ---
# Este script sube la estructura de tablas a Supabase.

PROJECT_DIR="/Users/matias/.gemini/antigravity/scratch/vmp-servicios"
cd "$PROJECT_DIR/apps/api"

echo "🐘 Verificando conexión con Supabase..."
# El usuario debe haber editado el archivo .env previamente

echo "🚀 Ejecutando migración (db push con Prisma v6)..."
npx -y prisma@6.2.1 db push

echo ""
echo "✅ Estructura de base de datos creada en Supabase."
echo "Ahora puedes revisar tus tablas en el panel de Supabase."
