# Guía de Despliegue a Producción - VMP Servicios

¡Felicidades! El sistema está listo para producción. Se han implementado todas las configuraciones necesarias para un despliegue seguro y escalable.

## 📋 Requisitos Previos

1. Una cuenta en **Railway.app** (Backend + Database)
2. Una cuenta en **Vercel.com** (Frontend)
3. Un cliente Git configurado para subir el código a un repositorio (GitHub preferido).

---

## 🚀 Pasos para el Despliegue

### 1. Base de Datos (Railway)

1. En Railway, crea un nuevo proyecto y agrega una base de datos **PostgreSQL**.
2. Copia la `DATABASE_URL` (formato `postgresql://user:pass@host:port/db`).

### 2. Backend (Railway)

1. Conecta tu repositorio de GitHub a Railway.
2. Railway detectará automáticamente el archivo `railway.json` o el `Procfile`.
3. Configura las siguientes variables de entorno en Railway:
   - `DATABASE_URL`: (La que copiaste arriba)
   - `JWT_SECRET`: (Una cadena aleatoria larga y segura)
   - `ENVIRONMENT`: `production`
   - `SENTRY_DSN`: (Opcional, de tu cuenta de Sentry)
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`: (Tus credenciales de SendGrid/SMTP)
   - `FRONTEND_URL`: (La URL que obtendrás de Vercel)
   - `ADMIN_URL`: (La misma URL de Vercel)
   - `ADMIN_EMAIL`: (Email para el SuperAdmin inicial)
   - `ADMIN_PASSWORD`: (Contraseña para el SuperAdmin inicial)

4. **Migración y Seed**: Ejecuta los siguientes comandos en la terminal de Railway (o vía GitHub Actions):
   ```bash
   cd apps/api
   npx prisma migrate deploy
   python seed_production.py
   ```

### 3. Frontend (Vercel)

1. Importa el repositorio en Vercel.
2. Vercel detectará el monorepo y usará el `rootDirectory: "apps/web"`.
3. Configura las variables de entorno:
   - `NEXT_PUBLIC_API_URL`: (La URL que te asigne Railway para el backend)

---

## 🛡️ Monitoreo y Mantenimiento

### Logs Estructurados
El backend está configurado para emitir logs en formato JSON cuando no está en una terminal interactiva. Esto permite integrarlos fácilmente con Datadog, Logtail o el visor de Railway.

### Sentry
Si configuraste `SENTRY_DSN`, todos los errores no capturados se enviarán automáticamente a Sentry para su análisis.

---

## ✅ Validación Final

Una vez desplegado, puedes ejecutar el script de smoke test localmente apuntando a la URL de producción:

```bash
python smoke_test.py https://tu-api-backend.up.railway.app
```

---

## 🎯 Flujo Crítico de Prueba

1. **Página Pública**: Accede a la landing page y simula una cotización.
2. **SuperAdmin**: Ingresa al dashboard de SuperAdmin con las credenciales de `ADMIN_EMAIL` y `ADMIN_PASSWORD`.
3. **Conversión**: Convierte la cotización recibida en un cliente real.
4. **Email**: Verifica que el cliente reciba el email de bienvenida.
5. **Alumno**: Ingresa con una de las credenciales generadas para el alumno.
6. **Validación**: Escanea o ingresa el código de una credencial en la ruta `/validar/[codigo]`.

---

**¡El sistema está oficialmente listo para el lanzamiento!** 🚀
