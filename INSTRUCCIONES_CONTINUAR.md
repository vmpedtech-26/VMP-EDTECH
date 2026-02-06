# 🚀 Instrucciones para Continuar - Después del Día 2

**Fecha**: 02/02/2026 22:50  
**Estado Actual**: ✅ Día 2 completado al 100%  
**Próximo**: Día 3 - Validación Pública y Seguridad

---

## ✅ Lo Que Ya Está Listo

### Día 1 (Completado)
- ✅ Sistema de emails completo
- ✅ Actualización de estados desde UI
- ✅ 5 templates de email profesionales

### Día 2 (Completado)
- ✅ Conversión de cotizaciones a clientes
- ✅ Recuperación de contraseña completa
- ✅ Modal de conversión
- ✅ Páginas de forgot/reset password

---

## ⚠️ IMPORTANTE: Antes de Probar

### 1. Migración de Base de Datos
```bash
cd /Users/matias/.gemini/antigravity/scratch/vmp-servicios/apps/api
prisma migrate dev --name add_password_reset_tokens
```

### 2. Iniciar Servidores

**Backend**:
```bash
cd /Users/matias/.gemini/antigravity/scratch/vmp-servicios/apps/api
uvicorn main:app --reload
```

**Frontend**:
```bash
cd /Users/matias/.gemini/antigravity/scratch/vmp-servicios/apps/web
npm run dev
```

---

## 🧪 Cómo Probar las Nuevas Funcionalidades

### Probar Conversión de Cotización

1. **Crear una cotización de prueba**:
   - Ir a http://localhost:3000
   - Completar el cotizador
   - Enviar cotización

2. **Marcar como contactado**:
   - Ir a http://localhost:3000/dashboard/super/cotizaciones
   - Click en "Marcar Contactado"

3. **Convertir en cliente**:
   - Click en "Convertir en Cliente"
   - Completar el formulario (especialmente el CUIT)
   - Click en "Convertir en Cliente"
   - Verificar pantalla de éxito con credenciales

4. **Verificar**:
   - ✅ Empresa creada en BD
   - ✅ Alumnos creados
   - ✅ Inscripciones creadas
   - ✅ Email enviado (revisar logs si no hay SMTP configurado)
   - ✅ Cotización marcada como "converted"

---

### Probar Recuperación de Contraseña

1. **Solicitar reset**:
   - Ir a http://localhost:3000/login
   - Click en "¿Olvidaste tu contraseña?"
   - Ingresar email de un usuario existente
   - Click en "Enviar Link de Recuperación"

2. **Revisar email** (o logs si no hay SMTP):
   - Buscar el link de recuperación
   - Copiar el token del link

3. **Restablecer contraseña**:
   - Ir a http://localhost:3000/reset-password/[TOKEN]
   - Ingresar nueva contraseña
   - Confirmar contraseña
   - Click en "Restablecer Contraseña"

4. **Verificar login**:
   - Ir a http://localhost:3000/login
   - Ingresar email y nueva contraseña
   - Verificar acceso exitoso

---

## 📁 Archivos Importantes Creados Hoy

### Backend
```
apps/api/
├── prisma/schema.prisma                     # Modelo PasswordResetToken
├── routers/cotizaciones.py                  # Endpoint convert
├── routers/auth.py                          # Endpoints forgot/reset
├── services/email_service.py                # send_empresa_bienvenida
└── templates/email_empresa_bienvenida.html  # Template de email
```

### Frontend
```
apps/web/
├── lib/api.ts                               # convertCotizacionToClient
├── components/admin/ConvertQuoteModal.tsx   # Modal de conversión
├── app/dashboard/super/cotizaciones/page.tsx # Integración modal
├── app/forgot-password/page.tsx             # Página forgot
├── app/reset-password/[token]/page.tsx      # Página reset
└── app/login/page.tsx                       # Link actualizado
```

---

## 🚀 Próximo Día (Día 3)

### Objetivos Principales

**1. Validación Pública de Credenciales** (4h)
```
Crear:
- Endpoint: GET /api/credenciales/validar/{codigo}
- Página: /validar/{codigo}
- Mostrar: Datos de credencial, estado (válida/expirada)
```

**2. Seguridad** (8h)
```
Implementar:
- Rate limiting (FastAPI Limiter)
- CSRF protection
- Sanitización de inputs
- HTTPS config
```

**3. Dashboard de Métricas** (8h)
```
Crear:
- Gráficos de conversión
- Métricas de cursos
- Reportes exportables
```

---

## 📊 Progreso General

```
Día 1: ████████████████████ 100% ✅
Día 2: ████████████████████ 100% ✅
Día 3: ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Día 4: ░░░░░░░░░░░░░░░░░░░░   0%
Día 5: ░░░░░░░░░░░░░░░░░░░░   0%

Total: ████████░░░░░░░░░░░░ 40%
```

---

## 💡 Comandos Útiles

### Ver logs del backend
```bash
cd apps/api
tail -f logs/app.log
```

### Reiniciar base de datos (CUIDADO)
```bash
cd apps/api
prisma migrate reset
```

### Ver estado de migraciones
```bash
cd apps/api
prisma migrate status
```

### Generar cliente de Prisma
```bash
cd apps/api
prisma generate
```

---

## 📝 Notas Importantes

### Configuración de Email
Si quieres probar los emails reales, configura en `apps/api/.env`:
```bash
SMTP_PASSWORD="tu_sendgrid_api_key"
EMAIL_FROM="noreply@tudominio.com"
EMAIL_VENTAS="ventas@tudominio.com"
```

### Variables de Entorno
Asegúrate de tener en `apps/api/.env`:
```bash
DATABASE_URL="tu_conexion_postgresql"
ADMIN_URL="http://localhost:3000"
```

---

## 🐛 Troubleshooting

### Error: "Can't reach database server"
- Verificar que PostgreSQL esté corriendo
- Verificar `DATABASE_URL` en `.env`

### Error: "Module not found: Can't resolve '@/components/admin/ConvertQuoteModal'"
- Reiniciar servidor de Next.js
- Verificar que el archivo exista

### Error: "prisma.passwordresettoken is not a function"
- Ejecutar `prisma generate`
- Ejecutar `prisma migrate dev`

---

## 📚 Documentación Creada

- ✅ `DIA_1_COMPLETADO.md` - Resumen Día 1
- ✅ `DIA_2_COMPLETADO.md` - Resumen Día 2
- ✅ `RESUMEN_DIA_2.md` - Resumen ejecutivo
- ✅ `INSTRUCCIONES_CONTINUAR.md` - Este archivo

---

## 🎯 Checklist para Empezar Día 3

- [ ] Leer `DIA_2_COMPLETADO.md`
- [ ] Ejecutar migración de BD
- [ ] Iniciar backend y frontend
- [ ] Probar conversión de cotización
- [ ] Probar recuperación de contraseña
- [ ] Revisar plan del Día 3
- [ ] Empezar con validación pública

---

**¡Listo para continuar!** 🚀

Si tienes alguna duda, revisa los archivos de documentación o pregunta.

---

**Última actualización**: 02/02/2026 22:50  
**Próxima sesión**: Día 3 - Validación Pública y Seguridad
