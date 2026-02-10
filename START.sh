#!/bin/bash

# Script alternativo para iniciar VMP Servicios Beta
# Usa npx para ejecutar Next.js sin necesidad de instalación local

echo "🚀 Iniciando VMP Servicios Beta (modo alternativo)..."
echo ""

cd "$(dirname "$0")/apps/web"

echo "📦 Verificando Node.js..."
node --version

echo ""
echo "🔍 Ejecutando Next.js con npx..."
echo "   (Esto puede tardar un poco la primera vez)"
echo ""

# Usar npx para ejecutar Next.js directamente
npx next@15.1.4 dev --turbopack
