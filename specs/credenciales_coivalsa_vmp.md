# Spec: Credenciales Oficiales VMP-EDTECH (Fondo Orgánico Realista en "Servicios Técnicos Oficiales")

## 1. Objective
Añadir una imagen de fondo orgánica y realista que represente la inspección técnica en infraestructura vial e industrial en la sección **"Servicios Técnicos Oficiales"** (`ProfessionalServices.tsx`), combinada con capas de gradientes oscuros para asegurar legibilidad, contraste y estética de diseño premium.

## 2. Component Specs
- **Fondo de Sección (`section#servicios`):**
  - **Imagen:** `/images/servicios_tecnicos_bg.jpg` (Fotografía cinematográfica realista de ingenieros de seguridad en terreno de obra e infraestructura vial).
  - **Capas de Superposición:** `bg-gradient-to-b from-slate-950/85 via-slate-900/80 to-slate-950/90` con efecto de viñeta y patrón técnico sutil.
  - **Tipografía y Contraste:** Título en blanco puro con acento en gradiente verde esmeralda/teal y texto descriptivo en gris claro de alto contraste.

## 3. Definition of Done (DoD)
- [ ] **DoD-1**: Imagen guardada en `apps/web/public/images/servicios_tecnicos_bg.jpg`.
- [ ] **DoD-2**: Sección `#servicios` renderiza el fondo orgánico realista con gradiente protector.
- [ ] **DoD-3**: Cambios integrados en `apps/web/components/landing/ProfessionalServices.tsx` y subidos a producción.
