#!/bin/bash

# Script de verificación pre-testing para VMP Servicios
# Verifica que todo esté listo para testing local

echo "🔍 Verificando Pre-requisitos para Testing Local..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0

# Function to check command
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅${NC} $1 instalado: $(command -v $1)"
    else
        echo -e "${RED}❌${NC} $1 NO encontrado"
        ((ERRORS++))
    fi
}

# Function to check file
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1 existe"
    else
        echo -e "${YELLOW}⚠️${NC}  $1 NO encontrado"
        ((WARNINGS++))
    fi
}

echo "📦 Verificando Herramientas..."
check_command python3
check_command node
check_command npm
check_command git

echo ""
echo "📁 Verificando Archivos de Configuración..."
check_file "apps/api/.env"
check_file "apps/web/.env.local"
check_file "apps/api/prisma/schema.prisma"
check_file "apps/web/package.json"

echo ""
echo "🔧 Verificando Dependencias Backend..."
if [ -d "apps/api/venv" ]; then
    echo -e "${GREEN}✅${NC} Virtual environment encontrado"
else
    echo -e "${YELLOW}⚠️${NC}  Virtual environment no encontrado (opcional)"
fi

if [ -f "apps/api/requirements.txt" ]; then
    echo -e "${GREEN}✅${NC} requirements.txt existe"
else
    echo -e "${RED}❌${NC} requirements.txt NO encontrado"
    ((ERRORS++))
fi

echo ""
echo "🔧 Verificando Dependencias Frontend..."
if [ -d "apps/web/node_modules" ]; then
    echo -e "${GREEN}✅${NC} node_modules instalado"
else
    echo -e "${YELLOW}⚠️${NC}  node_modules no encontrado - ejecuta: cd apps/web && npm install"
    ((WARNINGS++))
fi

echo ""
echo "📊 Resumen:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Todo listo para testing!${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. cd apps/api && python3 -m venv venv && source venv/bin/activate"
    echo "2. pip install -r requirements.txt"
    echo "3. prisma generate && prisma migrate deploy"
    echo "4. uvicorn main:app --reload"
    echo ""
    echo "En otra terminal:"
    echo "5. cd apps/web && npm install"
    echo "6. npm run dev"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS advertencias encontradas${NC}"
    echo "Puedes continuar pero revisa las advertencias arriba"
else
    echo -e "${RED}❌ $ERRORS errores encontrados${NC}"
    echo "Debes resolver los errores antes de continuar"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
