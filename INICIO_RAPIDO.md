# 🎯 Guía Rápida de Integración Backend

## ✅ Estado Actual

La integración del backend está **COMPLETA** en el código. Solo falta aplicar la migración a la base de datos.

---

## 🚀 Inicio Rápido

### Opción 1: Todo en uno (Recomendado)

```bash
# Terminal 1: Backend
cd /Users/matias/.gemini/antigravity/scratch/vmp-servicios/apps/api
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend  
cd /Users/matias/.gemini/antigravity/scratch/vmp-servicios/apps/web
npm run dev
```

### Opción 2: Con migración de base de datos

Si necesitas aplicar la migración primero:

```bash
cd /Users/matias/.gemini/antigravity/scratch/vmp-servicios/apps/api

# Generar cliente de Prisma
prisma generate

# Aplicar cambios a la base de datos
prisma db push
```

**Nota**: Si `prisma db push` falla por problemas de conexión, puedes:
1. Verificar que la base de datos esté accesible
2. Usar una base de datos local (SQLite) para desarrollo
3. Aplicar la migración manualmente desde Supabase

---

## 🧪 Probar la Integración

### 1. Verificar Backend
```bash
# Abrir en el navegador
open http://localhost:8000/docs
```

Deberías ver el endpoint `/api/cotizaciones/` en la documentación.

### 2. Verificar Frontend
```bash
# Abrir en el navegador
open http://localhost:3000
```

Navega a la sección "Cotizador Empresarial" y prueba enviar una cotización.

### 3. Verificar Datos

**Opción A: API**
```bash
curl http://localhost:8000/api/cotizaciones/
```

**Opción B: Prisma Studio**
```bash
cd apps/api
prisma studio
```

---

## 📋 Checklist de Integración

- [x] ✅ Endpoint `/api/cotizaciones/` creado
- [x] ✅ Modelo `Cotizacion` agregado al schema
- [x] ✅ Router incluido en `main.py`
- [x] ✅ Cliente API creado en frontend (`lib/api.ts`)
- [x] ✅ Componente `Quoter` integrado
- [x] ✅ Variables de entorno configuradas
- [x] ✅ Modales de éxito y error agregados
- [ ] ⏳ Migración de base de datos aplicada (pendiente)

---

## 🔧 Configuración de Base de Datos

### Opción A: PostgreSQL (Supabase) - Actual

Ya configurada en `apps/api/.env`:
```
DATABASE_URL="postgresql://postgres:...@db.zgrzhswbfalcgkkhjkqu.supabase.co:6543/postgres?pgbouncer=true"
```

### Opción B: SQLite (Desarrollo Local)

Si prefieres usar SQLite para desarrollo:

1. Edita `apps/api/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

2. Edita `apps/api/.env`:
```
DATABASE_URL="file:./dev.db"
```

3. Aplica la migración:
```bash
cd apps/api
prisma db push
```

---

## 🎨 Flujo de Usuario

1. **Usuario visita la landing page** → http://localhost:3000
2. **Scroll a "Cotizador"** → Sección #cotizar
3. **Configura parámetros**:
   - Cantidad de conductores (slider)
   - Tipo de curso (radio buttons)
   - Modalidad (botones)
4. **Ve el precio calculado** en tiempo real
5. **Click "Solicitar Presupuesto"** → Abre formulario
6. **Completa datos**:
   - Empresa, CUIT, Nombre
   - Email, Teléfono
   - Comentarios (opcional)
   - Acepta términos
7. **Envía formulario** → POST a `/api/cotizaciones/`
8. **Ve modal de éxito** o error según resultado

---

## 📊 Datos que se Guardan

Cada cotización guarda:

**Datos de Contacto:**
- Empresa
- CUIT (opcional)
- Nombre del contacto
- Email
- Teléfono
- Comentarios

**Datos del Cotizador:**
- Cantidad de conductores
- Tipo de curso
- Modalidad
- Precio total calculado
- Precio por estudiante
- Descuento aplicado (%)

**Metadata:**
- Estado (pending/contacted/converted/rejected)
- Fecha de creación
- Última actualización
- Consentimientos (marketing, términos)

---

## 🔍 Endpoints Disponibles

### `POST /api/cotizaciones/`
Crear nueva cotización (usado por el formulario)

### `GET /api/cotizaciones/`
Listar todas las cotizaciones
- Parámetros: `skip`, `limit`, `status`

### `GET /api/cotizaciones/{id}`
Obtener cotización específica

### `PATCH /api/cotizaciones/{id}/status`
Actualizar estado de cotización
- Parámetros: `status` (pending/contacted/converted/rejected)

---

## 🚨 Solución de Problemas

### "Error de conexión" en el formulario
✅ Verifica que el backend esté corriendo en http://localhost:8000

### "CORS error"
✅ Verifica `FRONTEND_URL=http://localhost:3000` en `apps/api/.env`

### "Can't reach database"
✅ Opciones:
1. Verifica conexión a Supabase
2. Usa SQLite para desarrollo (ver arriba)
3. Aplica migración desde Supabase Dashboard

### Formulario no envía
✅ Abre la consola del navegador (F12) para ver errores
✅ Verifica que `.env.local` exista en `apps/web/`

---

## 📈 Próximos Pasos

1. **Aplicar migración** cuando tengas acceso a la base de datos
2. **Probar el flujo completo** de cotización
3. **Configurar emails** para notificaciones (opcional)
4. **Crear panel admin** para ver cotizaciones (opcional)

---

## 📞 Comandos Útiles

```bash
# Ver logs del backend
cd apps/api
uvicorn main:app --reload --log-level debug

# Ver documentación interactiva
open http://localhost:8000/docs

# Probar endpoint manualmente
curl -X POST http://localhost:8000/api/cotizaciones/ \
  -H "Content-Type: application/json" \
  -d '{
    "empresa": "Test SA",
    "nombre": "Juan Test",
    "email": "test@test.com",
    "telefono": "1234567890",
    "quantity": 50,
    "course": "defensivo",
    "modality": "online",
    "totalPrice": 170000,
    "pricePerStudent": 3400,
    "discount": 15,
    "acceptMarketing": true,
    "acceptTerms": true
  }'

# Ver cotizaciones guardadas
curl http://localhost:8000/api/cotizaciones/
```

---

¡Todo listo para probar! 🎉
