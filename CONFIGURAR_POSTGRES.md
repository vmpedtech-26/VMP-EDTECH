# 🐘 Configuración Manual de PostgreSQL

**Estado**: Postgres.app instalado ✅  
**Problema**: Necesita configuración de autenticación

---

## 🔧 Solución Rápida

### Opción 1: Usar psql desde Postgres.app (Recomendado)

1. **Abre Postgres.app**
2. **Click en "Open psql"** (botón en la ventana principal)
3. **Ejecuta estos comandos** en la terminal que se abre:

```sql
-- Crear database
CREATE DATABASE vmp_db;

-- Salir
\q
```

4. **Actualiza el .env** en `apps/api/.env`:
```bash
DATABASE_URL="postgresql://matias@localhost/vmp_db"
```

5. **Ejecuta migraciones**:
```bash
cd apps/api
prisma db push
```

---

### Opción 2: Configurar PATH y usar comandos

1. **Agregar Postgres.app al PATH**:
```bash
echo 'export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

2. **Crear database**:
```bash
createdb vmp_db
```

3. **Actualizar .env**:
```bash
DATABASE_URL="postgresql://matias@localhost/vmp_db"
```

4. **Migrar**:
```bash
cd apps/api
prisma db push
```

---

### Opción 3: Usar la database por defecto

Si Postgres.app creó una database con tu nombre de usuario:

1. **Actualizar .env** a:
```bash
DATABASE_URL="postgresql://matias@localhost/matias"
```

2. **Migrar**:
```bash
cd apps/api
prisma db push
```

---

## 🎯 Después de Configurar la Database

### 1. Crear Usuario Admin

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
        print(f"✅ Admin creado!")
        print(f"   Email: {admin.email}")
        print(f"   Password: admin123")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await prisma.disconnect()

asyncio.run(create_admin())
EOF

# Ejecutar
python3 create_admin.py
```

### 2. Iniciar Backend

```bash
cd apps/api
uvicorn main:app --reload
```

Deberías ver:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### 3. Verificar

```bash
# Health check
curl http://localhost:8000/health

# Login test
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

---

## 🚀 Testing Completo

Una vez que el backend esté corriendo:

### Frontend (ya corriendo)
- http://localhost:3000

### Backend  
- http://localhost:8000
- http://localhost:8000/docs (API docs)

### Probar Login
1. Ir a http://localhost:3000/login
2. Email: `admin@test.com`
3. Password: `admin123`
4. Deberías entrar al dashboard

### Probar Cotizador
1. Ir a http://localhost:3000
2. Scroll a "Cotizar"
3. Completar formulario
4. Enviar
5. Verificar que se guarda en BD

---

## 💡 Troubleshooting

### Si prisma db push falla

**Error de autenticación**:
- Verifica que Postgres.app esté corriendo (icono de elefante en barra de menú)
- Prueba con la database por defecto (tu nombre de usuario)
- Usa "Open psql" desde Postgres.app para crear la database manualmente

**Error de conexión**:
- Verifica que el puerto 5432 esté libre: `lsof -i :5432`
- Reinicia Postgres.app

### Si create_admin.py falla

**Error de conexión**:
- Verifica que `prisma db push` haya funcionado primero
- Verifica DATABASE_URL en .env

**Usuario ya existe**:
- Normal si ya lo creaste antes
- Puedes usar esas credenciales

---

## 📝 Resumen de Comandos

```bash
# 1. Configurar database (elige UNA opción de arriba)

# 2. Migrar
cd apps/api
prisma db push

# 3. Crear admin
python3 create_admin.py

# 4. Iniciar backend
uvicorn main:app --reload

# 5. En otra terminal, frontend ya está corriendo
# http://localhost:3000
```

---

## ✅ Checklist

- [ ] Postgres.app corriendo (icono de elefante visible)
- [ ] Database creada (vmp_db o matias)
- [ ] .env actualizado con DATABASE_URL correcto
- [ ] `prisma db push` ejecutado exitosamente
- [ ] Admin user creado
- [ ] Backend iniciado en puerto 8000
- [ ] Frontend corriendo en puerto 3000
- [ ] Login funciona

---

**¿Necesitas ayuda con algún paso?** Avísame en qué parte estás y te guío.
