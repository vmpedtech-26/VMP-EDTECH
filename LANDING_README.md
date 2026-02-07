# VMP Landing Page - Guía de Inicio Rápido

## 🚀 Para Ver la Landing Page

1. **Iniciar el servidor de desarrollo**:
   ```bash
   cd /Users/matias/.gemini/antigravity/scratch/vmp-servicios/apps/web
   npm run dev
   ```

2. **Abrir en el navegador**:
   - Landing Page: http://localhost:3000/landing
   - Dashboard: http://localhost:3000/dashboard/login

---

## 📋 Secciones Implementadas

### ✅ Completadas

1. **Header** - Navegación sticky
   - Top banner ANSV
   - Menú responsive
   - CTAs (Área Alumnos, Cotizar)

2. **Hero Section** - Primera impresión
   - Headline impactante
   - Gradiente azul petróleo
   - Trust badges (500+ conductores, ANSV, etc.)

3. **Value Proposition** - 3 pilares
   - Certificación ANSV Oficial
   - Plataforma Digital Moderna
   - Instructores Certificados

4. **Course Catalog** - Cursos disponibles
   - Manejo Defensivo
   - Carga Pesada
   - 4x4 Profesional
   - Filtros por categoría

5. **Quoter** - Cotizador dinámico ⭐
   - Slider de cantidad (1-500)
   - Selector de curso
   - Modalidad (Online/Presencial/Mixto)
   - Cálculo automático con descuentos
   - Formulario de lead

6. **FAQ** - 10 preguntas frecuentes
   - Accordion interactivo
   - Validez legal, vigencia, modalidades, etc.

7. **Final CTA** - Última conversión
   - Gradiente amarillo
   - Dual CTAs

8. **Footer** - Información completa
   - Links de navegación
   - Redes sociales
   - Información legal ANSV

---

## 🎨 Paleta de Colores

```css
--azul-petroleo: #0A192F    /* Primario */
--amarillo-vial: #FFD700     /* Acento */
--gris-asfalto: #2D3748      /* Secundario */
--verde-aprobado: #48BB78    /* Success */
--rojo-alerta: #F56565       /* Error */
--naranja-advertencia: #ED8936 /* Warning */
```

---

## 📝 Próximos Pasos

### Pendientes de Implementar

- [ ] Blog Preview (artículos destacados)
- [ ] Validador de Certificaciones (integrar con API)
- [ ] Testimonios (carousel de clientes)
- [ ] Páginas de cursos individuales
- [ ] Formulario de contacto funcional
- [ ] Imágenes reales (actualmente placeholders)

### Optimizaciones

- [ ] SEO (meta tags, sitemap)
- [ ] Imágenes optimizadas (WebP)
- [ ] Analytics (Google Analytics 4)
- [ ] WhatsApp widget flotante

---

## 🔧 Estructura de Archivos

```
apps/web/
├── app/
│   ├── (landing)/
│   │   ├── layout.tsx       # Layout con fonts
│   │   ├── landing.css      # Estilos personalizados
│   │   └── page.tsx         # Página principal
│   ├── dashboard/           # Sistema existente
│   └── page.tsx             # Redirect a landing
├── components/
│   └── landing/
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── HeroSection.tsx
│       ├── ValueProposition.tsx
│       ├── CourseCatalog.tsx
│       ├── Quoter.tsx
│       ├── FAQ.tsx
│       └── FinalCTA.tsx
└── tailwind.config.ts       # Colores VMP
```

---

## 💡 Notas Importantes

- **Rutas**: Landing en `/landing`, Dashboard en `/dashboard`
- **Fonts**: Roboto Condensed (títulos), Inter (cuerpo)
- **Responsive**: Diseñado mobile-first
- **Interactividad**: Quoter, FAQ, Header usan 'use client'

---

## 🎯 Métricas de Éxito Esperadas

- Conversión cotizador → lead: >15%
- Tiempo en página: >2.5 minutos
- Bounce rate: <40%
- CTR área alumnos: >8%
