# Spec: Credenciales Oficiales VMP-EDTECH (Fondo Orgánico Realista en "Soluciones Corporativas")

## 1. Objective
Añadir una imagen de fondo orgánica y realista que represente la consultoría de nivel ejecutivo y gestión corporativa en la sección **"Soluciones Corporativas"** (`ProfessionalServices.tsx`), combinada con capas de gradientes oscuros para asegurar legibilidad, contraste y estética de diseño premium.

## 2. Component Specs
- **Fondo de Sección (`section#servicios-profesionales`):**
  - **Imagen:** `/images/soluciones_corporativas_bg.jpg` (Fotografía cinematográfica realista de ejecutivos y consultores de seguridad revisando planos de ingeniería en oficinas corporativas frente a planta industrial).
  - **Capas de Superposición:** `bg-gradient-to-b from-slate-950/90 via-slate-900/85 to-slate-950/95 backdrop-blur-[2px]` con patrón sutil y gradientes de alta legibilidad.
  - **Tipografía y Contraste:** Títulos principales en blanco puro con acento en verde esmeralda y texto descriptivo en gris claro de alto contraste.

## 3. Definition of Done (DoD)
- [ ] **DoD-1**: Imagen guardada en `apps/web/public/images/soluciones_corporativas_bg.jpg`.
- [ ] **DoD-2**: Sección `#servicios-profesionales` renderiza el fondo orgánico realista con gradiente protector.
- [ ] **DoD-3**: Cambios integrados en `apps/web/components/landing/ProfessionalServices.tsx` y subidos a producción.
