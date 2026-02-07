#!/bin/bash

# Script para iniciar Backend y Frontend
# VMP Servicios - Integración Completa

set -e

echo "🚀 Iniciando VMP Servicios..."
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar si un puerto está en uso
check_port() {
    lsof -i :$1 > /dev/null 2>&1
    return $?
}

# Verificar si los puertos están disponibles
if check_port 8000; then
    echo -e "${YELLOW}⚠️  Puerto 8000 ya está en uso (Backend)${NC}"
    echo "   Puedes detener el proceso existente o usar otro puerto"
fi

if check_port 3000; then
    echo -e "${YELLOW}⚠️  Puerto 3000 ya está en uso (Frontend)${NC}"
    echo "   Puedes detener el proceso existente"
fi

echo ""
echo "📋 Instrucciones:"
echo ""
echo "1️⃣  Abre una NUEVA TERMINAL y ejecuta:"
echo -e "${GREEN}   cd $(pwd)/apps/api${NC}"
echo -e "${GREEN}   uvicorn main:app --reload --port 8000${NC}"
echo ""
echo "2️⃣  Abre OTRA TERMINAL y ejecuta:"
echo -e "${GREEN}   cd $(pwd)/apps/web${NC}"
echo -e "${GREEN}   npm run dev${NC}"
echo ""
echo "3️⃣  Abre tu navegador en:"
echo -e "${GREEN}   http://localhost:3000${NC}"
echo ""
echo "4️⃣  Prueba el cotizador en:"
echo -e "${GREEN}   http://localhost:3000/#cotizar${NC}"
echo ""
echo "📚 Documentación completa en:"
echo "   - INICIO_RAPIDO.md"
echo "   - INTEGRACION_BACKEND.md"
echo ""

# Opción para intentar migración
read -p "¿Quieres intentar aplicar la migración de base de datos ahora? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo "🔄 Aplicando migración..."
    cd apps/api
    
    echo "📝 Generando cliente de Prisma..."
    if prisma generate; then
        echo -e "${GREEN}✅ Cliente generado${NC}"
    else
        echo -e "${YELLOW}⚠️  Error al generar cliente${NC}"
    fi
    
    echo "🗄️  Aplicando cambios a la base de datos..."
    if prisma db push; then
        echo -e "${GREEN}✅ Migración completada${NC}"
    else
        echo -e "${YELLOW}⚠️  Error al aplicar migración${NC}"
        echo "   Esto puede ser normal si:"
        echo "   - La base de datos no está accesible"
        echo "   - Ya se aplicó la migración anteriormente"
        echo "   - Necesitas configurar una base de datos local"
        echo ""
        echo "   Puedes continuar sin la migración y aplicarla después"
    fi
    
    cd ../..
fi

echo ""
echo -e "${GREEN}¡Listo para comenzar! 🎉${NC}"
