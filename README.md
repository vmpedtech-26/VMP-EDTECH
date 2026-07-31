# VMP Servicios

**Versión:** 1.0.0  
**Última actualización:** 02/02/2026

Plataforma integral de capacitación profesional con sistema de certificación digital, landing page con cotizador integrado, y panel administrativo completo.

---

## 🎯 Quick Start

### Opción 1: Script Automático
```bash
./INICIAR_TODO.sh
```

### Opción 2: Manual

**Terminal 1 - Backend:**
```bash
cd apps/api
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
npm run dev
```

**Navegador:**
- Landing Page: http://localhost:3000
- Panel Admin: http://localhost:3000/dashboard/super
- API Docs: http://localhost:8000/docs

---

## 🏗️ Estructura del Proyecto

```
vmp-servicios/
├── apps/
│   ├── web/                    # Next.js 14+ Frontend
│   │   ├── app/
│   │   │   ├── (landing)/      # Landing page
│   │   │   ├── dashboard/      # Dashboards por rol
│   │   │   ├── validar/        # ✨ Validación pública
│   │   │   └── forgot-password/ # ✨ Recuperación
│   │   ├── components/
│   │   │   ├── landing/        # Componentes landing
│   │   │   └── admin/          # ✨ Componentes admin
│   │   └── lib/
│   │       └── api.ts          # Cliente API
│   └── api/                    # FastAPI Backend
│       ├── routers/
│       │   ├── auth.py         # ✨ Auth + recovery
│       │   ├── cotizaciones.py # ✨ + Conversión
│       │   ├── public.py       # ✨ Validación pública
│       │   └── metrics.py      # ✨ Dashboard métricas
│       ├── middleware/
│       │   └── security.py     # ✨ Rate limiting
│       ├── services/
│       │   ├── email_service.py # ✨ Emails
│       │   └── credential_validator.py # ✨ Validación
│       ├── tests/              # ✨ Test suite
│       └── database/
│           └── indexes.sql     # ✨ Optimización
├── docs/                       # ✨ Documentación
│   ├── API.md                  # API reference
│   ├── DEPLOYMENT.md           # Deployment guide
│   └── ADMIN_GUIDE.md          # Admin manual
└── README.md
```

---

## 🚀 Stack Tecnológico

### Frontend
- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (animaciones)
- **React Hook Form + Zod** (validación)

### Backend
- **FastAPI** (Python 3.11+)
- **PostgreSQL** (Supabase)
- **Prisma ORM**
- **JWT Authentication**
- **Rate Limiting** (slowapi)
- **Email** (SendGrid)

---

## ✨ Características Principales

### 🌐 Landing Page
- ✅ Hero section animado
- ✅ Catálogo de cursos
- ✅ **Cotizador empresarial**
- ✅ Testimonios
- ✅ FAQ
- ✅ SEO optimizado

### 💰 Sistema de Cotizaciones
- ✅ Formulario interactivo
- ✅ Cálculo en tiempo real
- ✅ Descuentos por volumen
- ✅ **Conversión automática a cliente** 🆕
- ✅ Email con credenciales 🆕

### 🔐 Autenticación
- ✅ Login/Registro
- ✅ **Recuperación de contraseña** 🆕
- ✅ Tokens JWT
- ✅ **Rate limiting** 🆕

### 🎫 Credenciales Digitales
- ✅ Generación automática PDF
- ✅ QR code único
- ✅ **Validación pública** 🆕
- ✅ Compartible por link

### 📊 Dashboard de Métricas
- ✅ **KPIs en tiempo real** 🆕
- ✅ **Tasa de conversión** 🆕
- ✅ **Estadísticas por curso** 🆕
- ✅ **Reportes exportables** 🆕

### 🛡️ Seguridad
- ✅ **Rate limiting** 🆕
- ✅ **Security headers** 🆕
- ✅ **Request tracking** 🆕
- ✅ CORS configurado

---

## 📚 Documentación

### Para Desarrolladores
- **[API.md](docs/API.md)** - Documentación completa de API
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Guía de deployment
- **Testing** - Suite completa con pytest

### Para Administradores
- **[ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md)** - Manual de administrador
- **Panel Admin** - `/dashboard/super`

### Documentación Técnica
- **[INTEGRACION_BACKEND.md](INTEGRACION_BACKEND.md)** - Integración backend
- **[PANEL_ADMIN.md](PANEL_ADMIN.md)** - Panel de administración
- **[ROADMAP.md](ROADMAP.md)** - Plan de desarrollo

