# 🛡️ Guía de Seguridad VMP

**Versión**: 1.0  
**Fecha**: 03/02/2026  
**Estado**: Implementado

---

## 📋 Resumen Ejecutivo

Esta guía documenta todas las medidas de seguridad implementadas en VMP Servicios, incluyendo configuración, mejores prácticas y procedimientos de respuesta a incidentes.

---

## 🔒 Medidas de Seguridad Implementadas

### 1. Autenticación y Autorización

#### JWT (JSON Web Tokens)
- **Algoritmo**: HS256
- **Expiración**: 60 minutos
- **Refresh Token**: 7 días
- **Secret**: Almacenado en variable de entorno

**Configuración:**
```bash
JWT_SECRET=<strong-random-secret>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
```

**Mejores Prácticas:**
- ✅ Secret de al menos 32 caracteres
- ✅ Rotar secret cada 90 días en producción
- ✅ Nunca commitear secret en git
- ✅ Usar diferentes secrets por entorno

#### Contraseñas
- **Hashing**: bcrypt
- **Rounds**: 12 (default)
- **Validación**: Mínimo 6 caracteres

**Mejores Prácticas:**
- ✅ Nunca almacenar contraseñas en texto plano
- ✅ Validar fortaleza en frontend y backend
- ✅ Implementar política de expiración (opcional)
- ✅ Prevenir reutilización de contraseñas (opcional)

---

### 2. Rate Limiting

#### Configuración por Endpoint

| Endpoint | Límite | Razón |
|----------|--------|-------|
| `/api/auth/login` | 5/min | Prevenir brute force |
| `/api/auth/forgot-password` | 3/min | Prevenir spam de emails |
| `/api/public/validar/{numero}` | 20/min | Balance entre uso legítimo y abuso |
| `/api/cotizaciones/` (POST) | 20/min | Prevenir spam de cotizaciones |
| General API | 60/min | Protección general |

#### Respuesta a Rate Limit Excedido

```json
{
  "error": "Rate limit exceeded",
  "retry_after": 60
}
```

**Headers:**
- `X-RateLimit-Limit`: Límite total
- `X-RateLimit-Remaining`: Requests restantes
- `X-RateLimit-Reset`: Timestamp de reset

#### Ajustar Rate Limits

Editar `apps/api/middleware/security.py`:

```python
def rate_limit_login():
    return limiter.limit("10/minute")  # Ajustar según necesidad
```

---

### 3. CORS (Cross-Origin Resource Sharing)

#### Configuración por Entorno

**Desarrollo:**
```python
BACKEND_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]
```

**Producción:**
```python
BACKEND_CORS_ORIGINS = [
    "https://vmpservicios.com",
    "https://www.vmpservicios.com",
    "https://app.vmpservicios.com",
]
```

#### Agregar Nuevo Dominio

1. Editar `apps/api/core/config.py`
2. Agregar dominio a lista de producción:
```python
if self.ENVIRONMENT == "production":
    return [
        "https://vmpservicios.com",
        "https://nuevo-dominio.com",  # Agregar aquí
    ]
```
3. Redeploy backend

---

### 4. Headers de Seguridad

#### Headers Implementados

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: [ver abajo]
X-Request-ID: <unique-id>
```

#### Content Security Policy (CSP)

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' data:;
connect-src 'self' http://localhost:* https:;
```

**Nota**: `unsafe-inline` y `unsafe-eval` están permitidos para desarrollo. En producción, considerar removerlos.

#### Modificar Headers

Editar `apps/api/middleware/security.py`:

```python
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable):
        response = await call_next(request)
        # Modificar headers aquí
        response.headers["X-Custom-Header"] = "value"
        return response
```

---

### 5. Sanitización de Inputs

#### Implementación

**Backend (Pydantic Validators):**
```python
from core.security_utils import sanitize_data

@validator('campo_texto', pre=True)
def sanitize_text(cls, v):
    if isinstance(v, str):
        return sanitize_data(v)
    return v
```

**Función de Sanitización:**
```python
import bleach

def sanitize_html(text: str) -> str:
    if not text:
        return text
    return bleach.clean(text, tags=[], attributes={}, strip=True)
```

#### Campos Sanitizados

- ✅ Cotizaciones: empresa, nombre, comentarios
- ✅ Conversión: empresaNombre, empresaCuit, empresaDireccion
- ✅ Todos los campos de texto de usuario

#### Agregar Sanitización a Nuevo Campo

```python
class MiSchema(BaseModel):
    nuevo_campo: str
    
    @validator('nuevo_campo', pre=True)
    def sanitize_text(cls, v):
        if isinstance(v, str):
            return sanitize_data(v)
        return v
```

---

### 6. HTTPS y SSL/TLS

#### Configuración Recomendada

