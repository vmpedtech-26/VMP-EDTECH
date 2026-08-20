# Spec: Generador de Presupuestos HSE con IA

## 1. Objetivo

Incorporar un módulo de generación de presupuestos/propuestas comerciales técnicas dentro del panel Super Admin de VMP Abril (`/dashboard/super/presupuestos`). El módulo permite a los administradores de VMP SAS crear presupuestos profesionales en segundos mediante un formulario inteligente asistido por IA, que genera automáticamente un PDF listo para enviar al cliente con la estética institucional de VMP - EDTECH.

Elimina el proceso manual actual (script Python + edición manual) y centraliza la operación en el sistema interno de vmp-edtech.com.

---

## 2. Requisitos & Must-Haves

### Módulo Principal
- [ ] **REQ-1**: Ruta exclusiva Super Admin: `/dashboard/super/presupuestos`
- [ ] **REQ-2**: Listado de presupuestos históricos con columnas: N.º cotización, cliente, recurso, fecha, importe total, estado (borrador / enviado / aceptado / rechazado)
- [ ] **REQ-3**: Botón "Nuevo Presupuesto" que abre el formulario de creación
- [ ] **REQ-4**: Numeración automática y correlativa (`VMP-YYYY-NNN`), continuando desde `VMP-2026-144`
- [ ] **REQ-5**: Posibilidad de editar y duplicar presupuestos existentes
- [ ] **REQ-6**: Descarga del PDF generado desde el listado y desde el detalle

### Formulario Inteligente
- [ ] **REQ-7**: Formulario dividido en secciones colapsables:
  - **Datos del cliente** (CUIT, razón social, domicilio)
  - **Recurso técnico asignado** (nombre, título, matrícula)
  - **Modalidad y dedicación** (fechas, jornadas, hs/día, horario, lugar)
  - **Cuadro tarifario** (tabla editable de ítems con código, unidad, cantidad, precio unitario)
  - **Configuración del documento** (alcance narrativo, entregables, exclusiones, condiciones)
- [ ] **REQ-8**: Cálculo automático en tiempo real de subtotal neto, IVA (21%) y total final
- [ ] **REQ-9**: Campo de búsqueda de cliente que autocompleta desde clientes/cotizaciones previas en BD
- [ ] **REQ-10**: Selector de plantilla de servicio (ej: "HSE Técnico", "Capacitación In-Company", "Relevamiento") que pre-llena el cuadro tarifario y el alcance con valores predeterminados

### Asistente IA Integrado (Gemini)
- [ ] **REQ-11**: Panel lateral de chat IA dentro del formulario de creación
- [ ] **REQ-12**: El asistente puede **rellenar el formulario completo** a partir de texto en lenguaje natural. Ej: *"Presupuesto para CONSULTUS, 5 días, técnico HSE, Neuquén, agosto"* → completa todos los campos automáticamente
- [ ] **REQ-13**: Botón **"Redactar Alcance con IA"** — genera el texto de alcance técnico, entregables y condiciones según el tipo de servicio y datos ingresados
- [ ] **REQ-14**: Botón **"Sugerir Tarifas"** — propone valores por jornada/hora basándose en el historial de presupuestos previos almacenados
- [ ] **REQ-15**: El asistente recuerda CUIT, condiciones y valores de clientes previos al detectar el nombre de la empresa

### Generación del PDF
- [ ] **REQ-16**: El PDF generado reproduce fielmente la estética del presupuesto de referencia:
  - Portada A4 portrait con fotografía industrial patagónica a sangre completa
  - Bandas decorativas turquesa (`#0D9488`) y naranja (`#F97316`) superior e inferior
  - Marca "VMP SAS" + "VMP - EDTECH" en Helvetica Bold, con barra acento lateral en títulos
  - Tarjeta ejecutiva inferior sobre overlay oscuro con datos clave (cliente, recurso, fechas, total)
  - Páginas 2-4: header/footer institucional, secciones con banners de barra lateral teal, tablas tarifarias con cabecera navy, cuadro de totales con destacado en naranja, bloque de firmas de conformidad
  - Paleta: navy `#060D1A`, teal `#0D9488`, dark-teal `#0F766E`, cyan `#2DD4BF`, orange `#F97316`
  - Footer fijo: `administracion@vmp-edtech.com | www.vmp-edtech.com | CUIT: 30-71936908-8`
- [ ] **REQ-17**: Generación del PDF en el backend (FastAPI + ReportLab + Pillow), devuelto como archivo descargable
- [ ] **REQ-18**: PDF almacenado en `storage/presupuestos/` y vinculado al registro en BD

