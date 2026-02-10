# PASOS FINALES PARA EL DESPLIEGUE DE VMP SERVICIOS

¡Felicidades! La infraestructura base ya está montada. Solo falta conectar el Frontend con el Backend.

## 1. Obtener URL del Backend (Railway)
1. Ve a [Railway Dashboard](https://railway.app/dashboard).
2. Entra al proyecto **ingenious-enthusiasm**.
3. Haz clic en el servicio **vmp-servicios**.
4. Ve a la pestaña **Settings** -> Sección **Networking**.
5. Copia la **Public Networking URL** (ej: `vmp-servicios-production.up.railway.app`).
   * **NOTA:** Si no hay URL, haz clic en "Generate Domain" y asegúrate que el puerto sea `8000`.

## 2. Obtener URL del Frontend (Vercel)
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard).
2. Entra al proyecto **vmp-edtech-web**.
3. Copia el dominio principal (ej: `vmp-edtech-web.vercel.app`).

## 3. Conectar los Servicios (Variables de Entorno)

### En Vercel (Frontend conecta a Backend)
1. Ve a **Settings** -> **Environment Variables** en el proyecto de Vercel.
2. Edita (o agrega) la variable `NEXT_PUBLIC_API_URL`.
3. Pega la URL de Railway (asegúrate de que empiece con `https://` y NO tenga barra al final).
   * Ejemplo: `https://vmp-servicios-production.up.railway.app`
4. Ve a la pestaña **Deployments**, haz clic en el último deploy (o los tres puntos) y selecciona **Redeploy** para aplicar el cambio.

### En Railway (Backend permite al Frontend)
1. Ve a la pestaña **Variables** en el servicio de Railway.
2. Agrega una nueva variable llamada `CORS_ORIGINS`.
3. Pega la URL de Vercel (ej: `https://vmp-edtech-web.vercel.app`).
   * Si tienes dominio propio (Hostinger), agrégalo también separado por coma:
   * `https://vmp-edtech-web.vercel.app,https://www.vmpservicios.com,https://vmpservicios.com`
4. El backend se reiniciará automáticamente.

## 4. Configurar DNS en Hostinger (Opcional pero recomendado)
Si quieres usar tu dominio `vmpservicios.com`:
1. **Frontend**: En Hostinger, crea un registro `CNAME` para `www` apuntando a `cname.vercel-dns.com`.
   * En Vercel, ve a Settings -> Domains y agrega `www.vmpservicios.com`.
2. **Backend**: Crea un registro `CNAME` para `api` apuntando a tu dominio de Railway (ej: `vmp-servicios.up.railway.app`).

## 5. Validación Final
Una vez conectados:
1. Abre tu terminal en este proyecto.
2. Ejecuta el smoke test:
   ```bash
   python3 smoke_test.py --api-url TU_URL_DE_RAILWAY
   ```
3. Verifica que puedas iniciar sesión en la web.
