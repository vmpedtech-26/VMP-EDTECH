#!/bin/zsh

PROJECT_DIR="/Users/matias/.gemini/antigravity/scratch/vmp-servicios"
cd "$PROJECT_DIR"

echo "🔍 Verificando estado del proyecto..."
if [ ! -d "apps/api" ] || [ ! -d "apps/web" ]; then
    echo "❌ Error: No se encuentran las carpetas de las apps."
    exit 1
fi

echo "🧹 Limpiando archivos temporales y builds previos..."
rm -f package-lock.json 2>/dev/null
rm -f apps/web/package-lock.json 2>/dev/null
rm -rf apps/web/.next 2>/dev/null
rm -rf node_modules 2>/dev/null
rm -rf apps/web/node_modules 2>/dev/null

echo "📦 Asegurando Prisma Client..."
cd apps/api && prisma generate && cd ../..

echo "📂 Preparando Git..."
git add .
git commit -m "chore: deployment prep - final polish and documentation" || echo "Sin cambios nuevos"
git branch -M main

echo "🚀 Subiendo a GitHub..."
# Nota: Si es la primera vez, el usuario deberá tener configurado el remote origin
git push -u origin main

echo ""
echo "✅ ¡Listo! El código está en GitHub."
echo "Próximos pasos:"
echo "1. Revisa DEPLOYMENT_CHECKLIST.md para configurar Railway y Vercel."
echo "2. Asegúrate de configurar las variables de entorno en tus paneles de control."
echo "3. ¡VMP Servicios está listo para el mundo!"
