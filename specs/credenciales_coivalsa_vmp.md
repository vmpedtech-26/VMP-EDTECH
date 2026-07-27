# Spec: Credenciales Oficiales VMP-EDTECH (Botón de Acción "Validar Otra Credencial")

## 1. Objective
Agregar una opción directa y destacada en la página de resultado de validación (`/validar/[codigo]`) para permitir al usuario escanear o ingresar el código de otra credencial de forma inmediata (`Validar Otra Credencial`), evitando la necesidad de regresar al inicio.

## 2. UX Specifications
- **Botonera de Acción en Resultados (`/validar/[codigo]`):**
  - **Botón Primario:** `🔍 Validar Otra Credencial` (Enlace directo a `/validar`, estilo destacado con color primario).
  - **Botón Secundario:** `Volver al Inicio` (Enlace a `/`).

## 3. Definition of Done (DoD)
- [ ] **DoD-1**: El botón "Validar Otra Credencial" figura destacado en los resultados.
- [ ] **DoD-2**: Hace clic y navega directamente a `/validar` para continuar escaneando.
- [ ] **DoD-3**: Cambios integrados en `apps/web/app/validar/[codigo]/page.tsx` y desplegados.
