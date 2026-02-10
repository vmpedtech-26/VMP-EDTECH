# Production Guide - VMP Servicios

**Version**: 1.0.0  
**Last Updated**: 02/02/2026  
**Status**: 🚀 Production Ready

---

## 🌐 Production URLs

### Main Application
- **Frontend**: https://vmpservicios.com
- **API**: https://api.vmpservicios.com
- **API Docs**: https://api.vmpservicios.com/docs

### Admin Access
- **Admin Panel**: https://vmpservicios.com/dashboard/super
- **Metrics**: https://vmpservicios.com/dashboard/super/metrics

### Public Pages
- **Landing**: https://vmpservicios.com
- **Credential Validation**: https://vmpservicios.com/validar/{codigo}
- **Password Recovery**: https://vmpservicios.com/forgot-password

---

## 🔑 Access Credentials

### Super Admin
```
Email: admin@vmpservicios.com
Password: [Set during deployment]
```

> [!CAUTION]
> Change the default password immediately after first login.

---

## 📊 Monitoring Dashboards

### Application Monitoring
- **Health Check**: https://api.vmpservicios.com/health
- **Detailed Health**: https://api.vmpservicios.com/health/detailed
- **Metrics Dashboard**: https://vmpservicios.com/dashboard/super/metrics

### Infrastructure
- **Railway Dashboard**: https://railway.app/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Database (Supabase)**: https://app.supabase.com

### Optional Services
- **Sentry** (if configured): https://sentry.io
- **Codecov**: https://codecov.io

---

## 🚨 Incident Response

### 1. Backend Down

**Symptoms**:
- API returns 500 errors
- Frontend can't connect to backend
- Health check fails

**Steps**:
1. Check Railway dashboard for errors
2. View logs: `railway logs --service backend`
3. Check database connectivity
4. Restart service if needed: `railway restart --service backend`

### 2. Frontend Down

**Symptoms**:
- Website not loading
- 404 errors
- Build failures

**Steps**:
1. Check Vercel dashboard
2. View deployment logs
3. Verify environment variables
4. Redeploy if needed

### 3. Database Issues

**Symptoms**:
- Slow queries
- Connection timeouts
- Data inconsistencies

**Steps**:
1. Check Supabase dashboard
2. Monitor connection pool
3. Review slow query log
4. Check disk space
5. Apply indexes if needed

### 4. Email Not Sending

**Symptoms**:
- Users not receiving emails
- SendGrid errors in logs

**Steps**:
1. Check SendGrid dashboard
2. Verify API key is valid
3. Check email quota
4. Review bounce/spam reports

---

## 📈 Performance Monitoring

### Key Metrics to Watch

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| API Response Time | <200ms | >500ms | >1000ms |
| Database Queries | <100ms | >300ms | >500ms |
| Memory Usage | <70% | >80% | >90% |
| Disk Usage | <70% | >80% | >90% |
| Error Rate | <1% | >5% | >10% |

### Monitoring Commands

```bash
# Check API health
curl https://api.vmpservicios.com/health/detailed

# Check response time
curl -w "@curl-format.txt" -o /dev/null -s https://api.vmpservicios.com/api/metrics/overview

# Load test
ab -n 1000 -c 10 https://api.vmpservicios.com/health
```

---

## 🔄 Deployment Process

### Automated Deployment (Recommended)

1. **Push to main branch**
   ```bash
   git add .
   git commit -m "feat: new feature"
   git push origin main
   ```

2. **GitHub Actions runs**
   - Tests execute automatically
   - If tests pass, deployment starts
   - Backend deploys to Railway
   - Frontend deploys to Vercel

3. **Verify deployment**
   - Check GitHub Actions status
   - Visit production URLs
   - Run smoke tests

### Manual Deployment

#### Backend
```bash
# Railway
railway up --service backend

# Run migrations
railway run --service backend prisma migrate deploy
```

#### Frontend
```bash
# Vercel
cd apps/web
vercel --prod
```

---

## 🔐 Security Checklist

