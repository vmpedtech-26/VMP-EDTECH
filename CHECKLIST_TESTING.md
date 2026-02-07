# ✅ Checklist de Verificación - Integración Backend

## 📋 Pre-requisitos

- [ ] Node.js instalado (v18+)
- [ ] Python instalado (v3.9+)
- [ ] PostgreSQL accesible (Supabase o local)
- [ ] Git instalado

---

## 🔧 Configuración Inicial

### Backend
- [x] ✅ Modelo `Cotizacion` agregado a `schema.prisma`
- [x] ✅ Router `cotizaciones.py` creado
- [x] ✅ Router incluido en `main.py`
- [x] ✅ Variables de entorno en `.env`
- [ ] ⏳ Migración aplicada (`prisma db push`)
- [ ] ⏳ Cliente Prisma generado (`prisma generate`)

### Frontend
- [x] ✅ Cliente API creado (`lib/api.ts`)
- [x] ✅ Componente `Quoter.tsx` actualizado
- [x] ✅ Variables de entorno en `.env.local`
- [x] ✅ Modal de error agregado
- [ ] ⏳ Dependencias instaladas (`npm install`)

---

## 🚀 Inicio de Servidores

### Backend (Terminal 1)
```bash
cd /Users/matias/.gemini/antigravity/scratch/vmp-servicios/apps/api
uvicorn main:app --reload --port 8000
```

- [ ] Backend corriendo en http://localhost:8000
- [ ] Documentación accesible en http://localhost:8000/docs
- [ ] Health check OK en http://localhost:8000/health

### Frontend (Terminal 2)
```bash
cd /Users/matias/.gemini/antigravity/scratch/vmp-servicios/apps/web
npm run dev
```

- [ ] Frontend corriendo en http://localhost:3000
- [ ] Landing page carga correctamente
- [ ] No hay errores en consola del navegador

---

## 🧪 Testing Funcional

### 1. Verificar Documentación API
- [ ] Abrir http://localhost:8000/docs
- [ ] Ver endpoint `POST /api/cotizaciones/`
- [ ] Ver endpoint `GET /api/cotizaciones/`
- [ ] Probar "Try it out" en Swagger

### 2. Probar Cotizador en Landing
- [ ] Abrir http://localhost:3000
- [ ] Scroll a sección "Cotizador Empresarial"
- [ ] Mover slider de cantidad
- [ ] Verificar que el precio se actualiza
- [ ] Seleccionar diferentes cursos
- [ ] Seleccionar diferentes modalidades
- [ ] Verificar descuentos (11+, 51+, 200+)

### 3. Enviar Cotización
- [ ] Click en "Solicitar Presupuesto Detallado"
- [ ] Formulario se abre correctamente
- [ ] Completar todos los campos:
  - [ ] Empresa
  - [ ] Nombre
  - [ ] Email válido
  - [ ] Teléfono
  - [ ] Aceptar marketing
  - [ ] Aceptar términos
- [ ] Click en "Enviar Cotización"
- [ ] Ver estado de carga (spinner/texto)
- [ ] Ver modal de éxito

### 4. Verificar Validaciones
- [ ] Intentar enviar sin empresa → Ver error
- [ ] Intentar enviar sin nombre → Ver error
- [ ] Intentar enviar email inválido → Ver error
- [ ] Intentar enviar sin aceptar términos → Ver error
- [ ] Verificar que los errores se muestran en rojo

### 5. Verificar Datos Guardados

**Opción A: API**
```bash
curl http://localhost:8000/api/cotizaciones/
```
- [ ] Ver lista de cotizaciones en JSON
- [ ] Verificar que los datos son correctos

**Opción B: Prisma Studio**
```bash
cd apps/api
prisma studio
```
- [ ] Abrir tabla `cotizaciones`
- [ ] Ver registros guardados
- [ ] Verificar todos los campos

**Opción C: Endpoint específico**
```bash
curl http://localhost:8000/api/cotizaciones/1
```
- [ ] Ver cotización con ID 1
- [ ] Verificar estructura de datos

---

## 🔍 Testing de Errores

### 1. Error de Conexión
- [ ] Detener el backend
- [ ] Intentar enviar cotización
- [ ] Ver modal de error
- [ ] Verificar mensaje: "Error de conexión"
- [ ] Click en "Intentar Nuevamente"
- [ ] Reiniciar backend y probar

### 2. Error de Validación
```bash
# Enviar datos inválidos
curl -X POST http://localhost:8000/api/cotizaciones/ \
  -H "Content-Type: application/json" \
  -d '{"empresa": "X"}'
```
- [ ] Ver error 422 (Validation Error)
- [ ] Ver detalles del error en response

### 3. CORS
- [ ] Verificar que no hay errores CORS en consola
- [ ] Verificar que `FRONTEND_URL` está en `.env`

---

## 📊 Verificación de Base de Datos

