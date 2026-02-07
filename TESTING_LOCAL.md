# 🧪 Guía de Testing Local Exhaustivo - VMP Servicios

**Versión**: 1.0.0  
**Fecha**: 02/02/2026  
**Objetivo**: Verificar que todo funciona correctamente antes del deployment

---

## 📋 Pre-requisitos

### 1. Verificar Instalaciones

```bash
# Python 3.11+
python --version

# Node.js 18+
node --version

# PostgreSQL
psql --version

# Git
git --version
```

### 2. Variables de Entorno

#### Backend (`apps/api/.env`)
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/vmp_db"
SECRET_KEY="your-secret-key-change-in-production"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
FRONTEND_URL="http://localhost:3000"

# Email (SendGrid)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
EMAIL_FROM="noreply@vmpservicios.com"
EMAIL_VENTAS="ventas@vmpservicios.com"

# Admin
ADMIN_URL="http://localhost:3000/dashboard/super"
```

#### Frontend (`apps/web/.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🗄️ Paso 1: Configurar Base de Datos

### Crear Database

```bash
# Conectar a PostgreSQL
psql postgres

# Crear database
CREATE DATABASE vmp_db;

# Crear usuario (opcional)
CREATE USER vmp_user WITH PASSWORD 'vmp_password';
GRANT ALL PRIVILEGES ON DATABASE vmp_db TO vmp_user;

# Salir
\q
```

### Ejecutar Migraciones

```bash
cd apps/api

# Generar Prisma client
prisma generate

# Ejecutar migraciones
prisma migrate deploy

# Verificar
prisma studio
# Debe abrir en http://localhost:5555
```

---

## 👤 Paso 2: Crear Usuario Admin de Prueba

### Opción A: Script Python

```bash
cd apps/api

# Crear script
cat > create_admin.py << 'EOF'
import asyncio
from passlib.context import CryptContext
from core.database import prisma

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin():
    await prisma.connect()
    
    # Hash password
    password_hash = pwd_context.hash("admin123")
    
    # Create admin
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
    
    print(f"✅ Admin created: {admin.email}")
    await prisma.disconnect()

asyncio.run(create_admin())
EOF

# Ejecutar
python create_admin.py
```

### Opción B: SQL Directo

```sql
-- Conectar a la base de datos
psql vmp_db

-- Insertar admin (password: admin123)
INSERT INTO users (
  id, email, password_hash, nombre, apellido,
  dni, telefono, rol, activo
) VALUES (
  gen_random_uuid(),
  'admin@test.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKVqKqK6',
  'Admin',
  'Test',
  '12345678',
  '1234567890',
  'SUPER_ADMIN',
  true
);
```

---

## 🧪 Paso 3: Tests Automatizados

### Backend Tests

```bash
cd apps/api

# Instalar dependencias de testing
pip install -r requirements-dev.txt

# Ejecutar todos los tests
pytest tests/ -v

# Con coverage
pytest tests/ -v --cov=. --cov-report=html

# Ver coverage report
open htmlcov/index.html
```

**Resultado esperado**:
```
tests/test_auth.py::TestAuth::test_login_success PASSED
tests/test_auth.py::TestAuth::test_login_invalid_credentials PASSED
tests/test_auth.py::TestAuth::test_get_current_user PASSED
tests/test_cotizaciones.py::TestCotizaciones::test_create_cotizacion PASSED
tests/test_public.py::TestPublic::test_health_check PASSED

Coverage: >80%
```

---

## 🚀 Paso 4: Iniciar Servidores

### Terminal 1 - Backend

```bash
cd apps/api

# Activar entorno virtual (si usas)
source venv/bin/activate

# Iniciar servidor
uvicorn main:app --reload --port 8000
```

**Verificar**:
- ✅ Server running at: http://127.0.0.1:8000
- ✅ Docs at: http://127.0.0.1:8000/docs

### Terminal 2 - Frontend

```bash
cd apps/web

# Instalar dependencias (primera vez)
npm install

# Iniciar dev server
npm run dev
```

**Verificar**:
- ✅ Ready on http://localhost:3000
- ✅ No build errors

---

## ✅ Paso 5: Testing Manual - Backend

### 5.1 Health Check

