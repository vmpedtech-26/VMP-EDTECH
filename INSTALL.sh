#!/bin/bash

# Script de instalación para VMP Servicios Beta
# Este script instala todas las dependencias del monorepo

echo "🔧 Instalando dependencias de VMP Servicios Beta..."
echo ""

# Navegar al directorio raíz del proyecto
cd "$(dirname "$0")"

echo "📦 Limpiando instalaciones previas..."
rm -rf node_modules
rm -rf apps/web/node_modules
rm -rf package-lock.json
rm -rf apps/web/package-lock.json

echo ""
echo "📥 Instalando dependencias del workspace raíz..."
npm install

echo ""
echo "📥 Instalando dependencias del frontend (apps/web)..."
cd apps/web
npm install

echo ""
echo "✅ ¡Instalación completada!"
echo ""
echo "Para iniciar el servidor, ejecuta:"
echo "  npm run dev"
echo ""
echo "O desde la raíz del proyecto:"
echo "  cd ../.."
echo "  npm run dev"
