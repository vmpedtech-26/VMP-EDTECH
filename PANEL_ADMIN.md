# 📊 Panel de Administración - VMP Servicios

## ✅ Estado Actual del Panel Admin

El panel de administración **YA EXISTE** y está completamente funcional. Ahora se ha **agregado la gestión de cotizaciones**.

---

## 🏗️ Estructura del Dashboard

```
apps/web/app/dashboard/
├── page.tsx                    # Dashboard principal (Alumno)
├── layout.tsx                  # Layout compartido
├── cursos/                     # Gestión de cursos del alumno
├── credenciales/               # Ver credenciales obtenidas
├── explorar/                   # Explorar cursos disponibles
├── instructor/                 # Panel de instructor
└── super/                      # 🔐 PANEL DE SUPER ADMIN
    ├── page.tsx                # Dashboard principal del super admin
    ├── cursos/                 # ✅ Gestión de cursos
    │   ├── page.tsx            # Lista de cursos
    │   ├── nuevo/              # Crear nuevo curso
    │   └── [id]/               # Editar curso existente
    ├── empresas/               # ✅ Gestión de empresas
    │   ├── page.tsx            # Lista de empresas
    │   └── [id]/               # Ver/editar empresa
    ├── alumnos/                # ✅ Gestión de alumnos
    │   ├── page.tsx            # Lista de alumnos
    │   └── [id]/               # Ver/editar alumno
    └── cotizaciones/           # 🆕 NUEVO - Gestión de cotizaciones
        └── page.tsx            # Lista y gestión de leads
```

---

## 🆕 Nueva Funcionalidad: Gestión de Cotizaciones

### Ubicación
**`/dashboard/super/cotizaciones`**

### Características

#### 📊 Dashboard de Métricas
- **Total de cotizaciones** recibidas
- **Pendientes** - Nuevas cotizaciones sin contactar
- **Contactados** - Leads ya contactados
- **Convertidos** - Clientes confirmados
- **Ingresos estimados** - Suma de cotizaciones convertidas

#### 🔍 Filtros y Búsqueda
- Filtrar por estado (Todos, Pendientes, Contactados, Convertidos)
- Búsqueda por empresa, nombre o email
- Resultados en tiempo real

#### 📋 Lista de Cotizaciones
Cada cotización muestra:
- **Información de contacto**:
  - Empresa
  - Nombre del contacto
  - Email
  - Teléfono
  
- **Detalles de la cotización**:
  - Cantidad de conductores
  - Tipo de curso
  - Modalidad (Online/Presencial/Mixto)
  - Fecha de recepción
  
- **Información financiera**:
  - Precio total
  - Precio por alumno
  - Descuento aplicado

- **Estado visual**:
  - Badge de color según estado
  - Iconos descriptivos

#### 👁️ Vista Detallada
Modal con información completa de cada cotizacion:
- Todos los datos de contacto
- Detalles completos de la cotización
- Historial de estados (futuro)
- Acciones rápidas (futuro)

---

## 🎨 Diseño y UX

### Paleta de Colores por Estado
- **Pendiente**: Amarillo (`yellow-50`, `yellow-700`)
- **Contactado**: Azul (`blue-50`, `blue-700`)
- **Convertido**: Verde (`green-50`, `green-700`)
- **Rechazado**: Rojo (`red-50`, `red-700`)

### Componentes Utilizados
- `Card` - Contenedores con sombras
- `Button` - Botones con variantes
- Iconos de `lucide-react`
- Grid responsivo
- Modal overlay

---

## 🔐 Acceso al Panel

### Rutas Principales

#### Dashboard de Alumno
```
/dashboard
```
- Ver cursos activos
- Ver progreso
- Ver credenciales

#### Panel de Super Admin
```
/dashboard/super
```
- Métricas globales
- Accesos rápidos a:
  - Gestionar Cursos
  - Gestionar Empresas
  - Gestionar Alumnos
  - **Ver Cotizaciones** 🆕

#### Gestión de Cotizaciones
```
/dashboard/super/cotizaciones
```
- Ver todas las cotizaciones
- Filtrar y buscar
- Ver detalles
- Actualizar estados (futuro)

---

## 📊 Funcionalidades Existentes

### ✅ Gestión de Cursos
**Ruta**: `/dashboard/super/cursos`

Permite:
- Ver lista de todos los cursos
- Crear nuevos cursos
- Editar cursos existentes
- Configurar módulos (teoría, quiz, práctica)
- Establecer duración y vigencia

### ✅ Gestión de Empresas
**Ruta**: `/dashboard/super/empresas`

Permite:
- Ver lista de empresas clientes
- Crear nuevas empresas
- Editar información de empresas
- Ver alumnos por empresa
- Gestionar cursos asignados

### ✅ Gestión de Alumnos
**Ruta**: `/dashboard/super/alumnos`

Permite:
- Ver lista de todos los alumnos
- Ver detalles de cada alumno
- Ver progreso en cursos
- Ver credenciales obtenidas
- Gestionar inscripciones

---

## 🔄 Flujo de Trabajo con Cotizaciones

### 1. Lead Llega desde Landing Page
```
Usuario completa formulario → POST /api/cotizaciones/ → DB
```

### 2. Super Admin Revisa Cotizaciones
```
/dashboard/super/cotizaciones → Ver lista → Filtrar por "Pendientes"
```