### Persistencia y Base de Datos
- [ ] **REQ-19**: Nueva tabla `presupuestos` con campos: id, numero_cotizacion, cliente_nombre, cliente_cuit, recurso_nombre, recurso_matricula, fecha_emision, fecha_desde, fecha_hasta, jornadas, importe_neto, iva, total, estado, items_json, alcance_texto, pdf_url, created_by, created_at, updated_at
- [ ] **REQ-20**: Nueva tabla `plantillas_presupuesto` con campos: id, nombre, descripcion, items_default_json, alcance_default, activa
- [ ] **REQ-21**: Contador correlativo de número de cotización gestionado en BD (secuencia PostgreSQL), inicializado en 144

---

## 3. Constraints & Design Guidelines

- **Tech Stack**:
  - Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, React Hook Form + Zod, Framer Motion
  - Backend: FastAPI (Python 3.11+), ReportLab, Pillow, Google Gemini API
  - DB: PostgreSQL (Supabase) vía Prisma ORM
  - Auth: JWT existente del sistema (rol `super_admin` requerido)

- **Design & UX**:
  - Sistema de diseño existente de VMP Abril (Tailwind, paleta navy/teal/orange)
  - Formulario tipo wizard multi-step o acordeón colapsable
  - Preview del PDF embebido antes de descargar
  - Toast notifications para acciones (guardado, generación, error)
  - Responsive desktop-first (mínimo tablet)

- **Seguridad**:
  - Endpoints protegidos con JWT + verificación de rol `super_admin`
  - Rate limiting en endpoint de IA (máx 20 req/min por usuario)
  - Validación con Zod (frontend) y Pydantic (backend)

- **Performance**:
  - Generación PDF en background task (FastAPI BackgroundTasks)
  - Spinner/skeleton mientras se genera el PDF

---

## 4. Edge Cases & Error States

- [ ] **EDGE-1**: Si el número correlativo ya existe en BD (colisión), reintentar con el siguiente disponible
- [ ] **EDGE-2**: Si la imagen de portada no está disponible, usar fondo sólido navy con degradé (fallback silencioso)
- [ ] **EDGE-3**: Si Gemini API no responde, el formulario funciona en modo manual; el panel IA muestra error con botón de retry
- [ ] **EDGE-4**: Validar que fechas de servicio no sean anteriores a la fecha de emisión
- [ ] **EDGE-5**: Si el usuario cierra el formulario sin guardar, mostrar modal de confirmación ("¿Descartar cambios?")
- [ ] **EDGE-6**: Campos numéricos de tarifas: validar que sean positivos, aceptar coma o punto como separador decimal

---

## 5. Definition of Done (DoD)

- [ ] **DoD-1**: Backend compila sin errores y nuevos endpoints pasan `pytest tests/ -v`
- [ ] **DoD-2**: Frontend builda sin errores TypeScript (`npm run build`)
- [ ] **DoD-3**: Todos los REQ (REQ-1 a REQ-21) implementados y verificados manualmente
- [ ] **DoD-4**: Todos los edge cases (EDGE-1 a EDGE-6) manejados correctamente
- [ ] **DoD-5**: PDF generado visualmente idéntico al presupuesto de referencia (`Presupuesto_VMP_EDTECH_CONSULTUS.pdf`, 19/08/2026)
- [ ] **DoD-6**: El número de cotización siguiente al generar es `VMP-2026-145` (o correlativo)
- [ ] **DoD-7**: Panel de IA completa el formulario desde lenguaje natural en < 5 segundos
- [ ] **DoD-8**: PDF descargado pesa < 5 MB y abre correctamente en Adobe Reader / Preview / Chrome
- [ ] **DoD-9**: Acceso denegado (403) si un usuario sin rol `super_admin` intenta acceder
- [ ] **DoD-10**: Deploy en Vercel + Railway sin regresiones en funcionalidades existentes

---

## 6. Archivos de Referencia

- **PDF referencia visual**: `/Users/matias/Desktop/Presupuesto_VMP_EDTECH_CONSULTUS.pdf`
- **Script generador actual**: `/Users/matias/.gemini/antigravity/scratch/generate_presupuesto_consultus.py`
- **Imagen de portada**: `/Users/matias/.gemini/antigravity/scratch/vmp_presupuesto_cover_bg.png`
- **Último N.º cotización emitido**: `VMP-2026-144` (CONSULTUS, 19/08/2026)
- **Email institucional**: `administracion@vmp-edtech.com`
- **Proyecto base**: `/Users/matias/Desktop/SISTEMAS & APPS/Desarrollos VMP/VMP/01 - Desarrollo (EdTech)/vmp-abril/`
