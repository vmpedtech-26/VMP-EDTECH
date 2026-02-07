#!/bin/bash

# Script de Testing Rápido - VMP Servicios
# Ejecuta verificaciones básicas del sistema

echo "🧪 Testing Rápido - VMP Servicios"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC} - $2"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} - $2"
        ((FAILED++))
    fi
}

echo -e "${BLUE}📦 1. Verificando Estructura del Proyecto${NC}"
[ -d "apps/api" ] && test_result 0 "Directorio apps/api existe" || test_result 1 "Directorio apps/api"
[ -d "apps/web" ] && test_result 0 "Directorio apps/web existe" || test_result 1 "Directorio apps/web"
[ -f "apps/api/.env" ] && test_result 0 "Backend .env configurado" || test_result 1 "Backend .env"
[ -f "apps/web/.env.local" ] && test_result 0 "Frontend .env.local configurado" || test_result 1 "Frontend .env.local"
echo ""

echo -e "${BLUE}📚 2. Verificando Dependencias Backend${NC}"
[ -f "apps/api/requirements.txt" ] && test_result 0 "requirements.txt existe" || test_result 1 "requirements.txt"
[ -f "apps/api/requirements-dev.txt" ] && test_result 0 "requirements-dev.txt existe" || test_result 1 "requirements-dev.txt"
echo ""

echo -e "${BLUE}🎨 3. Verificando Dependencias Frontend${NC}"
[ -f "apps/web/package.json" ] && test_result 0 "package.json existe" || test_result 1 "package.json"
[ -d "apps/web/node_modules" ] && test_result 0 "node_modules instalado" || test_result 1 "node_modules (ejecuta: cd apps/web && npm install)"
echo ""

echo -e "${BLUE}🗄️  4. Verificando Prisma${NC}"
[ -f "apps/api/prisma/schema.prisma" ] && test_result 0 "schema.prisma existe" || test_result 1 "schema.prisma"
[ -d "apps/api/prisma/migrations" ] && test_result 0 "Migraciones existen" || test_result 1 "Migraciones"
echo ""

echo -e "${BLUE}🧪 5. Verificando Tests${NC}"
[ -d "apps/api/tests" ] && test_result 0 "Directorio tests existe" || test_result 1 "Directorio tests"
[ -f "apps/api/tests/conftest.py" ] && test_result 0 "conftest.py existe" || test_result 1 "conftest.py"
[ -f "apps/api/pytest.ini" ] && test_result 0 "pytest.ini configurado" || test_result 1 "pytest.ini"
echo ""

echo -e "${BLUE}📝 6. Verificando Documentación${NC}"
[ -f "README.md" ] && test_result 0 "README.md existe" || test_result 1 "README.md"
[ -f "docs/API.md" ] && test_result 0 "API.md existe" || test_result 1 "API.md"
[ -f "docs/DEPLOYMENT.md" ] && test_result 0 "DEPLOYMENT.md existe" || test_result 1 "DEPLOYMENT.md"
[ -f "CHANGELOG.md" ] && test_result 0 "CHANGELOG.md existe" || test_result 1 "CHANGELOG.md"
echo ""

echo -e "${BLUE}🚀 7. Verificando CI/CD${NC}"
[ -d ".github/workflows" ] && test_result 0 "Workflows directory existe" || test_result 1 "Workflows directory"
[ -f ".github/workflows/test.yml" ] && test_result 0 "test.yml existe" || test_result 1 "test.yml"
[ -f ".github/workflows/deploy-backend.yml" ] && test_result 0 "deploy-backend.yml existe" || test_result 1 "deploy-backend.yml"
echo ""

echo "=================================="
echo -e "📊 Resultados: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}"
echo "=================================="
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ¡Proyecto listo para testing!${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. Instalar dependencias backend:"
    echo "   cd apps/api"
    echo "   python3 -m pip install -r requirements.txt"
    echo "   python3 -m pip install -r requirements-dev.txt"
    echo ""
    echo "2. Configurar base de datos:"
    echo "   prisma generate"
    echo "   prisma migrate deploy"
    echo ""
    echo "3. Ejecutar tests:"
    echo "   pytest tests/ -v --cov=."
    echo ""
    echo "4. Iniciar servidores:"
    echo "   Terminal 1: uvicorn main:app --reload"
    echo "   Terminal 2: cd ../web && npm run dev"
else
    echo -e "${YELLOW}⚠️  Hay $FAILED verificaciones fallidas${NC}"
    echo "Revisa los errores arriba antes de continuar"
fi
