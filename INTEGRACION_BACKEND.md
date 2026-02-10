# 🚀 Integración Backend - VMP Servicios

## ✅ Cambios Realizados

### 1. **Backend (FastAPI)**

#### Nuevo Endpoint: `/api/cotizaciones/`
- ✅ Creado router `cotizaciones.py` con endpoints completos:
  - `POST /api/cotizaciones/` - Crear nueva cotización
  - `GET /api/cotizaciones/` - Listar cotizaciones (con filtros)
  - `GET /api/cotizaciones/{id}` - Obtener cotización específica
  - `PATCH /api/cotizaciones/{id}/status` - Actualizar estado

#### Schema de Base de Datos
- ✅ Agregado modelo `Cotizacion` en `schema.prisma`:
  ```prisma
  model Cotizacion {
    id               Int      @id @default(autoincrement())
    empresa          String
    cuit             String?
    nombre           String
    email            String
    telefono         String
    comentarios      String?
    quantity         Int
    course           String
    modality         String
    totalPrice       Float
    pricePerStudent  Float
    discount         Int
    acceptMarketing  Boolean
    acceptTerms      Boolean
    status           String   @default("pending")
    createdAt        DateTime @default(now())
    updatedAt        DateTime @updatedAt
  }
  ```

#### Validaciones
- ✅ Validación completa con Pydantic
- ✅ Validación de cantidad (1-500)
- ✅ Validación de cursos válidos
- ✅ Validación de modalidades válidas
- ✅ Validación de email

### 2. **Frontend (Next.js)**

#### API Client
- ✅ Creado `lib/api.ts` con:
  - Función `submitCotizacion()` con tipos TypeScript
  - Manejo de errores personalizado (`ApiError`)
  - Configuración de URL desde variables de entorno

#### Componente Quoter
- ✅ Integrado con backend real
- ✅ Reemplazada simulación por llamada API real
- ✅ Agregado modal de error con feedback al usuario
- ✅ Manejo de estados de carga
- ✅ Mensajes de error descriptivos

#### Variables de Entorno
- ✅ Creado `.env.local`:
  ```bash
  NEXT_PUBLIC_API_URL=http://localhost:8000
  NEXT_PUBLIC_ENV=development
  ```

---

## 🔧 Cómo Probar la Integración

### Paso 1: Aplicar Migración de Base de Datos

```bash
# Desde la raíz del proyecto
chmod +x MIGRATE_COTIZACIONES.sh
./MIGRATE_COTIZACIONES.sh
```

O manualmente:
```bash
cd apps/api
prisma generate
prisma db push
```

### Paso 2: Iniciar Backend

```bash
cd apps/api
uvicorn main:app --reload --port 8000
```

El backend estará disponible en:
- API: http://localhost:8000
- Documentación: http://localhost:8000/docs
- Health check: http://localhost:8000/health

### Paso 3: Iniciar Frontend

```bash
cd apps/web
npm run dev
```

El frontend estará disponible en:
- Landing page: http://localhost:3000
- Cotizador: http://localhost:3000/#cotizar

### Paso 4: Probar el Formulario

1. Navega a http://localhost:3000
2. Scroll hasta la sección "Cotizador Empresarial"
3. Configura:
   - Cantidad de conductores
   - Tipo de curso
   - Modalidad
4. Haz clic en "Solicitar Presupuesto Detallado"
5. Completa el formulario con:
   - Nombre de empresa
   - Datos de contacto
   - Acepta los términos
6. Envía el formulario
7. Deberías ver el modal de éxito

---

## 📊 Verificar Datos en la Base de Datos

### Opción 1: Prisma Studio
```bash
cd apps/api
prisma studio
```

### Opción 2: Consulta directa
```bash
cd apps/api
python -c "
from prisma import Prisma
import asyncio

async def main():
    db = Prisma()
    await db.connect()
    cotizaciones = await db.cotizacion.find_many()
    for c in cotizaciones:
        print(f'{c.id} - {c.empresa} - {c.email} - ${c.totalPrice}')
    await db.disconnect()

asyncio.run(main())
"
```

