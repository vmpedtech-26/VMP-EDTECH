#!/bin/zsh

# Script para desplegar desde la ubicación actual
CURRENT_DIR=$(pwd)
echo "🚀 Iniciando proceso de despliegue desde: $CURRENT_DIR"

# 1. Limpieza
echo "🧹 Limpiando archivos innecesarios..."
find . -name "node_modules" -type d -prune -exec rm -rf {} +
find . -name ".next" -type d -prune -exec rm -rf {} +
find . -name "__pycache__" -type d -prune -exec rm -rf {} +

# 2. Inicializar Git si no existe
if [ ! -d ".git" ]; then
    echo "📂 Inicializando Git..."
    git init
    git branch -M main
fi

# 3. Configurar Remote SSH
REMOTE_URL="git@github.com:vmpedtech-26/VMP-EDTECH.git"
echo "🔗 Configurando remote SSH: $REMOTE_URL"
git remote remove origin 2>/dev/null
git remote add origin "$REMOTE_URL"

# Asegurar que se use la llave SSH correcta
git config core.sshCommand "ssh -i /Users/matias/.ssh/vmp_deploy_key -o IdentitiesOnly=yes"

# 4. Agregar y Commit
echo "💾 Guardando cambios..."
git add .
git commit -m "feat: Final deployment preparation - VMP EDTECH Premium"

# 5. Push (Intentar normal, luego informar si falla)
echo "📤 Subiendo a GitHub..."
echo "Nota: Esto puede requerir autenticación si no está configurada."
git push -u origin main --force

echo "✅ Proceso completado localmente."