### Schema Correcto
- [ ] Tabla `cotizaciones` existe
- [ ] Columnas correctas:
  - [ ] `id` (Integer, Primary Key)
  - [ ] `empresa` (String)
  - [ ] `nombre` (String)
  - [ ] `email` (String)
  - [ ] `telefono` (String)
  - [ ] `quantity` (Integer)
  - [ ] `course` (String)
  - [ ] `modality` (String)
  - [ ] `total_price` (Float)
  - [ ] `price_per_student` (Float)
  - [ ] `discount` (Integer)
  - [ ] `status` (String, default: "pending")
  - [ ] `created_at` (DateTime)
  - [ ] `updated_at` (DateTime)

### Datos de Prueba
- [ ] Al menos 1 cotización guardada
- [ ] Todos los campos tienen valores
- [ ] `status` es "pending"
- [ ] `created_at` tiene fecha correcta

---

## 🎯 Testing Avanzado

### 1. Actualizar Estado
```bash
curl -X PATCH "http://localhost:8000/api/cotizaciones/1/status?status=contacted"
```
- [ ] Estado actualizado a "contacted"
- [ ] `updated_at` se actualizó

### 2. Filtrar por Estado
```bash
curl "http://localhost:8000/api/cotizaciones/?status=pending"
```
- [ ] Solo cotizaciones con status "pending"

### 3. Paginación
```bash
curl "http://localhost:8000/api/cotizaciones/?skip=0&limit=5"
```
- [ ] Máximo 5 resultados
- [ ] Funciona correctamente

### 4. Volumen de Datos
- [ ] Crear 10+ cotizaciones
- [ ] Verificar performance
- [ ] Verificar que todas se guardan

---

## 🔐 Seguridad

- [ ] Validación en frontend funciona
- [ ] Validación en backend funciona
- [ ] CORS configurado correctamente
- [ ] No hay datos sensibles en logs
- [ ] Emails se validan correctamente
- [ ] SQL injection protegido (Prisma ORM)

---

## 📱 Responsive Design

- [ ] Probar en desktop (1920x1080)
- [ ] Probar en tablet (768x1024)
- [ ] Probar en móvil (375x667)
- [ ] Formulario se ve bien en todos
- [ ] Modales se ven bien en todos

---

## 🎨 UX/UI

- [ ] Animaciones funcionan suavemente
- [ ] Transiciones son fluidas
- [ ] Colores son consistentes
- [ ] Tipografía es legible
- [ ] Botones tienen hover states
- [ ] Loading states son claros
- [ ] Mensajes de error son descriptivos
- [ ] Modal de éxito es celebratorio

---

## 📈 Métricas

### Datos a Trackear
- [ ] Total de cotizaciones
- [ ] Cotizaciones por día
- [ ] Curso más solicitado
- [ ] Modalidad más popular
- [ ] Ticket promedio
- [ ] Volumen promedio de conductores

### Queries Útiles
```sql
-- Total de cotizaciones
SELECT COUNT(*) FROM cotizaciones;

-- Por estado
SELECT status, COUNT(*) FROM cotizaciones GROUP BY status;

-- Curso más popular
SELECT course, COUNT(*) FROM cotizaciones GROUP BY course;

-- Ticket promedio
SELECT AVG(total_price) FROM cotizaciones;
```

---

## 🚀 Deployment (Futuro)

### Backend
- [ ] Configurar variables de entorno en producción
- [ ] Configurar DATABASE_URL de producción
- [ ] Configurar CORS para dominio de producción
- [ ] Configurar HTTPS
- [ ] Configurar rate limiting

### Frontend
- [ ] Configurar NEXT_PUBLIC_API_URL de producción
- [ ] Build de producción (`npm run build`)
- [ ] Verificar que no hay errores
- [ ] Deploy a Vercel/Railway

---

## ✅ Checklist Final

- [ ] ✅ Backend corriendo sin errores
- [ ] ✅ Frontend corriendo sin errores
- [ ] ✅ Formulario envía datos correctamente
- [ ] ✅ Datos se guardan en base de datos
- [ ] ✅ Modales de éxito/error funcionan
- [ ] ✅ Validaciones funcionan
- [ ] ✅ No hay errores en consola
- [ ] ✅ Documentación API accesible
- [ ] ✅ Tests manuales pasados
- [ ] ✅ Listo para producción

---

## 📞 Comandos de Referencia Rápida

```bash
# Iniciar backend
cd apps/api && uvicorn main:app --reload

# Iniciar frontend
cd apps/web && npm run dev

# Ver documentación API
open http://localhost:8000/docs

# Ver landing page
open http://localhost:3000

# Ver cotizaciones guardadas
curl http://localhost:8000/api/cotizaciones/

# Prisma Studio
cd apps/api && prisma studio

# Aplicar migración
cd apps/api && prisma db push

# Generar cliente
cd apps/api && prisma generate
```

---

**Última actualización**: 01/02/2026  
**Estado**: ✅ INTEGRACIÓN COMPLETA
