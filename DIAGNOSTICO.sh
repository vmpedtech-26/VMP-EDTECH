#!/bin/bash

# Script de diagnóstico para VMP Servicios Beta
# Ayuda a identificar problemas de instalación

echo "🔍 Diagnóstico de VMP Servicios Beta"
echo "===================================="
echo ""

echo "1️⃣ Versión de Node.js:"
node --version
echo ""

echo "2️⃣ Versión de npm:"
npm --version
echo ""

echo "3️⃣ Verificando instalación en raíz:"
ls -la node_modules 2>/dev/null | head -3 || echo "❌ No hay node_modules en raíz"
echo ""

echo "4️⃣ Verificando instalación en apps/web:"
ls -la apps/web/node_modules 2>/dev/null | head -3 || echo "❌ No hay node_modules en apps/web"
echo ""

echo "5️⃣ Verificando Next.js en apps/web:"
if [ -f "apps/web/node_modules/.bin/next" ]; then
    echo "✅ Next.js está instalado"
    apps/web/node_modules/.bin/next --version
else
    echo "❌ Next.js NO está instalado en apps/web/node_modules"
fi
echo ""

echo "6️⃣ Verificando package.json de apps/web:"
if [ -f "apps/web/package.json" ]; then
    echo "✅ package.json existe"
    grep '"next"' apps/web/package.json
else
    echo "❌ No se encuentra package.json"
fi
echo ""

echo "7️⃣ Verificando permisos:"
ls -la apps/web/package.json
echo ""

echo "===================================="
echo "📋 Resumen:"
echo ""

if [ -f "apps/web/node_modules/.bin/next" ]; then
    echo "✅ El proyecto parece estar instalado correctamente"
    echo "   Intenta: npm run dev"
else
    echo "❌ Next.js no está instalado"
    echo ""
    echo "Opciones:"
    echo "  A) Usar START.sh (ejecuta con npx, sin instalación)"
    echo "  B) Instalar manualmente: cd apps/web && npm install"
    echo "  C) Recrear proyecto: ./RECREATE.sh"
fi
echo ""
