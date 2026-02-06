# ✅ Checklist de Despliegue Final - VMP Servicios

Este documento resume los pasos críticos para lanzar la plataforma a producción.

## 1. Repositorio GitHub
- [ ] Subir todos los cambios actuales:
  ```bash
  ./COMPLETE_DEPLOY.sh
  ```
- [ ] Verificar que los workflows en `.github/workflows/` se activen correctamente.

## 2. Backend (Railway)
- [ ] **Database**: Crear una base de datos PostgreSQL en Railway.
- [ ] **Variables de Entorno**: Configurar las siguientes variables en el servicio `backend`:
  - `DATABASE_URL`: (Provisto por Railway)
  - `JWT_SECRET`: (Generar una cadena larga y segura)
  - `ENVIRONMENT`: `production`
  - `FRONTEND_URL`: (URL de Vercel, ej: `https://vmp-servicios.vercel.app`)
  - `ADMIN_URL`: (Misma URL de Vercel)
  - `SMTP_HOST`: `smtp.sendgrid.net` (o tu proveedor)
  - `SMTP_PORT`: `587`
  - `SMTP_USER`: `apikey`
  - `SMTP_PASSWORD`: (Tu API Key de SendGrid)
  - `EMAIL_FROM`: `noreply@tu-dominio.com`
  - `EMAIL_VENTAS`: `ventas@tu-dominio.com`
  - `ADMIN_EMAIL`: (Email para el SuperAdmin inicial)
  - `ADMIN_PASSWORD`: (Contraseña segura para el SuperAdmin)
- [ ] **Migraciones**: Ejecutar `npx prisma migrate deploy` en la consola de Railway.
- [ ] **Seed**: Ejecutar `python seed_production.py` para cargar los cursos base y el SuperAdmin.

## 3. Frontend (Vercel)
- [ ] **Importar Proyecto**: Conectar el repo en Vercel.
- [ ] **Root Directory**: Asegurarse de que sea `apps/web`.
- [ ] **Variables de Entorno**:
  - `NEXT_PUBLIC_API_URL`: (URL de Railway, ej: `https://vmp-api.up.railway.app`)
- [ ] **Build**: Verificar que el build termine exitosamente.

## 4. Verificación Post-Lanzamiento
- [ ] **Prueba de Humo**: Ejecutar `python smoke_test.py https://tu-api.up.railway.app`.
- [ ] **Login**: Acceder al panel de SuperAdmin con las credenciales configuradas.
- [ ] **Landing**: Verificar que el botó de "Cotizar" funcione y envíe datos correctamente.
- [ ] **Blog**: Verificar que los nuevos artículos sean legibles.

---

**¡Éxito en el lanzamiento!** 🚀
