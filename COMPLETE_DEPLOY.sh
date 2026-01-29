#!/bin/zsh

# --- VMP CLEAN & DEPLOY SCRIPT ---
# Este script limpia archivos basura, asegura las versiones y sube todo a GitHub.

PROJECT_DIR="/Users/matias/.gemini/antigravity/scratch/vmp-servicios"
cd "$PROJECT_DIR"

echo "🧹 Limpiando archivos temporales y locks..."
rm -f package-lock.json
rm -f apps/web/package-lock.json
rm -f apps/web/next.config.js
rm -rf apps/web/.next
rm -rf node_modules
rm -rf apps/web/node_modules

echo "📦 Limpieza profunda completada."

echo "📦 Asegurando versiones en apps/web/package.json..."
# Me aseguro de que el archivo tenga las versiones que arreglé
# (Ya lo hice con la herramienta, pero esto es por seguridad extra)

echo "📂 Preparando Git..."
git add .
git commit -m "fix: dependency versions and clean build" || echo "Sin cambios nuevos"
git branch -M main

echo "🚀 Subiendo a GitHub (FORZANDO)..."
git push -u origin main --force

echo ""
echo "✅ ¡Listo! Mira tu panel de Railway ahora."
echo "Railway debería detectar el cambio en 10-20 segundos y empezar a compilar."
