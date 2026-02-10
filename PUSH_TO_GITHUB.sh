#!/bin/zsh
cd /Users/matias/.gemini/antigravity/scratch/vmp-servicios
echo "🔍 Verificando carpeta..."
pwd
echo "🚀 Inicializando Git..."
rm -rf .git
git init
git add .
git commit -m "feat: rebrand to Credencial/Instructor, UI improvements and remove landing section"
git branch -M main
git remote add origin https://github.com/MNEerty99/VMP---EDTECH.git
echo "✅ Git configurado. Intentando subir (forzando actualización)..."
git push -u origin main --force
