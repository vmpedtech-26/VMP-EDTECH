# Spec: Emitir Credenciales Oficiales VMP EDTECH para Transporte Yaccos (Agosto 2026)

## 1. Objective
Generar y registrar las credenciales profesionales en formato PDF oficial de VMP EDTECH para 3 nuevos integrantes de **TRANSPORTE YACCOS**:
1. **Pinochet, Pablo Segundo** (DNI: 22593781, Registro: BLT-RT/1292, Código QR: VMP-2026-1292)
2. **Castillo, Cristian** (DNI: 23069331, Registro: BLT-RT/1293, Código QR: VMP-2026-1293)
3. **Rodriguez, Victor Omar** (DNI: 29642401, Registro: BLT-RT/1289, Código QR: VMP-2026-1289)

Las credenciales deben incluir el diseño oficial VMP con logotipos flanqueando el QR (República Argentina, Safety Council, Oldelval y TGS), patrón de seguridad Guilloché, foto del participante y validación pública en vivo mediante código QR.

## 2. Requirements & Must-Haves
- [x] **REQ-1**: Extraer las fotos de perfil de cada chofer desde los PDFs recibidos para incorporarlas en la credencial VMP oficial.
- [x] **REQ-2**: Generar los PDFs de 2 páginas (Frente y Reverso) para cada uno de los 3 choferes con vencimiento al 03/08/2028 y curso "Conducción Segura: Flota Liviana".
- [x] **REQ-3**: Crear el PDF Máster consolidado que reúna todas las credenciales de Transporte Yaccos en `/Users/matias/Desktop/Credenciales_VMP_TRANSPORTE_YACCOS/`.
- [x] **REQ-4**: Dar de alta y validar los códigos QR `VMP-2026-1292`, `VMP-2026-1293` y `VMP-2026-1289` en el validador web (`/validar/[codigo]`).

## 3. Constraints & Design Guidelines
- **Diseño**: Réplica exacta del formato VMP (Frente con foto, datos de chofer, firmas de instructores y logos de Oldelval + TGS + Argentina + Safety Council. Reverso con detalle de aprobación y validez industrial).
- **Validez**: Fecha de realización: `03/08/2026`, Fecha de vencimiento: `03/08/2028`, Carga horaria: `8 horas`.

## 4. Edge Cases & Error States
- [x] **EDGE-1**: Código QR debe apuntar a la URL pública oficial `https://www.vmp-edtech.com/validar/VMP-2026-XXXX`.
- [x] **EDGE-2**: La imagen extraída de los PDFs debe procesarse sin deformar la relación de aspecto del rostro.

## 5. Definition of Done (DoD)
- [x] **DoD-1**: Los 3 PDFs individuales y el PDF Máster consolidado están guardados en la carpeta del Escritorio.
- [x] **DoD-2**: Las credenciales se verifican correctamente en vivo en el sistema web.
- [x] **DoD-3**: Se generan imágenes de vista previa (PNG/Carousel) para presentar al usuario en el informe final.
