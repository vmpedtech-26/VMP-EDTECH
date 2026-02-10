# 🎯 Plan de Testing Local - Resumen Ejecutivo

**Estado Actual**: ✅ 85% Listo para Testing  
**Fecha**: 02/02/2026

---

## ✅ Lo Que Ya Está Listo

### Sistema
- ✅ Python 3.14.2 instalado
- ✅ Node.js 24.13.0 instalado
- ✅ npm 11.6.2 instalado
- ✅ Git instalado

### Configuración
- ✅ `apps/api/.env` configurado
- ✅ `apps/web/.env.local` configurado
- ✅ Estructura del proyecto completa
- ✅ Todos los archivos de código

### Dependencias
- ✅ Frontend: `node_modules` instalado (366 packages)
- ✅ Backend: `requirements.txt` y `requirements-dev.txt` listos

### Documentación
- ✅ README.md
- ✅ API.md
- ✅ DEPLOYMENT.md
- ✅ ADMIN_GUIDE.md
- ✅ PRODUCTION.md
- ✅ CHANGELOG.md
- ✅ TESTING_LOCAL.md (guía completa)

### CI/CD
- ✅ GitHub Actions workflows
- ✅ Railway config
- ✅ Vercel config

---

## ⚠️ Lo Que Falta (Pasos Rápidos)

### 1. Instalar Dependencias Backend (5 min)

```bash
cd apps/api

# Instalar dependencias principales
python3 -m pip install -r requirements.txt

# Instalar dependencias de testing
python3 -m pip install -r requirements-dev.txt
```

### 2. Configurar Base de Datos (10 min)

**Opción A: SQLite (Para Testing Local - Más Rápido)**
```bash
cd apps/api

# Cambiar DATABASE_URL en .env a:
# DATABASE_URL="file:./dev.db"

# Generar Prisma client
prisma generate

# Crear database y ejecutar migraciones
prisma migrate dev --name init
```

**Opción B: PostgreSQL (Para Producción)**
```bash
# 1. Instalar PostgreSQL si no está
brew install postgresql@14
brew services start postgresql@14

# 2. Crear database
createdb vmp_db

# 3. Actualizar .env con:
# DATABASE_URL="postgresql://tu-usuario@localhost:5432/vmp_db"

# 4. Ejecutar migraciones
cd apps/api
prisma generate
prisma migrate deploy
```

### 3. Crear Usuario Admin (2 min)

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
    password_hash = pwd_context.hash("admin123")
    
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
    
    print(f"✅ Admin created: {admin.email} / password: admin123")
    await prisma.disconnect()

asyncio.run(create_admin())
EOF

# Ejecutar
python3 create_admin.py
```

---

## 🚀 Iniciar Testing (2 Terminales)

### Terminal 1: Backend

```bash
cd apps/api

# Iniciar servidor
uvicorn main:app --reload --port 8000

# Deberías ver:
# INFO:     Uvicorn running on http://127.0.0.1:8000
# INFO:     Application startup complete.
```

**Verificar**:
- http://localhost:8000/health → `{"status":"ok"}`
- http://localhost:8000/docs → Swagger UI

### Terminal 2: Frontend

```bash
cd apps/web

# Iniciar dev server
npm run dev

# Deberías ver:
# ▲ Next.js 14.x.x
# - Local:        http://localhost:3000
```

**Verificar**:
- http://localhost:3000 → Landing page
- http://localhost:3000/login → Login page

---

## 🧪 Tests Rápidos (5 min)

### 1. Backend Health Check

```bash
# Basic health
curl http://localhost:8000/health

# Detailed health
curl http://localhost:8000/health/detailed
```

### 2. Login Test

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'

# Deberías recibir un token
```

### 3. Frontend Test

1. Abrir http://localhost:3000
2. Verificar que la landing carga
3. Ir a http://localhost:3000/login
4. Login con `admin@test.com` / `admin123`
5. Verificar redirect a dashboard

### 4. Cotizador Test

1. En landing, scroll a "Cotizar"
2. Mover slider, seleccionar curso
3. Completar formulario
4. Enviar
5. Verificar modal de éxito

---

## 🎯 Testing Completo (Opcional - 30 min)

Si quieres hacer testing exhaustivo, sigue la guía completa:

```bash
# Ver guía completa
cat TESTING_LOCAL.md

# O abrir en editor
code TESTING_LOCAL.md
```

---

## 📊 Checklist Mínimo para Continuar

Antes de deployment, verifica:

- [ ] Backend inicia sin errores
- [ ] Frontend compila sin errores
- [ ] Health check responde OK
- [ ] Login funciona
- [ ] Admin puede acceder al dashboard
- [ ] Cotizador crea registros en BD
- [ ] No errores en consola del navegador

---

## 🚀 Próximos Pasos

Una vez completado el testing local:

1. **Opción A**: Deployment a producción
   - Configurar Railway/Vercel
   - Push a GitHub
   - Configurar secrets

2. **Opción B**: Más testing
   - Ejecutar suite completa de tests
   - Performance testing
   - Security audit

3. **Opción C**: Features adicionales
   - Agregar funcionalidades
   - Mejorar UI/UX
   - Optimizaciones

---

## 💡 Tips

### Si Backend No Inicia

```bash
# Verificar puerto
lsof -i :8000

# Verificar database
cd apps/api
prisma studio
```

### Si Frontend No Compila

```bash
# Limpiar y reinstalar
cd apps/web
rm -rf .next node_modules
npm install
npm run dev
```

### Si Tests Fallan

```bash
# Verificar database de test
cd apps/api
export DATABASE_URL="file:./test.db"
prisma migrate dev
pytest tests/ -v
```

---

## 📞 Ayuda

Si encuentras problemas:

1. Revisa logs en terminal
2. Verifica variables de entorno
3. Consulta `TESTING_LOCAL.md` para guía detallada
4. Verifica que database esté corriendo

---

**Tiempo estimado total**: 20-30 minutos para setup + testing básico

**Estado**: Listo para empezar 🚀
