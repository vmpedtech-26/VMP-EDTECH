# Spec: Credenciales Oficiales VMP-EDTECH (Integración Módulo Código Humano e Identificador Visible)

## 1. Objective
Imprimir de forma destacada el **Código Único de Credencial** (ej: `N° CREDENCIAL: VMP-2026-1283`) de manera visible y legible tanto en el frente (Página 1) como en el dorso (Página 2) de la credencial PDF, permitiendo la verificación manual directa en `https://www.vmp-edtech.com/validar`.

## 2. Design Specs for Visible Credential Code
- **Página 1 (Frente):**
  - Incorporar una badge de alta visibilidad `N° CREDENCIAL: VMP-2026-1283` en la franja superior o debajo del bloque DNI en tipografía `Montserrat-Bold` con contraste cian/navy.
- **Página 2 (Dorso):**
  - Incorporar la leyenda `CÓDIGO DE VALIDACIÓN: VMP-2026-1283` justo dentro/debajo del panel de verificación QR.

## 3. Definition of Done (DoD)
- [ ] **DoD-1**: El código de credencial `VMP-2026-XXXX` figura impreso de forma legible en Frente y Dorso de los 5 PDF.
- [ ] **DoD-2**: Las vistas previas PNG confirman la legibilidad del código humano.
- [ ] **DoD-3**: Archivos PDF guardados en `/Users/matias/Desktop/Credenciales_VMP_COIVALSA/`.
