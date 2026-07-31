# VMP-EDTECH — n8n Automation Workflows

## Arquitectura

```
VMP-API (FastAPI / Railway)
    │
    └── WebhookService (HMAC-SHA256 firmado)
              │
         n8n Cloud (vmpedtech.app.n8n.cloud)
              │
    ┌─────────┼──────────────┬──────────────────┐
    │         │              │                  │
01-lead-  02-credential- 03-invoice-      04-company-
crm.json  whatsapp.json  email.json       onboarding.json
```

## Workflows

| # | Nombre | Trigger | Integraciones |
|---|--------|---------|---------------|
| 01 | Lead CRM + Alertas | `lead.created` webhook | Google Sheets, WhatsApp/Twilio, Email |
| 02 | Credencial WhatsApp | `credential.issued` webhook | WhatsApp/Twilio, Email |
| 03 | Factura por Email | Gmail (cron) | Gmail, VMP API, Email |
| 04 | Onboarding B2B | `company.onboarded` webhook | Brevo, Email (3 secuencias), Notion |

## Variables de Entorno en n8n

Configurar estas variables en **Settings → Variables** de n8n Cloud:

| Variable | Descripción |
|----------|-------------|
| `VMP_WEBHOOK_SECRET` | Secret HMAC compartido con la API (debe coincidir con `N8N_WEBHOOK_SECRET` en Railway) |
| `TWILIO_ACCOUNT_SID` | SID de la cuenta Twilio |
| `TWILIO_AUTH_TOKEN` | Token de Twilio |
| `TWILIO_WHATSAPP_FROM` | Número WhatsApp de Twilio (ej: `whatsapp:+14155238886`) |
| `TWILIO_SALES_PHONE` | Teléfono del equipo de ventas para alertas |
| `BREVO_API_KEY` | API Key de Brevo (para email marketing) |
| `NOTION_API_KEY` | Token de integración de Notion |
| `NOTION_SOPORTE_DB_ID` | ID de la base de datos de soporte en Notion |
| `ADMIN_EMAIL` | Email del administrador para notificaciones del sistema |

## Variables de Entorno en Railway (VMP API)

Configurar en Railway → VMP API Service → Variables:

| Variable | Descripción |
|----------|-------------|
| `N8N_WEBHOOK_URL` | URL base del webhook n8n (ej: `https://vmpedtech.app.n8n.cloud/webhook/`) |
| `N8N_WEBHOOK_SECRET` | Secret HMAC (mismo valor que `VMP_WEBHOOK_SECRET` en n8n) |

## Importar Workflows en n8n

1. Ir a https://vmpedtech.app.n8n.cloud
2. Click **+ New Workflow** → **Import from file**
3. Seleccionar cada JSON de esta carpeta
4. Configurar las credenciales requeridas en cada nodo
5. Activar el workflow

## Endpoints de la API para n8n

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/automation/health` | GET | Estado del canal de automatización |
| `/api/automation/events/catalog` | GET | Catálogo de eventos disponibles |
| `/api/automation/test-webhook` | POST | Prueba la integración end-to-end |
| `/api/automation/invoice-email` | POST | n8n envía facturas recibidas por email |

## Generación del Secret HMAC

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Copiar el resultado y usarlo como valor de:
- `N8N_WEBHOOK_SECRET` en Railway
- `VMP_WEBHOOK_SECRET` en n8n Variables
