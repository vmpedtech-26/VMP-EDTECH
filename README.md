# VMP Servicios Beta

**Versión:** 0.1.0-beta

Plataforma integral de capacitación profesional con sistema de certificación digital (credencial compacta verificable).

## 🏗️ Estructura del Proyecto

```
vmp-servicios/
├── apps/
│   ├── web/          # Next.js 14+ Frontend
│   └── api/          # FastAPI Backend
├── packages/
│   └── schemas/      # Schemas compartidos
└── docs/             # Documentación
```

## 🚀 Stack Tecnológico

### Frontend
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui
- React Hook Form + Zod
- Framer Motion (animaciones)

### Backend
- FastAPI (Python 3.11+)
- PostgreSQL
- Prisma ORM
- JWT Authentication
- ReportLab (generación PDFs)
- QRCode (credenciales verificables)

## 💻 Desarrollo Local

### Instalar dependencias
```bash
npm install
```

### Frontend (puerto 3000)
```bash
npm run dev
```

### Backend (puerto 8000)
```bash
npm run dev:api
```

## ✨ Características Principales

### 🌐 Landing Page Corporativa
- Hero section impactante
- Grid de servicios (3 columnas)
- Sección destacada "Credencial Digital"
- Beneficios empresariales
- Testimonios con carrusel
- Formulario de contacto
- SEO optimizado

### 📊 Dashboard Multi-Rol
- **Alumno**: Cursos, progreso, credenciales
- **Admin Empresa**: Gestión de alumnos, reportes
- **Super Admin**: Gestión global

### 🎓 Sistema de Capacitación
1. **Teoría**: Videos + contenido HTML
2. **Quiz**: Interactivo con feedback instantáneo
3. **Práctica**: Checklist con evidencias fotográficas
4. **Credencial**: Generación automática de credencial PDF

### 🎫 Credencial Digital
- Formato: ID Card (85.60 × 53.98 mm)
- Contenido: DNI, nombre, curso, fechas, QR code
- Número único: `VMP-2026-XXXXX`
- Verificación pública por QR

## 📋 Estado de Desarrollo

Ver [task.md](file:///Users/matias/.gemini/antigravity/brain/acdf36d2-1789-467c-a5dd-f97148ffb4ab/task.md) para el plan completo.

## 🎨 Diseño

**Paleta de Colores:**
- Primario: Azul corporativo (#1e40af - #3b82f6)
- Secundario: Gris neutro (#64748b)
- Fondo: Blanco (#ffffff) / Gris claro (#f8fafc)
- Acentos: Verde (#10b981), Naranja (#f59e0b)

**Tipografía:**
- Font: Inter (Google Fonts)
- Tamaño base: 16px
- Line height: 1.6

---

**Nota:** Este es un proyecto Beta en desarrollo activo.
