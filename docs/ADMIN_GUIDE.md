# Guía del Administrador - VMP Servicios

## Acceso al Panel

URL: `https://vmpservicios.com/dashboard/super`

**Credenciales iniciales**:
- Email: `admin@vmpservicios.com`
- Contraseña: (configurada durante deployment)

> [!IMPORTANT]
> Cambia la contraseña después del primer login.

---

## Dashboard Principal

### Vista General

El dashboard muestra:
- **Total de usuarios** registrados
- **Empresas** activas
- **Cursos** disponibles
- **Inscripciones** totales
- **Credenciales** emitidas

---

## Gestión de Cotizaciones

### Ver Cotizaciones

1. Ir a **Cotizaciones** en el menú lateral
2. Ver lista de todas las cotizaciones
3. Filtrar por estado:
   - 🟡 **Pendiente**: Nueva cotización
   - 🔵 **Contactado**: Ya se contactó al cliente
   - 🟢 **Convertido**: Cliente activo
   - 🔴 **Rechazado**: No interesado

### Actualizar Estado

1. Click en una cotización
2. Seleccionar nuevo estado
3. Guardar cambios

### Convertir a Cliente

> [!CAUTION]
> Esta acción crea empresa, usuarios y inscripciones. No se puede deshacer fácilmente.

**Pasos**:

1. Ir a cotización con estado "Contactado"
2. Click en **"Convertir a Cliente"**
3. Completar formulario:
   - Razón social de la empresa
   - CUIT (debe ser único)
   - Dirección
   - Teléfono
   - Cantidad de alumnos

4. Click en **"Convertir"**

**Resultado**:
- ✅ Empresa creada
- ✅ Usuarios generados con credenciales temporales
- ✅ Inscripciones creadas
- ✅ Email enviado con credenciales

**Credenciales generadas**:
```
Email: alumno1@empresa.com
Password: VMP_temp_abc123

Email: alumno2@empresa.com
Password: VMP_temp_def456
...
```

> [!TIP]
> Copia las credenciales y envíalas al cliente por un canal seguro.

---

## Gestión de Empresas

### Ver Empresas

1. Ir a **Empresas**
2. Ver lista de empresas activas
3. Click en una empresa para ver detalles

### Información de Empresa

- Razón social
- CUIT
- Contacto
- Usuarios asociados
- Inscripciones activas

### Agregar Alumnos a Empresa

1. Ir a empresa
2. Click en **"Agregar Alumno"**
3. Completar datos del alumno
4. Seleccionar curso
5. Guardar

---

## Gestión de Usuarios

### Ver Usuarios

1. Ir a **Usuarios**
2. Filtrar por:
   - Rol (Alumno, Instructor, Admin)
   - Estado (Activo/Inactivo)
   - Empresa

### Crear Usuario

1. Click en **"Nuevo Usuario"**
2. Completar formulario:
   - Email (único)
   - Nombre y apellido
   - DNI
   - Teléfono
   - Rol
   - Empresa (opcional)

3. Guardar

**Contraseña temporal**: Se genera automáticamente y se envía por email.

### Desactivar Usuario

1. Ir a usuario
2. Click en **"Desactivar"**
3. Confirmar

> [!WARNING]
> El usuario no podrá iniciar sesión pero sus datos se conservan.

---

## Gestión de Cursos

### Ver Cursos

1. Ir a **Cursos**
2. Ver lista de cursos disponibles

### Información de Curso

- Nombre
- Código
- Descripción
- Duración
- Precio
- Inscripciones activas

### Crear Curso

1. Click en **"Nuevo Curso"**
2. Completar:
   - Nombre
   - Código único
   - Descripción
   - Duración (horas)
   - Precio

3. Guardar

---

## Gestión de Inscripciones

### Ver Inscripciones

1. Ir a **Inscripciones**
2. Filtrar por:
   - Estado (Activo, Completado, Cancelado)
   - Curso
   - Empresa

### Crear Inscripción

1. Click en **"Nueva Inscripción"**
2. Seleccionar:
   - Alumno
   - Curso
   - Fecha de inicio

3. Guardar

### Completar Inscripción

1. Ir a inscripción
2. Click en **"Marcar como Completado"**
3. Se genera automáticamente la credencial

---

## Credenciales

### Ver Credenciales

1. Ir a **Credenciales**
2. Ver lista de credenciales emitidas

### Información de Credencial

- Número único (VMP-2026-XXXXX)
- Alumno
- Curso
- Fecha de emisión
- Fecha de vencimiento
- PDF descargable
- QR code

### Validar Credencial

**Opción 1: Panel Admin**
1. Ir a **Credenciales**
2. Buscar por número
3. Ver estado

**Opción 2: Página Pública**
- URL: `https://vmpservicios.com/validar/{numero}`
- Compartible con terceros
- Sin login requerido

---

## Dashboard de Métricas

### Acceder a Métricas

1. Ir a **Métricas** en el menú
2. Ver dashboard completo

### KPIs Disponibles

**Totales**:
- Usuarios
- Empresas
- Cursos
- Inscripciones
- Credenciales
- Cotizaciones

**Conversión**:
- Cotizaciones por estado
- Tasa de conversión
- Tendencias

**Inscripciones**:
- Activas vs Completadas
- Tasa de completitud
- Por curso

### Exportar Reportes

1. Ir a sección de métricas
2. Click en **"Exportar"**
3. Seleccionar formato (CSV/PDF)
4. Descargar

---

## Configuración

### Cambiar Contraseña

1. Click en tu perfil (esquina superior derecha)
2. **"Cambiar Contraseña"**
3. Ingresar contraseña actual
4. Ingresar nueva contraseña
5. Confirmar

### Configuración de Email

Variables en `.env`:
```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASSWORD="your-api-key"
EMAIL_FROM="noreply@vmpservicios.com"
EMAIL_VENTAS="ventas@vmpservicios.com"
```

---

## Flujos Comunes

### Flujo 1: Nueva Cotización → Cliente

1. ✅ Cliente completa formulario en landing
2. ✅ Cotización aparece como "Pendiente"
3. 📞 Contactar al cliente
4. ✅ Actualizar estado a "Contactado"
5. ✅ Convertir a cliente
6. ✅ Copiar credenciales generadas
7. 📧 Enviar credenciales al cliente
8. ✅ Cliente accede y completa cursos

### Flujo 2: Agregar Alumnos a Empresa Existente

1. ✅ Ir a empresa
2. ✅ Click "Agregar Alumno"
3. ✅ Completar datos
4. ✅ Seleccionar curso
5. ✅ Guardar
6. ✅ Se crea usuario e inscripción
7. 📧 Email automático con credenciales

### Flujo 3: Emitir Credencial

1. ✅ Alumno completa curso
2. ✅ Ir a inscripción
3. ✅ Marcar como "Completado"
4. ✅ Se genera credencial automáticamente
5. ✅ PDF y QR disponibles
6. 📧 Email al alumno con credencial

---

## Troubleshooting

### No puedo convertir cotización

**Problema**: CUIT duplicado

**Solución**: 
- Verificar si la empresa ya existe
- Usar empresa existente en lugar de crear nueva

---

### Email no se envía

**Verificar**:
1. Configuración SMTP en `.env`
2. Logs del servidor
3. Cuota de SendGrid

---

### Credencial no se genera

**Verificar**:
1. Inscripción marcada como "Completado"
2. Logs del servidor
3. Permisos de escritura en carpeta de PDFs

---

## Soporte

Para ayuda adicional:
- Email: soporte@vmpservicios.com
- Documentación técnica: `/docs/API.md`
- Deployment: `/docs/DEPLOYMENT.md`
