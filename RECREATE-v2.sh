#!/bin/bash

# Script MEJORADO para recrear VMP Servicios sin monorepo
# Versión manual simplificada

echo "🔧 Recreando VMP Servicios Beta (Versión Simplificada)"
echo "======================================================"
echo ""

# Definir directorios
OLD_DIR="/Users/matias/.gemini/antigravity/scratch/vmp-servicios/apps/web"
NEW_DIR="/Users/matias/.gemini/antigravity/scratch/vmp-servicios-simple"

# Paso 1: Crear directorio y copiar todo
echo "📁 Paso 1: Creando directorio y copiando archivos..."
mkdir -p "$NEW_DIR"
cp -r "$OLD_DIR"/* "$NEW_DIR/"

echo "✅ Archivos copiados"
echo ""

# Paso 2: Limpiar e instalar dependencias
echo "📦 Paso 2: Instalando dependencias..."
cd "$NEW_DIR"
rm -rf node_modules package-lock.json
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias"
    echo ""
    echo "Intenta manualmente:"
    echo "  cd $NEW_DIR"
    echo "  npm install --legacy-peer-deps"
    exit 1
fi

echo "✅ Dependencias instaladas correctamente"
echo ""

# Paso 3: Verificar instalación
echo "🔍 Paso 3: Verificando instalación..."
if [ -f "node_modules/.bin/next" ]; then
    echo "✅ Next.js instalado correctamente"
    node_modules/.bin/next --version
else
    echo "❌ Error: Next.js no se instaló"
    exit 1
fi

echo ""
echo "======================================================"
echo "✅ ¡Proyecto recreado exitosamente!"
echo ""
echo "📍 Ubicación: $NEW_DIR"
echo ""
echo "🚀 Para iniciar el servidor:"
echo "   cd $NEW_DIR"
echo "   npm run dev"
echo ""
echo "🌐 Luego abre: http://localhost:3000"
echo "======================================================"
