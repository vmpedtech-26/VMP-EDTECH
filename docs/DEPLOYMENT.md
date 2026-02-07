# Guía de Deployment - VMP Servicios

## Requisitos del Sistema

### Backend (API)
- Python 3.10+
- PostgreSQL 14+
- 1GB RAM mínimo
- 10GB espacio en disco

### Frontend (Web)
- Node.js 18+
- 512MB RAM mínimo
- 5GB espacio en disco

---

## Variables de Entorno

### Backend (.env)

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/vmp_db"

# JWT
SECRET_KEY="your-secret-key-here-change-in-production"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000","https://yourdomain.com"]
FRONTEND_URL="https://yourdomain.com"

# Email (SendGrid)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
EMAIL_FROM="noreply@vmpservicios.com"
EMAIL_VENTAS="ventas@vmpservicios.com"

# Admin
ADMIN_URL="https://admin.vmpservicios.com"
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL="https://api.vmpservicios.com"
```

---

## Deployment en Producción

### Opción 1: Railway (Recomendado)

#### Backend

1. **Crear proyecto en Railway**
   ```bash
   railway login
   railway init
   ```

2. **Configurar PostgreSQL**
   - Agregar PostgreSQL desde Railway dashboard
   - Copiar `DATABASE_URL` a variables de entorno

3. **Configurar variables de entorno**
   - Ir a Settings → Variables
   - Agregar todas las variables del `.env`

4. **Deploy**
   ```bash
   railway up
   ```

5. **Ejecutar migraciones**
   ```bash
   railway run prisma migrate deploy
   ```

#### Frontend

1. **Crear nuevo proyecto**
   ```bash
   railway init
   ```

2. **Configurar variables**
   - `NEXT_PUBLIC_API_URL`: URL del backend

3. **Deploy**
   ```bash
   railway up
   ```

---

### Opción 2: Render

#### Backend

1. **Crear Web Service**
   - Conectar repositorio GitHub
   - Build Command: `pip install -r requirements.txt && prisma generate`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

2. **Agregar PostgreSQL**
   - Crear PostgreSQL database
   - Copiar Internal Database URL

3. **Variables de entorno**
   - Agregar todas las variables necesarias

4. **Deploy automático**
   - Se despliega automáticamente en cada push

#### Frontend

1. **Crear Static Site**
   - Build Command: `npm install && npm run build`
   - Publish Directory: `out`

2. **Variables de entorno**
   - `NEXT_PUBLIC_API_URL`

---

### Opción 3: VPS (Ubuntu 22.04)

#### Preparar Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
sudo apt install -y python3.10 python3-pip postgresql nginx nodejs npm

# Instalar PM2
sudo npm install -g pm2
```

#### Backend

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/vmp-servicios.git
cd vmp-servicios/apps/api

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar .env
cp .env.example .env
nano .env  # Editar variables

# Generar Prisma client
prisma generate

# Ejecutar migraciones
prisma migrate deploy

# Iniciar con PM2
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name vmp-api
pm2 save
pm2 startup
```

#### Frontend

```bash
cd ../web

# Instalar dependencias
npm install

# Configurar .env.local
cp .env.example .env.local
nano .env.local

# Build
npm run build

# Iniciar con PM2
pm2 start npm --name vmp-web -- start
pm2 save
```

#### Nginx

```nginx
# /etc/nginx/sites-available/vmp

# API
server {
    listen 80;
    server_name api.vmpservicios.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name vmpservicios.com www.vmpservicios.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activar sitio
sudo ln -s /etc/nginx/sites-available/vmp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL con Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.vmpservicios.com -d vmpservicios.com
```

---

## Base de Datos

### Crear Base de Datos

```sql
CREATE DATABASE vmp_db;
CREATE USER vmp_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE vmp_db TO vmp_user;
```

### Ejecutar Migraciones

```bash
cd apps/api
prisma migrate deploy
```

### Crear Usuario Admin Inicial

```bash
# Ejecutar script de seed
python scripts/create_admin.py
```

O manualmente:

```sql
INSERT INTO users (
  id, email, password_hash, nombre, apellido, 
  dni, telefono, rol, activo
) VALUES (
  gen_random_uuid(),
  'admin@vmpservicios.com',
  '$2b$12$...', -- Hash de la contraseña
  'Admin',
  'VMP',
  '00000000',
  '0000000000',
  'SUPER_ADMIN',
  true
);
```

---

## Monitoreo

### Logs

```bash
# Backend
pm2 logs vmp-api

# Frontend
pm2 logs vmp-web

# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Métricas

```bash
# PM2 monitoring
pm2 monit

# Sistema
htop
df -h
free -h
```

---

## Backup

### Base de Datos

```bash
# Backup
pg_dump -U vmp_user vmp_db > backup_$(date +%Y%m%d).sql

# Restore
psql -U vmp_user vmp_db < backup_20260201.sql
```

### Automatizar Backups

```bash
# Crontab
crontab -e

# Agregar línea (backup diario a las 2 AM)
0 2 * * * pg_dump -U vmp_user vmp_db > /backups/vmp_$(date +\%Y\%m\%d).sql
```

---

## Troubleshooting

### Backend no inicia

```bash
# Verificar logs
pm2 logs vmp-api

# Verificar puerto
sudo lsof -i :8000

# Verificar conexión a BD
psql -U vmp_user -d vmp_db -h localhost
```

### Frontend no carga

```bash
# Verificar build
npm run build

# Verificar variables de entorno
cat .env.local

# Reiniciar
pm2 restart vmp-web
```

### Error de CORS

- Verificar `BACKEND_CORS_ORIGINS` en backend `.env`
- Verificar `NEXT_PUBLIC_API_URL` en frontend `.env.local`

### Rate Limiting muy restrictivo

- Ajustar límites en `apps/api/middleware/security.py`
- Reiniciar backend

---

## Actualizaciones

### Actualizar Backend

```bash
cd apps/api
git pull
source venv/bin/activate
pip install -r requirements.txt
prisma migrate deploy
pm2 restart vmp-api
```

### Actualizar Frontend

```bash
cd apps/web
git pull
npm install
npm run build
pm2 restart vmp-web
```

---

## Seguridad

### Checklist de Seguridad

- [ ] Cambiar `SECRET_KEY` en producción
- [ ] Usar HTTPS (SSL/TLS)
- [ ] Configurar firewall (UFW)
- [ ] Actualizar sistema regularmente
- [ ] Backups automáticos configurados
- [ ] Rate limiting activo
- [ ] Variables de entorno seguras
- [ ] PostgreSQL con contraseña fuerte
- [ ] Nginx configurado correctamente

### Firewall (UFW)

```bash
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable
```

---

## Soporte

Para problemas de deployment:
- Email: soporte@vmpservicios.com
- Documentación: `/docs/API.md`
