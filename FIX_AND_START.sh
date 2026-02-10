#!/bin/zsh

# --- VMP ULTIMATE STARTUP SCRIPT ---
# Este script limpia puertos, entra a las carpetas y arranca TODO.

PROJECT_DIR="/Users/matias/.gemini/antigravity/scratch/vmp-servicios"

echo "🧹 Limpiando puertos 3000 y 8000..."
lsof -ti :3000,8000 | xargs kill -9 2>/dev/null

echo "📂 Entrando a la carpeta del proyecto..."
cd "$PROJECT_DIR" || { echo "❌ No se encontró la carpeta del proyecto"; exit 1; }

echo "🚀 Lanzando Backend en una nueva pestaña..."
osascript -e "tell application \"Terminal\" to do script \"cd $PROJECT_DIR && npm run dev:api\""

echo "🚀 Lanzando Frontend en una nueva pestaña..."
osascript -e "tell application \"Terminal\" to do script \"cd $PROJECT_DIR && npm run dev\""

echo ""
echo "✅ ¡Listo! Se han abierto dos nuevas terminales."
echo "Espera unos segundos y abre: http://localhost:3000"