### Opción 3: API Endpoint
```bash
curl http://localhost:8000/api/cotizaciones/
```

---

## 🎯 Estados de Cotización

Las cotizaciones pueden tener los siguientes estados:

- `pending` - Nueva cotización, sin contactar
- `contacted` - Cliente contactado
- `converted` - Convertido en cliente
- `rejected` - Rechazado o no interesado

Para actualizar el estado:
```bash
curl -X PATCH http://localhost:8000/api/cotizaciones/1/status?status=contacted
```

---

## 🔍 Endpoints Disponibles

### POST `/api/cotizaciones/`
Crear nueva cotización desde el formulario.

**Request Body:**
```json
{
  "empresa": "Empresa SA",
  "cuit": "20-12345678-9",
  "nombre": "Juan Pérez",
  "email": "juan@empresa.com",
  "telefono": "1123456789",
  "comentarios": "Necesito capacitación urgente",
  "quantity": 50,
  "course": "defensivo",
  "modality": "online",
  "totalPrice": 170000,
  "pricePerStudent": 3400,
  "discount": 15,
  "acceptMarketing": true,
  "acceptTerms": true
}
```

### GET `/api/cotizaciones/`
Listar todas las cotizaciones (con paginación y filtros).

**Query Parameters:**
- `skip` - Número de registros a saltar (default: 0)
- `limit` - Máximo de registros (default: 100)
- `status` - Filtrar por estado (opcional)

**Ejemplo:**
```bash
curl "http://localhost:8000/api/cotizaciones/?skip=0&limit=10&status=pending"
```

### GET `/api/cotizaciones/{id}`
Obtener una cotización específica.

### PATCH `/api/cotizaciones/{id}/status`
Actualizar el estado de una cotización.

**Query Parameters:**
- `status` - Nuevo estado (pending, contacted, converted, rejected)

---

## 🚨 Troubleshooting

### Error: "Error de conexión"
- ✅ Verifica que el backend esté corriendo en http://localhost:8000
- ✅ Verifica la variable `NEXT_PUBLIC_API_URL` en `.env.local`
- ✅ Revisa la consola del navegador para más detalles

### Error: "CORS"
- ✅ Verifica que `FRONTEND_URL` en `apps/api/.env` sea `http://localhost:3000`
- ✅ Reinicia el backend después de cambiar variables de entorno

### Error: "Database connection"
- ✅ Verifica que `DATABASE_URL` en `apps/api/.env` sea correcta
- ✅ Verifica que la base de datos esté accesible
- ✅ Ejecuta `prisma db push` para sincronizar el schema

### Error: "Module not found: @/lib/api"
- ✅ Verifica que el archivo `apps/web/lib/api.ts` exista
- ✅ Reinicia el servidor de desarrollo de Next.js

---

## 📈 Próximos Pasos Sugeridos

1. **Email Notifications**
   - Configurar SMTP en `.env`
   - Enviar email al equipo de ventas cuando llega una cotización
   - Enviar email de confirmación al cliente

2. **Panel Administrativo**
   - Crear página para ver todas las cotizaciones
   - Dashboard con métricas (conversión, ingresos estimados)
   - Filtros y búsqueda

3. **Integraciones**
   - CRM (HubSpot, Salesforce)
   - Google Sheets para tracking
   - WhatsApp Business API para seguimiento

4. **Analytics**
   - Google Analytics events
   - Tracking de conversión
   - A/B testing del cotizador

---

## 📝 Archivos Modificados/Creados

### Backend
- ✅ `apps/api/routers/cotizaciones.py` (nuevo)
- ✅ `apps/api/prisma/schema.prisma` (modificado)
- ✅ `apps/api/main.py` (modificado)

### Frontend
- ✅ `apps/web/lib/api.ts` (nuevo)
- ✅ `apps/web/components/landing/Quoter.tsx` (modificado)
- ✅ `apps/web/.env.local` (nuevo)

### Scripts
- ✅ `MIGRATE_COTIZACIONES.sh` (nuevo)
- ✅ `INTEGRACION_BACKEND.md` (este archivo)

---

¡La integración está completa! 🎉
