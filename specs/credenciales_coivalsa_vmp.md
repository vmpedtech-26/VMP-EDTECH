# Spec: Credenciales Oficiales VMP-EDTECH (Enlace "Validar" en la Navegación Principal del Inicio)

## 1. Objective
Incorporar la opción **"Validar Credencial"** en la barra de navegación del encabezado principal (`Header.tsx`) de la web, tanto para versión Desktop como Mobile, permitiendo a los usuarios acceder al validador con 1 solo clic desde cualquier página del sitio.

## 2. Header Specs
- **Menú Desktop (`Header.tsx`):**
  - Añadir enlace `Validar Credencial` apuntando a `/validar` destacado junto a Servicios, Cursos, Blog y Alianzas.
  - Añadir botón de acceso rápido `Validar` en la barra de llamadas a la acción (CTAs) junto a `Login` y `Contacto`.
- **Menú Mobile:**
  - Añadir opción `Validar Credencial` destacada en la lista del menú desplegable móvil.

## 3. Definition of Done (DoD)
- [ ] **DoD-1**: La opción "Validar Credencial" figura en la barra de navegación del inicio.
- [ ] **DoD-2**: El botón redirige a `/validar`.
- [ ] **DoD-3**: Cambios subidos e integrados en `apps/web/components/landing/Header.tsx`.
