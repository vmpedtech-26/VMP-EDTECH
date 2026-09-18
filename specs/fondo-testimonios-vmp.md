# Spec: Reemplazo de Imagen de Fondo de Sección Testimonios (Confían en VMP - EDTECH)

## 1. Objective
Sustituir la imagen de fondo actual de la sección *"Confían en VMP - EDTECH"* (`/images/confian_bg.jpg`) en la landing page principal (`apps/web/components/landing/Testimonials.tsx`). La imagen anterior presentaba elementos ficticios ("Austral Energía" y una planta de YPF pegada al ventanal con estética no verosímil). El nuevo activo gráfico incorpora una sala de reuniones ejecutiva realista con el logotipo esmerilado de **VMP - EDTECH** y un paisaje natural de la meseta y parque industrial de Neuquén al atardecer, conservando legibilidad corporativa óptima y alto rendimiento web.

## 2. Requirements & Must-Haves
- [ ] **REQ-1**: Reemplazar el archivo de imagen de fondo `/images/confian_bg.jpg` en `apps/web/public/images/` por la fotografía aprobada de la sala de reuniones ejecutiva con el logo de VMP - EDTECH y paisaje neuquino.
- [ ] **REQ-2**: Ajustar el degradado y opacidad del overlay en `apps/web/components/landing/Testimonials.tsx` (`bg-gradient-to-b`) para garantizar que el logotipo de VMP - EDTECH en el vidrio lateral y el ventanal natural sean nítidamente apreciables sin sacrificar el contraste y legibilidad del texto y de la tarjeta central.
- [ ] **REQ-3**: Mantener atributos de optimización Next.js (`fill`, `sizes="100vw"`, `quality={95}`, `priority`) en el componente `Testimonials.tsx` y accesibilidad (`alt="Reunión corporativa y directores en sede VMP - EDTECH, Neuquén"`).
- [ ] **REQ-4**: Optimizar el peso del nuevo archivo JPG para asegurar carga rápida (< 350 KB) sin pérdida perceptible de calidad visual en pantallas de alta resolución / Retina.

## 3. Constraints & Design Guidelines
- **Tech Stack**: Next.js 15+ (App Router), React, Tailwind CSS, TypeScript.
- **Design & UX**: Paleta oficial Dark Navy (`#0A1628` / `slate-950`), Brand Teal (`#14B8A6`), tarjeta blanca flotante con sombra sutil y tipografía nítida en blanco y gris slate.
- **SEO & Accessibility (a11y)**: Texto alternativo descriptivo en español, etiquetas semánticas intactas, botones de navegación accesibles.
- **Performance**: Compresión de imagen con Pillow/sharp, optimización LCP sin penalización en Core Web Vitals.

## 4. Edge Cases & Error States
- [ ] **EDGE-1**: Comportamiento responsivo en dispositivos móviles (centrado de imagen `object-cover object-center` sin cortar indebidamente el área central de la reunión).
- [ ] **EDGE-2**: Cero CLS (Cumulative Layout Shift) en la sección de testimonios durante la carga inicial del fondo.
- [ ] **EDGE-3**: Compatibilidad estricta con el build estático y despliegue en Vercel.

## 5. Definition of Done (DoD)
- [ ] **DoD-1**: El nuevo archivo `/images/confian_bg.jpg` se encuentra implementado en `apps/web/public/images/` en alta definición y optimizado.
- [ ] **DoD-2**: El componente `apps/web/components/landing/Testimonials.tsx` compila correctamente sin errores de sintaxis ni de tipos.
- [ ] **DoD-3**: El build de Next.js (`npm run build` o `npx next build`) en `apps/web` finaliza con código 0 sin warnings críticos.
- [ ] **DoD-4**: Se verifica visualmente el renderizado de la sección mediante inspección directa.
- [ ] **DoD-5**: Se realiza commit y push a la rama de producción para su despliegue automático en Vercel.
