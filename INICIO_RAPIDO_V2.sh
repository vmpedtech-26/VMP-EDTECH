#!/bin/bash

# Script de Inicio Rápido - VMP Servicios
# Última actualización: 2 de Febrero 2026

echo "🚀 Iniciando VMP Servicios..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -d "apps/api" ] || [ ! -d "apps/web" ]; then
    echo "❌ Error: Ejecuta este script desde el directorio raíz del proyecto"
    exit 1
fi

# Verificar PostgreSQL
echo "📊 Verificando PostgreSQL..."
if ! netstat -an | grep -q "5433.*LISTEN"; then
    echo "⚠️  PostgreSQL no está corriendo en puerto 5433"
    echo "   Inicia Postgres.app manualmente"
    exit 1
fi
echo "✅ PostgreSQL corriendo en puerto 5433"
echo ""

# Iniciar Backend
echo "🔧 Iniciando Backend (Puerto 8001)..."
cd apps/api

# Verificar que el puerto esté disponible
if lsof -i :8001 > /dev/null 2>&1; then
    echo "⚠️  Puerto 8001 ya está en uso. Deteniendo proceso..."
    lsof -ti :8001 | xargs kill -9 2>/dev/null
    sleep 2
fi

# Iniciar uvicorn en background
nohup uvicorn main:app --port 8001 --reload > ../../backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend iniciado (PID: $BACKEND_PID)"
echo "   Logs: backend.log"
echo ""

# Esperar a que el backend esté listo
echo "⏳ Esperando a que el backend esté listo..."
sleep 3

# Verificar que el backend esté respondiendo
if curl -s http://localhost:8001/health > /dev/null; then
    echo "✅ Backend respondiendo correctamente"
else
    echo "⚠️  Backend no responde. Revisa backend.log"
fi
echo ""

# Iniciar Frontend
echo "🎨 Iniciando Frontend (Puerto 3000)..."
cd ../web

# Verificar que el puerto esté disponible
if lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  Puerto 3000 ya está en uso. Deteniendo proceso..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null
    sleep 2
fi

# Iniciar Next.js en background
nohup npm run dev > ../../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"
echo "   Logs: frontend.log"
echo ""

# Esperar a que el frontend esté listo
echo "⏳ Esperando a que el frontend esté listo..."
sleep 5

echo ""
echo "✅ ¡Todo listo!"
echo ""
echo "📝 Información de acceso:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🔐 Credenciales de prueba:"
echo "   Email:    admin@test.com"
echo "   Password: admin123"
echo ""
echo "📊 PIDs de procesos:"
echo "   Backend:  $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "🛑 Para detener los servidores:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "📋 Logs en tiempo real:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