**Producción:**
- ✅ Certificado SSL válido (Let's Encrypt)
- ✅ TLS 1.2 o superior
- ✅ HSTS habilitado
- ✅ Redirección HTTP → HTTPS

**Verificar SSL:**
```bash
curl -I https://api.vmpservicios.com
# Verificar: Strict-Transport-Security header
```

---

## 🚨 Respuesta a Incidentes

### Procedimiento General

1. **Detección**
   - Monitoreo de logs (Sentry)
   - Alertas automáticas
   - Reportes de usuarios

2. **Contención**
   - Identificar alcance
   - Aislar sistema afectado
   - Bloquear IPs maliciosas

3. **Erradicación**
   - Eliminar vulnerabilidad
   - Parchear sistema
   - Actualizar dependencias

4. **Recuperación**
   - Restaurar desde backup
   - Verificar integridad
   - Monitorear comportamiento

5. **Post-Mortem**
   - Documentar incidente
   - Actualizar procedimientos
   - Implementar mejoras

### Escenarios Comunes

#### Brute Force en Login

**Detección:**
```
Múltiples requests fallidos desde misma IP
```

**Respuesta:**
1. Verificar logs de rate limiting
2. Bloquear IP si es necesario:
```python
# En middleware/security.py
BLOCKED_IPS = ["1.2.3.4"]

if get_remote_address(request) in BLOCKED_IPS:
    raise HTTPException(status_code=403)
```
3. Notificar al usuario afectado

#### Intento de XSS

**Detección:**
```
Scripts en campos de texto
```

**Respuesta:**
1. Verificar que sanitización funcionó
2. Revisar logs para identificar origen
3. Bloquear IP si es ataque persistente
4. Actualizar reglas de sanitización si es necesario

#### DDoS

**Detección:**
```
Tráfico anormalmente alto
Rate limits excedidos constantemente
```

**Respuesta:**
1. Activar protección DDoS del proveedor (Railway/Vercel)
2. Reducir rate limits temporalmente
3. Implementar CAPTCHA en endpoints críticos
4. Contactar proveedor de hosting

---

## 📊 Monitoreo y Auditoría

### Logs a Monitorear

**Críticos:**
- ✅ Intentos de login fallidos
- ✅ Rate limits excedidos
- ✅ Errores 500
- ✅ Cambios en usuarios/permisos

**Importantes:**
- ✅ Creación de cotizaciones
- ✅ Conversión de clientes
- ✅ Envío de emails
- ✅ Validación de credenciales

### Herramientas

**Sentry (Implementado):**
- Tracking de errores
- Performance monitoring
- Release tracking

**Logs Estructurados:**
```python
import logging

logger = logging.getLogger(__name__)
logger.info(f"Login exitoso: {user.email}")
logger.warning(f"Rate limit excedido: {ip}")
logger.error(f"Error en endpoint: {error}")
```

---

## 🔐 Checklist de Seguridad

### Pre-Deploy a Producción

**Backend:**
- [ ] `ENVIRONMENT=production` configurado
- [ ] `JWT_SECRET` único y fuerte
- [ ] CORS configurado con dominios de producción
- [ ] Rate limits apropiados
- [ ] HTTPS habilitado
- [ ] Sentry configurado
- [ ] Logs estructurados activos
- [ ] Backups automáticos configurados

**Frontend:**
- [ ] URLs de API apuntando a producción
- [ ] HTTPS habilitado
- [ ] Variables de entorno de producción
- [ ] CSP configurado
- [ ] Analytics configurado

**Base de Datos:**
- [ ] Conexiones SSL habilitadas
- [ ] Credenciales rotadas
- [ ] Backups automáticos
- [ ] Acceso restringido por IP

### Mantenimiento Regular

**Semanal:**
- [ ] Revisar logs de errores
- [ ] Verificar rate limits
- [ ] Monitorear uso de recursos

**Mensual:**
- [ ] Actualizar dependencias
- [ ] Revisar políticas de seguridad
- [ ] Auditar accesos

**Trimestral:**
- [ ] Rotar JWT_SECRET
- [ ] Auditoría de seguridad completa
- [ ] Actualizar documentación

---

## 📚 Recursos Adicionales

### Documentación
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)

### Herramientas de Testing
- [OWASP ZAP](https://www.zaproxy.org/) - Security scanner
- [Burp Suite](https://portswigger.net/burp) - Penetration testing
- [SSL Labs](https://www.ssllabs.com/ssltest/) - SSL testing

---

## 🆘 Contactos de Emergencia

**Incidentes de Seguridad:**
- Email: security@vmpservicios.com
- Teléfono: [AGREGAR]

**Soporte Técnico:**
- Email: soporte@vmpservicios.com
- Teléfono: [AGREGAR]

**Proveedores:**
- Railway: support@railway.app
- Vercel: support@vercel.com
- Supabase: support@supabase.com

---

**Última actualización**: 03/02/2026  
**Próxima revisión**: 03/05/2026
