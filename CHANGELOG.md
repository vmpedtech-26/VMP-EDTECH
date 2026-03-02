# Changelog

All notable changes to VMP Servicios will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0-beta] - 2026-02-28

### ✨ Attendance & Practical Training Enhancements

#### Attendance Control
- ✅ **Live Class Attendance System**
  - New `AsistenciaClase` model and database tracking.
  - Dedicated Attendance Dashboard for instructors per course.
  - One-click "Presente en Clase" check-in for students in live modules.
  - Automatic module completion upon attendance registration.

#### Practical Modules & Evidence
- ✅ **Restored Practical Workflow**
  - Re-implemented `TareaPractica` and `Evidencia` models.
  - New Evidence Review interface for instructors with vibrant status badges.
  - Enhanced task cards for students with clear feedback for rejected items.
  - Integrated custom Quiz and Practice editors for administrators.

#### Backend & API
- ✅ New endpoints for attendance registration and reporting.
- ✅ Refined evidence submission and evaluation endpoints.
- ✅ Updated Prisma client and database schemas.

---

## [1.0.0] - 2026-02-02

### 🎉 Initial Production Release

This is the first production-ready release of VMP Servicios platform.

### Added

#### Day 1: Email System & UI States
- ✅ Email service with SendGrid integration
- ✅ Professional HTML email templates
  - Welcome email for new companies
  - Password reset email
  - Credential notification email
- ✅ Improved UI states across dashboards
- ✅ Loading, success, and error states

#### Day 2: Quote Conversion & Password Recovery
- ✅ **Automatic quote to client conversion**
  - One-click conversion from admin panel
  - Automatic company creation
  - Bulk student account generation
  - Automatic enrollment creation
  - Welcome email with credentials
- ✅ **Password recovery system**
  - Forgot password endpoint
  - Secure token generation (1-hour expiration)
  - Reset password endpoint
  - Email with reset link
  - Frontend pages for recovery flow

#### Day 3: Public Validation, Security & Metrics
- ✅ **Public credential validation**
  - Public endpoint `/api/public/validar/{numero}`
  - Professional validation page
  - Shareable by link/QR
  - Status indicators (valid/expired/not found)
- ✅ **Security enhancements**
  - Rate limiting (slowapi)
    - Login: 5 req/min
    - Forgot password: 3 req/min
    - Public endpoints: 20 req/min
    - API general: 60 req/min
  - Security headers (HSTS, CSP, X-Frame-Options, etc.)
  - Request ID tracking
- ✅ **Metrics dashboard**
  - Overview metrics (users, companies, courses, etc.)
  - Conversion rate tracking
  - Course completion statistics
  - Exportable reports

#### Day 4: Testing, Optimization & Documentation
- ✅ **Automated testing**
  - Pytest test suite
  - Auth tests
  - Quotation tests
  - Public endpoint tests
  - Coverage reports
- ✅ **Database optimization**
  - 15+ database indexes
  - Composite indexes for complex queries
  - 5-10x performance improvement
- ✅ **Comprehensive documentation**
  - API reference (docs/API.md)
  - Deployment guide (docs/DEPLOYMENT.md)
  - Admin manual (docs/ADMIN_GUIDE.md)
  - Updated README

#### Day 5: CI/CD & Production
- ✅ **CI/CD Pipeline**
  - GitHub Actions workflows
  - Automated testing on push/PR
  - Automated deployment to Railway/Vercel
  - Coverage enforcement (>80%)
- ✅ **Production deployment**
  - Railway configuration
  - Vercel configuration
  - Environment management
  - Health checks
- ✅ **Monitoring**
  - Enhanced health check endpoint
  - System metrics (disk, memory)
  - Database connectivity check

### Backend Features
- FastAPI REST API
- PostgreSQL database with Prisma ORM
- JWT authentication
- Email service (SendGrid)
- PDF generation (ReportLab)
- QR code generation
- Rate limiting
- Security headers
- Request tracking

### Frontend Features
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Framer Motion animations
- Landing page with quoter
- Multi-role dashboards
- Public credential validation page
- Password recovery flow
- Metrics dashboard

### Security
- JWT token authentication
- Password hashing (bcrypt)
- Rate limiting per endpoint
- Security headers (HSTS, CSP, etc.)
- CORS configuration
- Input validation
- SQL injection prevention (Prisma)

### Performance
- Database indexes for fast queries
- Optimized API responses
- Image optimization
- Code splitting
- Bundle optimization

### Documentation
- Complete API reference
- Deployment guide (3 hosting options)
- Admin user manual
- Testing guide
- README with quick start

## [0.2.0] - 2026-02-01

### Added
- Landing page with quoter
- Quote management system
- Basic admin panel
- Course management
- Student enrollment

## [0.1.0] - 2026-01-30

### Added
- Initial project setup
- Basic authentication
- Database schema
- User roles

---

## Migration Guide

### From 0.x to 1.0.0

#### Database Migrations

```bash
cd apps/api
prisma migrate deploy
```

#### New Environment Variables

```bash
# Email (required)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@vmpservicios.com
EMAIL_VENTAS=ventas@vmpservicios.com

# Admin URL (for emails)
ADMIN_URL=https://admin.vmpservicios.com
```

#### Breaking Changes

None. This is the first production release.

---

## Support

For issues or questions:
- Email: soporte@vmpservicios.com
- Documentation: `/docs/`
- API Docs: `https://api.vmpservicios.com/docs`