### 3. Contactar al Lead
```
Ver detalles → Copiar email/teléfono → Contactar
```

### 4. Actualizar Estado (Futuro)
```
Cambiar estado a "Contactado" → "Convertido" o "Rechazado"
```

### 5. Convertir en Cliente (Futuro)
```
Si se convierte → Crear empresa → Crear alumnos → Asignar cursos
```

---

## 🚀 Próximas Mejoras Sugeridas

### Gestión de Cotizaciones

#### Alta Prioridad
- [ ] **Actualizar estado** desde la interfaz
  - Botones para cambiar estado
  - Confirmación antes de cambiar
  - Historial de cambios

- [ ] **Agregar notas**
  - Campo de comentarios
  - Historial de interacciones
  - Asignar responsable

- [ ] **Exportar datos**
  - Exportar a CSV/Excel
  - Filtrar antes de exportar
  - Incluir métricas

#### Media Prioridad
- [ ] **Conversión rápida**
  - Botón "Convertir en Cliente"
  - Pre-llenar datos de empresa
  - Crear alumnos automáticamente

- [ ] **Email directo**
  - Enviar email desde el panel
  - Templates predefinidos
  - Tracking de emails enviados

- [ ] **Recordatorios**
  - Notificaciones de seguimiento
  - Leads sin contactar > 24h
  - Dashboard de tareas pendientes

#### Baja Prioridad
- [ ] **Analytics avanzado**
  - Tasa de conversión por curso
  - Tiempo promedio de conversión
  - Gráficos de tendencias

- [ ] **Integración CRM**
  - Sincronizar con HubSpot/Salesforce
  - Webhook automático
  - Bidireccional

---

## 📱 Responsive Design

El panel está optimizado para:
- **Desktop** (1920x1080+) - Vista completa con grid
- **Tablet** (768x1024) - Grid adaptado a 2 columnas
- **Mobile** (375x667) - Vista de lista vertical

---

## 🔍 Cómo Probar

### 1. Iniciar Servidores
```bash
# Terminal 1 - Backend
cd apps/api
uvicorn main:app --reload

# Terminal 2 - Frontend
cd apps/web
npm run dev
```

### 2. Generar Cotizaciones de Prueba
```bash
# Ir a la landing page
open http://localhost:3000

# Completar el cotizador varias veces con diferentes datos
```

### 3. Ver en el Panel Admin
```bash
# Abrir panel de super admin
open http://localhost:3000/dashboard/super

# Click en "Ver Cotizaciones"
# O directamente:
open http://localhost:3000/dashboard/super/cotizaciones
```

### 4. Probar Funcionalidades
- ✅ Ver métricas en cards superiores
- ✅ Filtrar por estado
- ✅ Buscar por empresa/nombre/email
- ✅ Click en "Ver Detalles"
- ✅ Cerrar modal

---

## 🐛 Troubleshooting

### No aparecen cotizaciones
**Solución**: 
1. Verifica que el backend esté corriendo
2. Verifica que la migración se aplicó (`prisma db push`)
3. Genera cotizaciones desde la landing page

### Error al cargar
**Solución**:
1. Abre la consola del navegador (F12)
2. Verifica errores de red
3. Verifica que `NEXT_PUBLIC_API_URL` esté configurado
4. Verifica que el backend responda en `/api/cotizaciones/`

### Filtros no funcionan
**Solución**:
1. Refresca la página
2. Verifica que haya cotizaciones con ese estado
3. Revisa la consola por errores

---

## 📚 Archivos Relacionados

### Frontend
- `apps/web/app/dashboard/super/cotizaciones/page.tsx` - Página principal
- `apps/web/app/dashboard/super/page.tsx` - Dashboard con acceso rápido
- `apps/web/lib/api.ts` - Cliente API con `getCotizaciones()`

### Backend
- `apps/api/routers/cotizaciones.py` - Endpoints de cotizaciones
- `apps/api/prisma/schema.prisma` - Modelo `Cotizacion`
- `apps/api/main.py` - Router incluido

---

## ✅ Checklist de Funcionalidades

### Panel de Super Admin
- [x] ✅ Dashboard principal con métricas
- [x] ✅ Gestión de Cursos (crear, editar, listar)
- [x] ✅ Gestión de Empresas (crear, editar, listar)
- [x] ✅ Gestión de Alumnos (ver, editar, listar)
- [x] ✅ **Gestión de Cotizaciones** (ver, filtrar, buscar) 🆕
- [ ] ⏳ Actualizar estado de cotizaciones
- [ ] ⏳ Convertir cotización en cliente
- [ ] ⏳ Exportar datos
- [ ] ⏳ Analytics y reportes

### Panel de Instructor
- [x] ✅ Ver alumnos asignados
- [x] ✅ Subir fotos de credenciales
- [x] ✅ Aprobar/rechazar evidencias
- [x] ✅ Ver progreso de alumnos

### Panel de Alumno
- [x] ✅ Ver cursos activos
- [x] ✅ Ver progreso
- [x] ✅ Completar módulos
- [x] ✅ Rendir exámenes
- [x] ✅ Ver credenciales obtenidas

---

**Última actualización**: 01/02/2026  
**Versión del Panel**: 0.2.0  
**Estado**: ✅ FUNCIONAL CON COTIZACIONES
