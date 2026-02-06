import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Helper para hacer login
async function login(page: any, email: string, password: string) {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
}

test.describe('Dashboard Navigation', () => {
    test.beforeEach(async ({ page }) => {
        // Login como admin antes de cada test
        await login(page, 'admin@example.com', 'adminpass123');
    });

    test('should display dashboard home', async ({ page }) => {
        await expect(page.locator('text=Dashboard')).toBeVisible();
        await expect(page.locator('text=Bienvenido')).toBeVisible();
    });

    test('should navigate to cotizaciones', async ({ page }) => {
        await page.click('text=Cotizaciones');

        await expect(page).toHaveURL(/cotizaciones/);
        await expect(page.locator('text=/cotizaciones/i')).toBeVisible();
    });

    test('should navigate to cursos', async ({ page }) => {
        await page.click('text=Cursos');

        await expect(page).toHaveURL(/cursos/);
        await expect(page.locator('text=/cursos/i')).toBeVisible();
    });

    test('should navigate to empresas', async ({ page }) => {
        await page.click('text=Empresas');

        await expect(page).toHaveURL(/empresas/);
        await expect(page.locator('text=/empresas/i')).toBeVisible();
    });

    test('should navigate to alumnos', async ({ page }) => {
        await page.click('text=Alumnos');

        await expect(page).toHaveURL(/alumnos/);
        await expect(page.locator('text=/alumnos/i')).toBeVisible();
    });

    test('should display metrics', async ({ page }) => {
        await page.click('text=Métricas');

        await expect(page).toHaveURL(/metrics/);

        // Verificar que hay gráficos o estadísticas
        await expect(page.locator('[data-testid="metric-card"]').first()).toBeVisible();
    });
});

test.describe('Cotizaciones Management', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'admin@example.com', 'adminpass123');
        await page.goto(`${BASE_URL}/dashboard/super/cotizaciones`);
    });

    test('should display cotizaciones list', async ({ page }) => {
        await expect(page.locator('text=/cotizaciones/i')).toBeVisible();

        // Verificar que hay tabla o lista
        const table = page.locator('table, [data-testid="cotizaciones-list"]');
        await expect(table).toBeVisible();
    });

    test('should filter cotizaciones by status', async ({ page }) => {
        // Click en filtro de estado
        await page.click('text=Pendientes');

        // Verificar que la URL o el estado cambió
        await page.waitForTimeout(1000);

        // Verificar que solo se muestran cotizaciones pendientes
        const statusBadges = page.locator('[data-testid="status-badge"]');
        const count = await statusBadges.count();

        if (count > 0) {
            for (let i = 0; i < count; i++) {
                await expect(statusBadges.nth(i)).toContainText(/pending|pendiente/i);
            }
        }
    });

    test('should change cotizacion status', async ({ page }) => {
        // Buscar primera cotización
        const firstRow = page.locator('[data-testid="cotizacion-row"]').first();

        if (await firstRow.isVisible()) {
            // Click en dropdown de estado
            await firstRow.locator('[data-testid="status-dropdown"]').click();

            // Seleccionar nuevo estado
            await page.click('text=Contactado');

            // Confirmar cambio
            await page.click('text=Confirmar');

            // Verificar mensaje de éxito
            await expect(page.locator('text=/actualizado|éxito/i')).toBeVisible({ timeout: 5000 });
        }
    });
});
