#!/bin/bash

echo "🚀 Iniciando VMP Landing Page..."
echo ""

cd /Users/matias/.gemini/antigravity/scratch/vmp-servicios/apps/web

echo "📦 Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  Instalando dependencias..."
    npm install
fi

echo ""
echo "🌐 Iniciando servidor de desarrollo..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Landing Page: http://localhost:3000/landing"
echo "Dashboard: http://localhost:3000/dashboard/login"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

npm run dev
