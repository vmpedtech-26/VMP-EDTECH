#!/bin/bash

echo "🚀 Iniciando VMP Servicios..."
echo ""

# Verificar si los puertos están en uso
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Puerto 8000 ya está en uso"
    echo "Deteniendo proceso..."
    kill -9 $(lsof -ti:8000)
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Puerto 3000 ya está en uso"
    echo "Deteniendo proceso..."
    kill -9 $(lsof -ti:3000)
fi

echo ""
echo "📦 Iniciando Backend (FastAPI)..."
cd apps/api
python3 -m uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo "✅ Backend iniciado (PID: $BACKEND_PID)"

echo ""
echo "🌐 Iniciando Frontend (Next.js)..."
cd ../web
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Servidores iniciados exitosamente"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🛑 Para detener los servidores:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Presiona Ctrl+C para detener ambos servidores"
echo ""

# Esperar a que se detengan los procesos
wait