---

## 🎛️ Panel de Administración

### Super Admin (`/dashboard/super`)
- ✅ **Gestión de Cotizaciones** 🆕
  - Ver leads desde landing
  - **Convertir a cliente** con un click
  - Tracking de conversión
- ✅ **Dashboard de Métricas** 🆕
  - KPIs en tiempo real
  - Gráficos de conversión
  - Estadísticas por curso
- ✅ Gestión de Empresas
- ✅ Gestión de Alumnos
- ✅ Gestión de Cursos

### Instructor (`/dashboard/instructor`)
- ✅ Ver alumnos asignados
- ✅ Aprobar/rechazar evidencias
- ✅ Ver progreso

### Alumno (`/dashboard`)
- ✅ Ver cursos activos
- ✅ Completar módulos
- ✅ Ver credenciales

---

## 🧪 Testing

### Backend Tests
```bash
cd apps/api

# Instalar dependencias de testing
pip install -r requirements-dev.txt

# Ejecutar tests
pytest tests/ -v --cov=. --cov-report=html

# Ver coverage
open htmlcov/index.html
```

### Verificar API
```bash
# Health check
curl http://localhost:8000/health

# Ver documentación
open http://localhost:8000/docs
```

---

## 🔐 Variables de Entorno

### Backend (`apps/api/.env`)
```bash
DATABASE_URL="postgresql://..."
SECRET_KEY="your-secret-key"
FRONTEND_URL="http://localhost:3000"

# Email
SMTP_HOST="smtp.sendgrid.net"
SMTP_PASSWORD="your-api-key"
EMAIL_FROM="noreply@vmpservicios.com"
```

### Frontend (`apps/web/.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🚀 Deployment

Ver [DEPLOYMENT.md](docs/DEPLOYMENT.md) para guía completa.

### Opciones Recomendadas
- **Backend**: Railway / Render
- **Frontend**: Vercel / Netlify
- **Database**: Supabase / Neon

---

## 📋 Estado de Desarrollo

### ✅ Días Completados (60%)

#### Día 1: Sistema de Emails + UI
- [x] Email service con SendGrid
- [x] Templates HTML profesionales
- [x] Estados UI mejorados

#### Día 2: Conversión + Recuperación
- [x] Conversión automática de cotizaciones
- [x] Recuperación de contraseña
- [x] Email con credenciales

#### Día 3: Validación + Seguridad + Métricas
- [x] Validación pública de credenciales
- [x] Rate limiting completo
- [x] Security headers
- [x] Dashboard de métricas

#### Día 4: Testing + Documentación
- [x] Suite de tests (pytest)
- [x] API documentation
- [x] Deployment guide
- [x] Admin guide
- [x] Database indexes

### 🚧 Próximo Día (40%)

#### Día 5: CI/CD + Production
- [ ] GitHub Actions
- [ ] Automated testing
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Final polish

---

## 🎯 Funcionalidades Clave

### Flujo Completo: Lead → Cliente

1. **Cliente** completa cotizador en landing
2. **Sistema** guarda en BD como "pending"
3. **Admin** ve en panel y contacta
4. **Admin** actualiza a "contacted"
5. **Admin** convierte con un click
6. **Sistema** crea:
   - ✅ Empresa
   - ✅ Usuarios con credenciales
   - ✅ Inscripciones
7. **Sistema** envía email con credenciales
8. **Alumnos** acceden y completan cursos
9. **Sistema** genera credenciales automáticamente

---

## 📊 Métricas Disponibles

- Total de leads generados
- Tasa de conversión
- Ticket promedio
- Cursos más solicitados
- Inscripciones activas/completadas
- Credenciales emitidas

---

## 🔒 Seguridad

- ✅ JWT Authentication
- ✅ Rate limiting (5-60 req/min)
- ✅ Security headers (HSTS, CSP, etc.)
- ✅ Password hashing (bcrypt)
- ✅ Request ID tracking
- ✅ CORS configurado

---

## 📞 Soporte

### Documentación
- [API Reference](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Admin Manual](docs/ADMIN_GUIDE.md)

### Contacto
- Email: soporte@vmpservicios.com
- Docs interactivas: http://localhost:8000/docs

---

**Estado**: 🚀 **80% Completado** - Listo para testing final y deployment

**Última actualización**: Día 4 - Testing y Documentación (02/02/2026)