```bash
# Basic health
curl http://localhost:8000/health

# Expected: {"status":"ok"}

# Detailed health
curl http://localhost:8000/health/detailed

# Expected: JSON with database, disk, memory status
```

### 5.2 API Documentation

```bash
# Abrir en navegador
open http://localhost:8000/docs
```

**Verificar**:
- ✅ Swagger UI carga
- ✅ Todos los endpoints visibles
- ✅ Schemas documentados

### 5.3 Authentication

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'

# Expected: {"access_token":"...","token_type":"bearer","user":{...}}

# Guardar token
TOKEN="tu-token-aqui"

# Get current user
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Expected: User data
```

### 5.4 Cotizaciones

```bash
# Crear cotización (público, sin auth)
curl -X POST http://localhost:8000/api/cotizaciones/ \
  -H "Content-Type: application/json" \
  -d '{
    "empresa": "Test Corp",
    "nombre": "Juan Test",
    "email": "juan@testcorp.com",
    "telefono": "1234567890",
    "quantity": 10,
    "course": "defensivo",
    "modality": "online",
    "totalPrice": 100000
  }'

# Expected: Cotización creada con ID

# Listar cotizaciones (requiere admin)
curl http://localhost:8000/api/cotizaciones/ \
  -H "Authorization: Bearer $TOKEN"

# Expected: Array de cotizaciones
```

### 5.5 Métricas

```bash
# Overview metrics (requiere admin)
curl http://localhost:8000/api/metrics/overview \
  -H "Authorization: Bearer $TOKEN"

# Expected: JSON con totals, quotes, enrollments

# Course metrics
curl http://localhost:8000/api/metrics/courses \
  -H "Authorization: Bearer $TOKEN"

# Expected: Array de estadísticas por curso
```

---

## ✅ Paso 6: Testing Manual - Frontend

### 6.1 Landing Page

```bash
open http://localhost:3000
```

**Verificar**:
- ✅ Hero section carga
- ✅ Animaciones funcionan
- ✅ Catálogo de cursos visible
- ✅ Cotizador interactivo
- ✅ No errores en consola

### 6.2 Cotizador

1. Scroll a sección "Cotizar"
2. Mover slider de cantidad (1-500)
3. Seleccionar curso
4. Seleccionar modalidad
5. Completar formulario:
   - Empresa
   - Nombre
   - Email
   - Teléfono
6. Click "Solicitar Cotización"

**Verificar**:
- ✅ Precio se calcula en tiempo real
- ✅ Descuentos se aplican
- ✅ Validación funciona
- ✅ Modal de éxito aparece
- ✅ Cotización se guarda en BD

### 6.3 Login

```bash
open http://localhost:3000/login
```

**Probar**:
1. Email: `admin@test.com`
2. Password: `admin123`
3. Click "Iniciar Sesión"

**Verificar**:
- ✅ Redirect a dashboard
- ✅ Token guardado
- ✅ User data visible

### 6.4 Dashboard Admin

```bash
open http://localhost:3000/dashboard/super
```

**Verificar**:
- ✅ Dashboard carga
- ✅ Sidebar visible
- ✅ Métricas muestran datos
- ✅ Navegación funciona

### 6.5 Cotizaciones Admin

```bash
open http://localhost:3000/dashboard/super/cotizaciones
```

**Verificar**:
- ✅ Lista de cotizaciones
- ✅ Filtros funcionan
- ✅ Búsqueda funciona
- ✅ Actualizar estado funciona
- ✅ Modal de conversión funciona

### 6.6 Métricas Dashboard

```bash
open http://localhost:3000/dashboard/super/metrics
```

**Verificar**:
- ✅ KPIs cargan
- ✅ Gráficos visibles
- ✅ Tabla de cursos
- ✅ Datos actualizados

### 6.7 Recuperación de Contraseña

```bash
open http://localhost:3000/forgot-password
```

**Probar**:
1. Ingresar email
2. Click "Enviar"
3. Verificar email recibido (si SMTP configurado)
4. Click en link de reset
5. Ingresar nueva contraseña

**Verificar**:
- ✅ Formulario funciona
- ✅ Email se envía (o error si no configurado)
- ✅ Reset page carga
- ✅ Password se actualiza

### 6.8 Validación Pública

```bash
open http://localhost:3000/validar/VMP-2026-00001
```

**Verificar**:
- ✅ Página carga
- ✅ Estado se muestra (not found si no existe)
- ✅ Diseño profesional

---

## 🔍 Paso 7: Verificaciones de Performance

### Backend Performance

```bash
# Load test con Apache Bench
ab -n 100 -c 10 http://localhost:8000/health

