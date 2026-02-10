# 🚀 Día 2 - Conversión y Recuperación de Contraseña

**Fecha**: 02/02/2026  
**Tiempo estimado**: 17 horas  
**Estado**: 🔄 EN PROGRESO (50% completado)

---

## 🎯 Objetivos del Día 2

### 1. Conversión de Cotización a Cliente (12h) - ✅ 90% COMPLETADO
Automatizar el proceso de convertir una cotización en cliente activo, creando:
- ✅ Empresa en el sistema
- ✅ Alumnos según cantidad especificada
- ✅ Inscripciones al curso seleccionado
- ✅ Envío de emails de bienvenida

### 2. Recuperación de Contraseña (5h) - ⏳ PENDIENTE
Implementar sistema completo de recuperación de contraseña:
- ⏳ Endpoint para solicitar reset
- ⏳ Generación de tokens seguros
- ⏳ Página de reset de contraseña
- ⏳ Emails de recuperación

---

## 📋 Plan de Implementación

### Parte 1: Conversión de Cotización a Cliente (12h)

#### Backend (6h)

**1.1. Endpoint de Conversión** (2h)
- ✅ Crear `POST /api/cotizaciones/{id}/convert`
- ✅ Validar que la cotización exista y esté en estado "contacted"
- ✅ Crear empresa con datos de la cotización
- ✅ Generar contraseña temporal para la empresa
- ✅ Retornar empresa creada + credenciales

**1.2. Creación de Alumnos** (2h)
- ✅ Crear endpoint auxiliar o lógica interna
- ✅ Generar N alumnos según quantity de la cotización
- ✅ Asignar nombres temporales (Alumno 1, Alumno 2, etc.)
- ✅ Generar credenciales únicas para cada alumno
- ✅ Asociar alumnos a la empresa

**1.3. Inscripciones Automáticas** (1h)
- ✅ Buscar curso según el tipo seleccionado en cotización
- ✅ Crear inscripciones para todos los alumnos
- ✅ Establecer estado inicial (pendiente)
- ✅ Calcular fecha de expiración

**1.4. Emails de Bienvenida** (1h)
- ✅ Enviar email a la empresa con credenciales
- ✅ Incluir instrucciones de acceso
- ✅ Incluir próximos pasos
- ✅ Manejo de errores en envío

#### Frontend (6h)

**2.1. Modal de Conversión** (3h)
- ✅ Crear componente `ConvertQuoteModal.tsx`
- ✅ Formulario para confirmar/ajustar datos:
  - Nombre de empresa (pre-llenado)
  - CUIT (pre-llenado)
  - Email de contacto (pre-llenado)
  - Cantidad de alumnos (pre-llenado, editable)
  - Curso (pre-llenado)
- ✅ Botón de confirmación
- ✅ Estados de carga
- ✅ Manejo de errores

**2.2. Integración en Panel Admin** (2h)
- ✅ Agregar botón "Convertir en Cliente" en lista de cotizaciones
- ✅ Mostrar solo para cotizaciones en estado "contacted"
- ✅ Abrir modal al hacer click
- ✅ Actualizar lista después de conversión exitosa
- ✅ Mostrar mensaje de éxito con credenciales

**2.3. Vista de Confirmación** (1h)
- ✅ Pantalla de éxito después de conversión
- ✅ Mostrar credenciales generadas
- ✅ Botón para copiar credenciales
- ✅ Opción para enviar email nuevamente
- ✅ Link directo a la empresa creada

---

### Parte 2: Recuperación de Contraseña (5h)

#### Backend (3h)

**3.1. Modelo de Tokens** (30min)
- ✅ Crear tabla `PasswordResetToken` en Prisma schema
- ✅ Campos: token, userId, expiresAt, used
- ✅ Migración de base de datos

**3.2. Endpoints de Reset** (1.5h)
- ✅ `POST /api/auth/forgot-password`
  - Recibir email
  - Validar que el usuario exista
  - Generar token seguro (UUID)
  - Guardar en BD con expiración (1 hora)
  - Enviar email con link de reset
