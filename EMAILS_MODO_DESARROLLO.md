# 📧 Configuración de Emails - Modo Desarrollo

## ✅ Sistema Configurado

El sistema de emails está configurado para funcionar en **modo desarrollo** sin necesidad de SendGrid.

### ¿Qué significa esto?

Cuando no hay una API key de SendGrid configurada, el sistema:
- ✅ **NO falla** al enviar emails
- ✅ **Registra los emails en los logs** del backend
- ✅ Puedes ver qué emails se enviarían en la consola
- ✅ Todo el flujo funciona normalmente

---

## 🧪 Cómo Probar

### 1. Iniciar el sistema

```bash
# Terminal 1 - Backend
cd /Users/matias/.gemini/antigravity/scratch/vmp-servicios/apps/api
uvicorn main:app --reload

# Terminal 2 - Frontend
cd /Users/matias/.gemini/antigravity/scratch/vmp-servicios/apps/web
npm run dev
```

### 2. Crear una cotización

1. Ve a http://localhost:3000
2. Completa el cotizador
3. Envía la cotización

### 3. Ver los emails en los logs

En la **Terminal 1** (backend) verás algo como:

```
================================================================================
📧 EMAIL (DEVELOPMENT MODE - NOT SENT)
To: ventas@vmpservicios.com
From: noreply@vmpservicios.com
Subject: Nueva Cotización: Empresa SA - 50 conductores
Content preview: <!DOCTYPE html>...
================================================================================

================================================================================
📧 EMAIL (DEVELOPMENT MODE - NOT SENT)
To: cliente@empresa.com
From: noreply@vmpservicios.com
Subject: Recibimos tu solicitud de cotización - VMP Servicios
Content preview: <!DOCTYPE html>...
================================================================================
```

---

## 🔧 Configurar SendGrid (Opcional - Para Producción)

Cuando quieras enviar emails reales:

### 1. Obtener API Key

1. Ve a https://app.sendgrid.com/
2. Regístrate o inicia sesión
3. Settings → API Keys → Create API Key
4. Nombre: "VMP Servicios"
5. Permisos: Full Access
6. Copia la API key

### 2. Configurar en el proyecto

Edita `apps/api/.env`:

```bash
SMTP_PASSWORD="SG.tu-api-key-real-aqui"
```

### 3. Reiniciar el backend

```bash
# Ctrl+C para detener
# Luego volver a iniciar
uvicorn main:app --reload
```

Ahora los emails se enviarán realmente.

---

## ✅ Ventajas del Modo Desarrollo

- ✅ No necesitas configurar SendGrid para desarrollar
- ✅ No gastas cuota de emails durante desarrollo
- ✅ Puedes ver exactamente qué se enviaría
- ✅ Más rápido (no espera respuesta de SendGrid)
- ✅ Funciona offline

---

## 📊 Estado Actual

```
Sistema de Emails: ✅ FUNCIONANDO (Modo Desarrollo)
Actualización de Estados: ✅ FUNCIONANDO
SendGrid: ⏳ Opcional (configurar para producción)
```

---

**¡Listo para probar!** 🚀

El sistema está completamente funcional. Los emails se registrarán en los logs del backend en lugar de enviarse realmente.
