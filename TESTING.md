# Testing Guide - VMP Servicios

Este documento describe cómo ejecutar los tests del proyecto VMP Servicios.

## 📋 Tabla de Contenidos

- [Backend Tests](#backend-tests)
- [Frontend E2E Tests](#frontend-e2e-tests)
- [CI/CD](#cicd)
- [Coverage](#coverage)

---

## 🔧 Backend Tests

### Requisitos Previos

```bash
cd apps/api
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### Configurar Base de Datos de Test

```bash
# Crear archivo .env.test
DATABASE_URL=postgresql://user:password@localhost:5432/vmp_test
JWT_SECRET=test-secret-key
SMTP_PASSWORD=""  # Vacío para modo desarrollo
```

### Ejecutar Tests

```bash
# Todos los tests
pytest tests/ -v

# Con coverage
pytest tests/ -v --cov=. --cov-report=html --cov-report=term

# Test específico
pytest tests/test_auth.py -v

# Solo tests de un módulo
pytest tests/test_password_reset.py -v
```

### Tests Disponibles

| Archivo | Descripción | Tests |
|---------|-------------|-------|
| `test_auth.py` | Autenticación básica | Login, logout, /me |
| `test_password_reset.py` | Recuperación de contraseña | Forgot password, reset password, tokens |
| `test_cotizaciones.py` | CRUD de cotizaciones | Create, read, update, delete |
| `test_conversion.py` | Conversión a clientes | Conversión completa, validaciones |
| `test_credential_validation.py` | Validación pública | Credenciales válidas, expiradas, inexistentes |
| `test_cursos_inscripciones.py` | Cursos e inscripciones | CRUD, progreso, completado |
| `test_public.py` | Endpoints públicos | Validación sin auth |

### Estructura de Tests

```
apps/api/tests/
├── conftest.py                      # Fixtures compartidas
├── test_auth.py                     # Tests de autenticación
├── test_password_reset.py           # Tests de reset password
├── test_cotizaciones.py             # Tests de cotizaciones
├── test_conversion.py               # Tests de conversión
├── test_credential_validation.py    # Tests de validación pública
├── test_cursos_inscripciones.py     # Tests de cursos
└── test_public.py                   # Tests de endpoints públicos
```

---

## 🎭 Frontend E2E Tests

### Requisitos Previos

```bash
cd apps/web
npm install
npx playwright install chromium
```

### Ejecutar Tests E2E

```bash
# Todos los tests E2E
npm run test:e2e

# Con UI interactiva
npm run test:e2e:ui

# Con navegador visible
npm run test:e2e:headed

# Test específico
npx playwright test tests/e2e/landing.spec.ts
```

### Tests E2E Disponibles

| Archivo | Descripción | Escenarios |
|---------|-------------|------------|
| `landing.spec.ts` | Landing page | Carga, catálogo, cotizador |
| `login.spec.ts` | Autenticación | Login, logout, forgot password |
| `dashboard.spec.ts` | Dashboard | Navegación, cotizaciones, filtros |
| `conversion.spec.ts` | Conversión | Flujo completo de conversión |

### Estructura de Tests E2E

```
apps/web/tests/e2e/
├── landing.spec.ts      # Tests de landing page
├── login.spec.ts        # Tests de autenticación
├── dashboard.spec.ts    # Tests de dashboard
└── conversion.spec.ts   # Tests de conversión
```

### Configuración de Playwright

El archivo `playwright.config.ts` incluye:
- ✅ Ejecución en Chromium
- ✅ Screenshots en fallos
- ✅ Videos en fallos
- ✅ Traces en retry
- ✅ Dev server automático

---

## 🚀 CI/CD

### GitHub Actions

El proyecto incluye un pipeline completo en `.github/workflows/ci.yml`:

#### Jobs Configurados

1. **backend-tests**
   - Linting (flake8, black)
   - Tests con pytest
   - Coverage report
   - PostgreSQL service

2. **frontend-tests**
   - Linting (eslint)
   - Type checking (tsc)
   - Build verification

3. **e2e-tests**
   - Tests E2E con Playwright
   - Backend + Frontend running
   - Playwright report upload

4. **deploy-staging**
   - Deploy automático a staging
   - Solo en push a `main`

### Ejecutar CI Localmente

```bash
# Backend linting
cd apps/api
flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
black --check .

# Frontend linting
cd apps/web
npm run lint
npm run type-check
```

---

## 📊 Coverage

### Backend Coverage

```bash
cd apps/api
pytest tests/ --cov=. --cov-report=html

# Abrir reporte
open htmlcov/index.html
```

### Objetivos de Coverage

- **Backend**: > 60%
- **Critical paths**: > 80%
  - Autenticación
  - Conversión de cotizaciones
  - Validación de credenciales

---

## 🧪 Escribir Nuevos Tests

### Backend Test Template

```python
import pytest
from httpx import AsyncClient

class TestMyFeature:
    @pytest.mark.asyncio
    async def test_my_endpoint(self, client: AsyncClient, auth_token):
        response = await client.get(
            "/api/my-endpoint",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "expected_field" in data
```

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/my-page');
    
    await expect(page.locator('text=Expected Text')).toBeVisible();
    
    await page.click('button:has-text("Click Me")');
    
    await expect(page).toHaveURL(/success/);
  });
});
```

---

## 🐛 Debugging

### Backend Tests

```bash
# Modo verbose con prints
pytest tests/test_auth.py -v -s

# Solo un test específico
pytest tests/test_auth.py::TestAuth::test_login_success -v

# Con pdb debugger
pytest tests/test_auth.py --pdb
```

### E2E Tests

```bash
# Con UI interactiva (mejor para debugging)
npm run test:e2e:ui

# Con navegador visible
npm run test:e2e:headed

# Con debug mode
npx playwright test --debug
```

---

## 📝 Notas Importantes

### Base de Datos de Test

- Los tests usan una base de datos separada (`vmp_test`)
- Cada test limpia sus datos (cleanup en fixtures)
- No afecta la base de datos de desarrollo

### Fixtures Disponibles

- `client`: Cliente HTTP async
- `test_user`: Usuario de prueba (ALUMNO)
- `test_admin`: Usuario admin (SUPER_ADMIN)
- `auth_token`: Token de autenticación
- `admin_token`: Token de admin
- `db`: Conexión a Prisma

### Variables de Entorno

```bash
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/vmp_test
JWT_SECRET=test-secret
SMTP_PASSWORD=""

# Frontend E2E
BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🎯 Checklist de Testing

Antes de hacer push:

- [ ] Todos los tests backend pasan
- [ ] Coverage > 60%
- [ ] Linting backend sin errores
- [ ] Tests E2E críticos pasan
- [ ] Linting frontend sin errores
- [ ] Type check sin errores
- [ ] Build exitoso

---

## 📞 Ayuda

Si encuentras problemas:

1. Verifica que las dependencias estén instaladas
2. Revisa las variables de entorno
3. Asegúrate de que la DB de test esté corriendo
4. Limpia cache: `pytest --cache-clear`
5. Reinstala Playwright: `npx playwright install --force`

Para más información, consulta:
- [Pytest Documentation](https://docs.pytest.org/)
- [Playwright Documentation](https://playwright.dev/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