- ✅ `POST /api/auth/reset-password`
  - Recibir token + nueva contraseña
  - Validar token (existe, no usado, no expirado)
  - Hash de nueva contraseña
  - Actualizar contraseña del usuario
  - Marcar token como usado

**3.3. Email de Recuperación** (1h)
- ✅ Template HTML profesional
- ✅ Link con token incluido
- ✅ Instrucciones claras
- ✅ Tiempo de expiración visible
- ✅ Información de seguridad

#### Frontend (2h)

**4.1. Página Forgot Password** (1h)
- ✅ Crear `/forgot-password`
- ✅ Formulario con email
- ✅ Validación de email
- ✅ Estados de carga
- ✅ Mensaje de confirmación
- ✅ Link para volver al login

**4.2. Página Reset Password** (1h)
- ✅ Crear `/reset-password/[token]`
- ✅ Formulario con nueva contraseña
- ✅ Confirmación de contraseña
- ✅ Validación de fortaleza
- ✅ Estados de carga
- ✅ Manejo de errores (token inválido/expirado)
- ✅ Redirección a login después de éxito

---

## 📁 Archivos a Crear/Modificar

### Backend
```
apps/api/
├── routers/
│   ├── cotizaciones.py          # Modificar - agregar endpoint convert
│   └── auth.py                  # Modificar - agregar forgot/reset
├── services/
│   └── email_service.py         # Modificar - agregar templates
├── templates/
│   ├── email_empresa_bienvenida.html    # Nuevo
│   └── email_reset_password.html        # Ya existe, revisar
└── prisma/
    └── schema.prisma            # Modificar - agregar PasswordResetToken
```

### Frontend
```
apps/web/
├── app/
│   ├── forgot-password/
│   │   └── page.tsx             # Nuevo
│   ├── reset-password/
│   │   └── [token]/
│   │       └── page.tsx         # Nuevo
│   └── dashboard/super/cotizaciones/
│       └── page.tsx             # Modificar - agregar modal
├── components/
│   └── admin/
│       └── ConvertQuoteModal.tsx    # Nuevo
└── lib/
    └── api.ts                   # Modificar - agregar funciones
```

---

## 🧪 Testing

### Conversión de Cotización
1. Crear cotización desde landing
2. Marcar como "contactado" en admin
3. Click en "Convertir en Cliente"
4. Verificar modal con datos pre-llenados
5. Confirmar conversión
6. Verificar:
   - ✅ Empresa creada en BD
   - ✅ N alumnos creados
   - ✅ Inscripciones creadas
   - ✅ Email enviado
   - ✅ Cotización marcada como "converted"

### Recuperación de Contraseña
1. Ir a `/login`
2. Click en "Olvidé mi contraseña"
3. Ingresar email
4. Verificar email recibido
5. Click en link del email
6. Ingresar nueva contraseña
7. Confirmar
8. Verificar login con nueva contraseña

---

## 📊 Progreso

```
Día 1: ████████████████████ 100% ✅ COMPLETADO
Día 2: ░░░░░░░░░░░░░░░░░░░░   0% 🔄 EN PROGRESO
Día 3: ░░░░░░░░░░░░░░░░░░░░   0%
Día 4: ░░░░░░░░░░░░░░░░░░░░   0%
Día 5: ░░░░░░░░░░░░░░░░░░░░   0%

Progreso Total: 20% (1/5 días)
```

---

## 🚀 Próximos Pasos

### Ahora Mismo
1. ✅ Crear endpoint de conversión en backend
2. ✅ Implementar lógica de creación de empresa + alumnos
3. ✅ Crear template de email de bienvenida
4. ✅ Crear modal de conversión en frontend

### Después
1. Implementar recuperación de contraseña
2. Testing completo
3. Documentar proceso

---

**Última actualización**: 02/02/2026 22:24  
**Próxima sesión**: Continuar con Día 2
