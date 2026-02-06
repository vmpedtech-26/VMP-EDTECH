# Guia DNS: Conectando Hostinger con la Infraestructura Cloud

Para que tu proyecto funcione con tu dominio de Hostinger pero con la potencia de FastAPI y Next.js, debemos configurar el panel de DNS de Hostinger.

## 📝 Pasos en el Panel de Hostinger

1. Accede a **hPanel** > **Dominios** > **[Tu Dominio]** > **DNS / Servidores de nombres**.
2. Deberás crear/editar los siguientes registros:

### 1. Registro para el Backend (API)
Este registro permitirá que tu frontend se comunique con el servidor de base de datos y lógica.

| Tipo | Nombre (Host) | Valor (Apunta a) | TTL |
|------|---------------|------------------|-----|
| **CNAME** | `api` | `vmp-backend.up.railway.app` (Obtener de Railway) | 14400 |

### 2. Registro para el Frontend (Web)
Este registro hará que tu dominio principal muestre la aplicación Next.js.

| Tipo | Nombre (Host) | Valor (Apunta a) | TTL |
|------|---------------|------------------|-----|
| **CNAME** | `www` | `cname.vercel-dns.com` | 14400 |
| **A** | `@` | `76.76.21.21` (IP de Vercel) | 14400 |

---

## 🚀 Configuración en los Proveedores Cloud

### En Railway (Backend)
1. Ve a **Settings** > **Domains**.
2. Haz clic en **Custom Domain**.
3. Ingresa `api.tudominio.com`.
4. Railway verificará que el CNAME en Hostinger esté correcto y generará el SSL automáticamente.

### En Vercel (Frontend)
1. Ve a **Settings** > **Domains**.
2. Haz clic en **Add**.
3. Ingresa `tudominio.com`.
4. Vercel te pedirá confirmar los registros A y CNAME (que ya configuramos en Hostinger).

---

## 📧 Nota sobre Emails
Esta configuración **NO afecta tus emails de Hostinger**. Tus registros MX (Mail Exchange) seguirán apuntando a los servidores de correo de Hostinger, por lo que podrás seguir usando `info@tudominio.com` sin problemas.

---

## ✅ Verificación
Una vez guardados los cambios, pueden tardar desde unos minutos hasta 24hs en propagarse (habitualmente son 15-30 min). Puedes verificar el estado en [DNSChecker.org](https://dnschecker.org).