# Expected:
# - Requests per second: >100
# - Time per request: <100ms
# - Failed requests: 0
```

### Frontend Performance

```bash
# Lighthouse audit
npx lighthouse http://localhost:3000 --view

# Expected scores:
# - Performance: >90
# - Accessibility: >90
# - Best Practices: >90
# - SEO: >90
```

---

## 🐛 Paso 8: Testing de Errores

### 8.1 Backend Error Handling

```bash
# Login con credenciales inválidas
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@test.com","password":"wrong"}'

# Expected: 401 Unauthorized

# Endpoint sin auth
curl http://localhost:8000/api/cotizaciones/

# Expected: 401 Unauthorized (si requiere auth)

# Rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@test.com","password":"admin123"}'
done

# Expected: 429 Too Many Requests después de 5 intentos
```

### 8.2 Frontend Error Handling

**Probar**:
1. Apagar backend
2. Intentar login
3. Verificar mensaje de error

**Probar**:
1. Enviar formulario incompleto
2. Verificar validaciones

---

## 📊 Paso 9: Verificar Base de Datos

```bash
# Abrir Prisma Studio
cd apps/api
prisma studio
```

**Verificar**:
- ✅ Tabla `users` tiene admin
- ✅ Tabla `cotizaciones` tiene datos de prueba
- ✅ Relaciones funcionan
- ✅ Índices creados

---

## ✅ Checklist Final de Testing

### Backend
- [ ] Health check funciona
- [ ] API docs accesibles
- [ ] Login funciona
- [ ] JWT tokens válidos
- [ ] Cotizaciones CRUD funciona
- [ ] Métricas cargan
- [ ] Rate limiting activo
- [ ] Tests pasan (>80% coverage)
- [ ] No errores en logs

### Frontend
- [ ] Landing page carga
- [ ] Cotizador funciona
- [ ] Login/logout funciona
- [ ] Dashboard admin accesible
- [ ] Cotizaciones admin funciona
- [ ] Métricas dashboard funciona
- [ ] Forgot password funciona
- [ ] Validación pública funciona
- [ ] No errores en consola
- [ ] Lighthouse score >90

### Database
- [ ] Migraciones aplicadas
- [ ] Admin user creado
- [ ] Datos de prueba insertados
- [ ] Índices creados
- [ ] Conexión estable

### Integración
- [ ] Frontend → Backend comunicación
- [ ] Auth flow completo
- [ ] Email service (si configurado)
- [ ] PDF generation (si probado)
- [ ] QR codes (si probado)

---

## 🚨 Problemas Comunes y Soluciones

### Backend no inicia

```bash
# Verificar puerto
lsof -i :8000

# Matar proceso si existe
kill -9 <PID>

# Verificar database
psql vmp_db -c "SELECT 1"
```

### Frontend no compila

```bash
# Limpiar cache
rm -rf .next node_modules
npm install
npm run dev
```

### Tests fallan

```bash
# Verificar database de test
export DATABASE_URL="postgresql://test:test@localhost:5432/vmp_test"
createdb vmp_test
prisma migrate deploy
pytest tests/ -v
```

### CORS errors

Verificar en `apps/api/.env`:
```bash
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

---

## 📝 Reporte de Testing

Después de completar todos los tests, documenta:

```markdown
## Testing Report - VMP Servicios v1.0.0

**Fecha**: 02/02/2026
**Tester**: [Tu nombre]

### Resultados

#### Backend
- Tests: ✅ PASS (X/Y tests, Z% coverage)
- Health: ✅ OK
- Performance: ✅ OK (<100ms avg)

#### Frontend
- Build: ✅ SUCCESS
- Lighthouse: ✅ 95/100
- Manual testing: ✅ PASS

#### Issues Found
- [ ] Issue 1: Descripción
- [ ] Issue 2: Descripción

### Conclusión
✅ READY FOR DEPLOYMENT
```

---

**Siguiente paso**: Una vez completado el testing, estarás listo para deployment a producción.
