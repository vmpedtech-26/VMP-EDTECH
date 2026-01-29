#!/bin/bash

# Script para recrear VMP Servicios Beta sin monorepo
# Esto crea un proyecto Next.js estándar más simple

echo "🔧 Recreando VMP Servicios Beta (estructura simplificada)..."
echo ""

# Crear directorio para el nuevo proyecto
NEW_DIR="/Users/matias/.gemini/antigravity/scratch/vmp-servicios-simple"

if [ -d "$NEW_DIR" ]; then
    echo "⚠️  El directorio $NEW_DIR ya existe."
    read -p "¿Quieres eliminarlo y recrearlo? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        rm -rf "$NEW_DIR"
    else
        echo "❌ Cancelado."
        exit 1
    fi
fi

echo "📦 Creando nuevo proyecto con Next.js..."
npx -y create-next-app@15.1.4 "$NEW_DIR" \
    --typescript \
    --tailwind \
    --app \
    --no-src-dir \
    --import-alias "@/*" \
    --turbopack

echo ""
echo "📋 Copiando componentes y código existente..."

# Copiar componentes
cp -r /Users/matias/.gemini/antigravity/scratch/vmp-servicios/apps/web/components "$NEW_DIR/"
cp -r /Users/matias/.gemini/antigravity/scratch/vmp-servicios/apps/web/lib "$NEW_DIR/"
cp -r /Users/matias/.gemini/antigravity/scratch/vmp-servicios/apps/web/types "$NEW_DIR/"

# Copiar app (páginas)
cp -r /Users/matias/.gemini/antigravity/scratch/vmp-servicios/apps/web/app/* "$NEW_DIR/app/"

# Copiar configs
cp /Users/matias/.gemini/antigravity/scratch/vmp-servicios/apps/web/tailwind.config.ts "$NEW_DIR/"
cp /Users/matias/.gemini/antigravity/scratch/vmp-servicios/apps/web/next.config.ts "$NEW_DIR/"

echo ""
echo "✅ Proyecto recreado exitosamente!"
echo ""
echo "Para iniciar:"
echo "  cd $NEW_DIR"
echo "  npm run dev"
echo ""
