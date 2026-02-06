#!/bin/bash

echo "🔧 Instalando dependencias del proyecto VMP..."
echo ""

cd /Users/matias/.gemini/antigravity/scratch/vmp-servicios

# Limpiar instalaciones previas
echo "🧹 Limpiando instalaciones previas..."
rm -rf node_modules
rm -rf apps/web/node_modules
rm -rf package-lock.json
rm -rf apps/web/package-lock.json

# Instalar desde la raíz
echo ""
echo "📦 Instalando dependencias (esto puede tomar unos minutos)..."
npm install

echo ""
echo "✅ Instalación completada"
echo ""
echo "Para iniciar el servidor ejecuta:"
echo "  cd /Users/matias/.gemini/antigravity/scratch/vmp-servicios"
echo "  npm run dev"
echo ""