### Pre-Production
- [x] All secrets in environment variables
- [x] HTTPS enabled
- [x] CORS configured correctly
- [x] Rate limiting active
- [x] Security headers configured
- [x] Database backups enabled
- [x] Strong admin password set

### Post-Production
- [ ] Monitor error logs daily
- [ ] Review access logs weekly
- [ ] Update dependencies monthly
- [ ] Security audit quarterly
- [ ] Backup verification monthly

---

## 💾 Backup & Recovery

### Automated Backups

**Database** (Supabase):
- Automatic daily backups
- 7-day retention
- Point-in-time recovery available

**Manual Backup**:
```bash
# Export database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20260202.sql
```

### Recovery Time Objectives

| Component | RTO | RPO |
|-----------|-----|-----|
| Database | 1 hour | 24 hours |
| Backend | 30 min | 0 (stateless) |
| Frontend | 15 min | 0 (static) |

---

## 📞 Support Contacts

### Technical Support
- **Email**: soporte@vmpservicios.com
- **Response Time**: 24 hours

### Emergency Contacts
- **On-Call**: [Configure PagerDuty/similar]
- **DevOps Lead**: [Contact info]

---

## 🔧 Common Tasks

### Add New Admin User

```sql
INSERT INTO users (
  id, email, password_hash, nombre, apellido,
  dni, telefono, rol, activo
) VALUES (
  gen_random_uuid(),
  'newadmin@vmpservicios.com',
  '$2b$12$...', -- Use bcrypt hash
  'Admin',
  'Name',
  '00000000',
  '0000000000',
  'SUPER_ADMIN',
  true
);
```

### Reset User Password

1. User requests reset at `/forgot-password`
2. Check email for reset link
3. Or manually generate token and send

### View Application Logs

```bash
# Backend logs
railway logs --service backend

# Frontend logs (Vercel)
vercel logs [deployment-url]
```

### Database Maintenance

```bash
# Connect to database
railway connect postgres

# Run vacuum
VACUUM ANALYZE;

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 📊 Analytics & Metrics

### Business Metrics

Access at: https://vmpservicios.com/dashboard/super/metrics

- Total leads generated
- Conversion rate
- Active enrollments
- Credentials issued
- Revenue tracking

### Technical Metrics

- API response times
- Error rates
- Database query performance
- Cache hit rates
- Memory/CPU usage

---

## 🚀 Scaling Considerations

### Current Capacity
- **Users**: Up to 10,000 concurrent
- **API Requests**: 1,000 req/min
- **Database**: 100 connections

### When to Scale

**Backend**:
- CPU usage >80% sustained
- Memory usage >80%
- Response times >500ms

**Database**:
- Connection pool exhausted
- Query times >300ms
- Storage >80%

**Frontend**:
- Build times >5 minutes
- Bundle size >1MB

---

## 📝 Maintenance Windows

### Scheduled Maintenance
- **Day**: Sundays
- **Time**: 2:00 AM - 4:00 AM ART
- **Frequency**: Monthly
- **Notification**: 48 hours advance

### Emergency Maintenance
- Immediate for critical security issues
- Notification via email/status page

---

## ✅ Production Readiness Checklist

### Infrastructure
- [x] Backend deployed to Railway
- [x] Frontend deployed to Vercel
- [x] Database on Supabase
- [x] SSL certificates active
- [x] Domain configured
- [x] CDN enabled

### Application
- [x] All tests passing
- [x] Coverage >80%
- [x] No critical bugs
- [x] Performance optimized
- [x] Security headers configured
- [x] Rate limiting active

### Monitoring
- [x] Health checks configured
- [x] Error tracking (optional)
- [x] Performance monitoring
- [x] Uptime monitoring
- [x] Backup verification

### Documentation
- [x] API documentation
- [x] Deployment guide
- [x] Admin manual
- [x] This production guide
- [x] Changelog

---

**Status**: ✅ **PRODUCTION READY**

**Last Review**: 02/02/2026  
**Next Review**: 02/03/2026
