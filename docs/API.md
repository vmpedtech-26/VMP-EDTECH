# API Documentation - VMP Servicios

## Descripción

API REST para la plataforma de capacitación profesional VMP Servicios. Proporciona endpoints para gestión de usuarios, cursos, inscripciones, cotizaciones y credenciales verificables.

**Base URL**: `http://localhost:8000/api`  
**Documentación interactiva**: `http://localhost:8000/docs`

---

## Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación.

### Obtener Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "contraseña"
}
```

**Respuesta**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "rol": "ALUMNO"
  }
}
```

### Usar Token

Incluir el token en el header `Authorization`:

```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## Rate Limiting

La API implementa rate limiting para prevenir abuso:

| Endpoint | Límite |
|----------|--------|
| `/api/auth/login` | 5 requests/minuto |
| `/api/auth/forgot-password` | 3 requests/minuto |
| `/api/public/*` | 20 requests/minuto |
| Otros endpoints | 60 requests/minuto |

**Respuesta cuando se excede el límite**:
```json
{
  "detail": "Rate limit exceeded"
}
```

---

## Endpoints

### Autenticación

#### POST /api/auth/login
Iniciar sesión.

**Request**:
```json
{
  "email": "usuario@example.com",
  "password": "contraseña"
}
```

**Response**: `200 OK`
```json
{
  "access_token": "token",
  "token_type": "bearer",
  "user": { ... }
}
```

---

#### POST /api/auth/forgot-password
Solicitar recuperación de contraseña.

**Request**:
```json
{
  "email": "usuario@example.com"
}
```

**Response**: `200 OK`
```json
{
  "message": "Si el email existe, recibirás un link de recuperación."
}
```

---

#### POST /api/auth/reset-password
Restablecer contraseña con token.

**Request**:
```json
{
  "token": "uuid-token",
  "new_password": "nuevaContraseña123"
}
```

**Response**: `200 OK`
```json
{
  "message": "Contraseña actualizada exitosamente."
}
```

---

#### GET /api/auth/me
Obtener información del usuario actual.

**Headers**: `Authorization: Bearer {token}`

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "email": "usuario@example.com",
  "nombre": "Juan",
  "apellido": "Pérez",
  "dni": "12345678",
  "rol": "ALUMNO",
  "empresaId": "uuid"
}
```

---

### Cotizaciones

#### POST /api/cotizaciones/
Crear nueva cotización (público, sin auth).

**Request**:
```json
{
  "empresa": "Empresa S.A.",
  "nombre": "Juan Pérez",
  "email": "contacto@empresa.com",
  "telefono": "1234567890",
  "quantity": 10,
  "course": "defensivo",
  "modality": "online",
  "totalPrice": 100000
}
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "empresa": "Empresa S.A.",
  "status": "pending",
  "createdAt": "2026-02-01T..."
}
```

---

#### GET /api/cotizaciones/
Listar cotizaciones (requiere SUPER_ADMIN).

**Headers**: `Authorization: Bearer {token}`

**Query Params**:
- `skip`: número (default: 0)
- `limit`: número (default: 100)
- `status`: "pending" | "contacted" | "converted" | "rejected"

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "empresa": "Empresa S.A.",
    "status": "pending",
    ...
  }
]
```

---

#### PATCH /api/cotizaciones/{id}/status
Actualizar estado de cotización (requiere SUPER_ADMIN).

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "status": "contacted"
}
```

**Response**: `200 OK`

---

#### POST /api/cotizaciones/{id}/convert
Convertir cotización en cliente (requiere SUPER_ADMIN).

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "empresa_nombre": "Empresa S.A.",
  "cuit": "20-12345678-9",
  "direccion": "Calle 123",
  "telefono": "1234567890",
  "cantidad_alumnos": 10
}
```

**Response**: `200 OK`
```json
{
  "empresa": { ... },
  "alumnos": [
    {
      "email": "alumno1@empresa.com",
      "password": "temp_pass_123"
    }
  ],
  "inscripciones": [ ... ]
}
```

---

### Validación Pública

#### GET /api/public/validar/{numero}
Validar credencial públicamente (sin auth).

**Response**: `200 OK`
```json
{
  "valid": true,
  "status": "valid",
  "credential": {
    "numero": "VMP-2026-00001",
    "fechaEmision": "2026-02-01T...",
    "alumno": {
      "nombre": "Juan",
      "apellido": "Pérez",
      "dni": "12345678"
    },
    "curso": {
      "nombre": "Manejo Defensivo",
      "codigo": "COND-DEF"
    }
  }
}
```

---

### Métricas

#### GET /api/metrics/overview
Obtener métricas generales (requiere SUPER_ADMIN).

**Headers**: `Authorization: Bearer {token}`

**Response**: `200 OK`
```json
{
  "totals": {
    "users": 150,
    "companies": 25,
    "courses": 4,
    "enrollments": 200,
    "credentials": 180,
    "quotes": 50
  },
  "quotes": {
    "pending": 10,
    "contacted": 15,
    "converted": 20,
    "rejected": 5,
    "conversion_rate": 40.0
  },
  "enrollments": {
    "active": 120,
    "completed": 80,
    "completion_rate": 40.0
  }
}
```

---

#### GET /api/metrics/courses
Obtener estadísticas por curso (requiere SUPER_ADMIN).

**Headers**: `Authorization: Bearer {token}`

**Response**: `200 OK`
```json
{
  "courses": [
    {
      "id": "uuid",
      "nombre": "Manejo Defensivo",
      "codigo": "COND-DEF",
      "total_enrollments": 50,
      "total_credentials": 45,
      "completed_enrollments": 45,
      "completion_rate": 90.0
    }
  ]
}
```

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido o faltante |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 422 | Validation Error - Error de validación |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Error del servidor |

---

## Tipos de Datos

### Roles de Usuario
- `ALUMNO`: Usuario estudiante
- `INSTRUCTOR`: Instructor de cursos
- `EMPRESA_ADMIN`: Administrador de empresa
- `SUPER_ADMIN`: Administrador del sistema

### Estados de Cotización
- `pending`: Pendiente de contacto
- `contacted`: Contactado
- `converted`: Convertido en cliente
- `rejected`: Rechazado

### Cursos Disponibles
- `defensivo`: Manejo Defensivo
- `carga_pesada`: Carga Pesada
- `4x4`: 4x4 Profesional
- `completo`: Paquete Completo

### Modalidades
- `online`: 100% Online
- `presencial`: Presencial
- `mixto`: Mixto

---

## Ejemplos de Uso

### Flujo Completo: Cotización → Cliente

```bash
# 1. Crear cotización (público)
curl -X POST http://localhost:8000/api/cotizaciones/ \
  -H "Content-Type: application/json" \
  -d '{
    "empresa": "Tech Corp",
    "nombre": "María García",
    "email": "maria@techcorp.com",
    "telefono": "1234567890",
    "quantity": 5,
    "course": "defensivo",
    "modality": "online",
    "totalPrice": 50000
  }'

# 2. Login como admin
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vmp.com",
    "password": "adminpass"
  }'

# 3. Actualizar estado a "contacted"
curl -X PATCH http://localhost:8000/api/cotizaciones/1/status \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"status": "contacted"}'

# 4. Convertir en cliente
curl -X POST http://localhost:8000/api/cotizaciones/1/convert \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "empresa_nombre": "Tech Corp S.A.",
    "cuit": "20-12345678-9",
    "direccion": "Av. Principal 123",
    "telefono": "1234567890",
    "cantidad_alumnos": 5
  }'
```

---

## Soporte

Para más información o soporte:
- Email: soporte@vmpservicios.com
- Documentación interactiva: http://localhost:8000/docs
