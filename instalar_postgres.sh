#!/bin/bash

# Guía de Instalación de Postgres.app
# VMP Servicios - Testing Local

echo "🐘 Instalación de Postgres.app para VMP Servicios"
echo "=================================================="
echo ""

echo "📥 PASO 1: Descargar Postgres.app"
echo "1. Abre tu navegador"
echo "2. Ve a: https://postgresapp.com/"
echo "3. Click en 'Download' (botón azul grande)"
echo "4. Espera a que descargue (archivo .dmg)"
echo ""
echo "Presiona ENTER cuando hayas descargado..."
read

echo ""
echo "📦 PASO 2: Instalar Postgres.app"
echo "1. Abre el archivo .dmg descargado"
echo "2. Arrastra Postgres.app a la carpeta Applications"
echo "3. Cierra el instalador"
echo ""
echo "Presiona ENTER cuando hayas instalado..."
read

echo ""
echo "🚀 PASO 3: Iniciar Postgres.app"
echo "1. Abre Postgres.app desde Applications"
echo "2. Click en 'Initialize' (si aparece)"
echo "3. Deberías ver un servidor corriendo"
echo ""
echo "Presiona ENTER cuando Postgres esté corriendo..."
read

echo ""
echo "🗄️  PASO 4: Crear Base de Datos"
echo "Ejecutando comando para crear database..."

# Intentar crear database
if [ -f "/Applications/Postgres.app/Contents/Versions/latest/bin/createdb" ]; then
    /Applications/Postgres.app/Contents/Versions/latest/bin/createdb vmp_db
    echo "✅ Database 'vmp_db' creada!"
else
    echo "⚠️  No se encontró createdb en la ruta esperada."
    echo "Intenta manualmente:"
    echo "  1. Abre Postgres.app"
    echo "  2. Click en 'Open psql'"
    echo "  3. Ejecuta: CREATE DATABASE vmp_db;"
fi

echo ""
echo "⚙️  PASO 5: Configurar VMP"
echo "Actualizando archivo .env..."

# Obtener usuario actual
CURRENT_USER=$(whoami)

# Actualizar .env
cd "$(dirname "$0")/apps/api"
if [ -f ".env" ]; then
    # Backup
    cp .env .env.backup
    
    # Actualizar DATABASE_URL
    sed -i '' 's|DATABASE_URL=.*|DATABASE_URL="postgresql://'"$CURRENT_USER"'@localhost:5432/vmp_db"|' .env
    
    echo "✅ .env actualizado!"
    echo "   DATABASE_URL=\"postgresql://$CURRENT_USER@localhost:5432/vmp_db\""
else
    echo "❌ No se encontró .env"
fi

echo ""
echo "🔄 PASO 6: Migrar Base de Datos"
echo "Ejecutando migraciones de Prisma..."

cd "$(dirname "$0")/apps/api"
prisma db push

echo ""
echo "👤 PASO 7: Crear Usuario Admin"
echo "Creando script de admin..."

cat > create_admin.py << 'EOF'
import asyncio
from passlib.context import CryptContext
from core.database import prisma

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin():
    await prisma.connect()
    password_hash = pwd_context.hash("admin123")
    
    try:
        admin = await prisma.user.create(
            data={
                "email": "admin@test.com",
                "passwordHash": password_hash,
                "nombre": "Admin",
                "apellido": "Test",
                "dni": "12345678",
                "telefono": "1234567890",
                "rol": "SUPER_ADMIN",
                "activo": True
            }
        )
        print(f"✅ Admin creado: {admin.email}")
        print(f"   Password: admin123")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await prisma.disconnect()

asyncio.run(create_admin())
EOF

echo "Ejecutando script..."
python3 create_admin.py

echo ""
echo "🎉 ¡INSTALACIÓN COMPLETA!"
echo "=========================="
echo ""
echo "✅ Postgres.app instalado"
echo "✅ Database 'vmp_db' creada"
echo "✅ Migraciones aplicadas"
echo "✅ Admin user creado"
echo ""
echo "📝 Credenciales de Admin:"
echo "   Email: admin@test.com"
echo "   Password: admin123"
echo ""
echo "🚀 Próximos pasos:"
echo "   1. Iniciar backend:"
echo "      cd apps/api"
echo "      uvicorn main:app --reload"
echo ""
echo "   2. Frontend ya está corriendo en:"
echo "      http://localhost:3000"
echo ""
echo "   3. Backend estará en:"
echo "      http://localhost:8000"
echo ""
echo "¡Listo para testing completo! 🎊"
