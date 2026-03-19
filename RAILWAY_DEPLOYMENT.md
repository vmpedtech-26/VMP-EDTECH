# Railway Deployment Guide - VMP EdTech

## Quick Start

### 1. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose the `vmp-lms-app` repository
5. Railway will auto-detect Next.js and use `railway.toml` configuration

### 2. Configure Environment Variables

In Railway Dashboard → Variables, add:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://dowzorblikrgxybcnytf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvd3pvcmJsaWtyZ3h5YmNueXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1ODcxNzksImV4cCI6MjA1MzE2MzE3OX0.Gx4hVLlMjlsyLJoElWbiqyR_F6FXQHX8iiR0kpYn4K0

# SMTP (Hostinger) - TO BE CONFIGURED
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=[your-email@vmp-edtech.com]
SMTP_PASSWORD=[your-smtp-password]
SMTP_FROM=VMP EdTech <noreply@vmp-edtech.com>

# Application
NODE_ENV=production
PORT=3000
```

### 3. Deploy

Railway will automatically:
- Install dependencies (`npm install`)
- Build the application (`npm run build`)
- Start the server (`npm start`)
- Monitor health via `/api/health`

### 4. Get Deployment URL

After deployment completes:
1. Copy the Railway-provided URL (e.g., `vmp-edtech-production.railway.app`)
2. Test the health endpoint: `https://[your-url]/api/health`

### 5. Configure Custom Domain

In Railway Dashboard → Settings → Domains:
1. Click "Add Domain"
2. Enter: `vmp-edtech.com`
3. Railway will provide DNS configuration instructions
4. Copy the CNAME target (e.g., `[project-id].railway.app`)

### 6. Configure DNS in Hostinger

Go to Hostinger DNS Management:

**Option A: CNAME (Recommended)**
```
Type: CNAME
Name: @
Target: [your-railway-url].railway.app
TTL: 3600
```

**Option B: A Record** (if Railway provides IP)
```
Type: A
Name: @
Target: [Railway IP]
TTL: 3600
```

**For www subdomain:**
```
Type: CNAME
Name: www
Target: vmp-edtech.com
TTL: 3600
```

### 7. SSL Certificate

Railway automatically provisions SSL certificates for custom domains.
Wait 5-10 minutes after DNS propagation.

## Verification Checklist

- [ ] Railway project created and deployed
- [ ] Environment variables configured
- [ ] Health check returns `{"status":"healthy"}`
- [ ] Custom domain added in Railway
- [ ] DNS configured in Hostinger
- [ ] DNS propagation complete (`nslookup vmp-edtech.com`)
- [ ] HTTPS working on custom domain
- [ ] Application accessible at `https://vmp-edtech.com`

## Monitoring

### Health Check
```bash
curl https://vmp-edtech.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-05T15:00:00.000Z",
  "uptime": 12345,
  "checks": {
    "database": "connected",
    "latency_ms": 45
  }
}
```

### Railway Logs
```bash
# View in Railway Dashboard → Deployments → Logs
# Or use Railway CLI:
railway logs
```

## Troubleshooting

### Build Fails
- Check Node.js version (should be 20.x)
- Verify all dependencies in `package.json`
- Check build logs in Railway dashboard

### Database Connection Issues
- Verify Supabase environment variables
- Check Supabase project is active
- Test connection from local environment first

### Domain Not Working
- Wait for DNS propagation (up to 48 hours, usually 5-30 minutes)
- Verify DNS configuration: `nslookup vmp-edtech.com`
- Check Railway domain settings

### Email Not Sending
- Verify SMTP credentials
- Check Hostinger email account is active
- Test SMTP connection locally first
- Review Railway logs for email errors

## Rollback

If deployment fails:
1. Go to Railway Dashboard → Deployments
2. Find previous successful deployment
3. Click "Redeploy"

## Next Steps

After successful deployment:
1. Test all application features
2. Configure GitHub Actions for CI/CD
3. Set up monitoring and alerts
4. Create backup strategy
