import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Admin sembrado por apps/api/scripts/seed_e2e.py en el job de CI.
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'adminpass123';

test.describe('Dashboard Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD);
    });

    test('should display dashboard home', async ({ page }) => {
        // Un SUPER_ADMIN es redirigido de /dashboard a /dashboard/super.
        await expect(page).toHaveURL(/dashboard\/super/);
        await expect(page.locator('text=Panel de Control')).toBeVisible();
        await expect(page.locator('text=Bienvenido')).toBeVisible();
    });

    test('should navigate to cotizaciones', async ({ page }) => {
        await page.click('a:has-text("Cotizaciones")');

        await expect(page).toHaveURL(/cotizaciones/);
        await expect(page.locator('text=/cotizaciones/i').first()).toBeVisible();
    });

    test('should navigate to cursos', async ({ page }) => {
        await page.click('a:has-text("Cursos")');

        await expect(page).toHaveURL(/cursos/);
    });

    test('should navigate to empresas', async ({ page }) => {
        await page.click('a:has-text("Empresas")');

        await expect(page).toHaveURL(/empresas/);
    });

    test('should navigate to alumnos', async ({ page }) => {
        await page.click('a:has-text("Alumnos")');

        await expect(page).toHaveURL(/alumnos/);
    });

    test('should display metrics', async ({ page }) => {
        await page.click('a:has-text("Métricas")');

        await expect(page).toHaveURL(/metrics/);
        await expect(page.locator('[data-testid="metric-card"]').first()).toBeVisible();
    });
});

test.describe('Cotizaciones Management', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD);
        await page.goto(`${BASE_URL}/dashboard/super/cotizaciones`);
    });

    test('should display cotizaciones list', async ({ page }) => {
        await expect(page.locator('[data-testid="cotizaciones-list"]')).toBeVisible();
        // El seed E2E crea una cotización 'contacted' para "E2E Test Company".
        await expect(page.locator('text=E2E Test Company')).toBeVisible();
    });

    test('should filter cotizaciones by status', async ({ page }) => {
        await page.click('button:has-text("Contactados")');

        await expect(page.locator('[data-testid="cotizacion-row"]').first()).toBeVisible();
        await expect(page.locator('[data-testid="status-badge"]').first()).toContainText(/contactado/i);
    });

    test('should change cotizacion status', async ({ page }) => {
        // Crear una cotización propia en 'pending' para no interferir con la
        // que ya viene 'contacted' desde el seed.
        await page.request.post(`${API_URL}/api/cotizaciones`, {
            data: {
                empresa: 'Status Change Co',
                nombre: 'John Doe',
                email: 'statuschange@test.com',
                telefono: '1234567890',
                quantity: 2,
                course: 'defensivo',
                modality: 'online',
                totalPrice: 20000,
                pricePerStudent: 10000,
                discount: 0,
                acceptMarketing: true,
                acceptTerms: true,
            },
        });
        await page.reload();

        const row = page.locator('[data-testid="cotizacion-row"]').filter({ hasText: 'Status Change Co' });
        await row.locator('button:has-text("Marcar Contactado")').click();
        await page.click('button:has-text("Confirmar")');

        await expect(row.locator('[data-testid="status-badge"]')).toContainText(/contactado/i);
    });
});
