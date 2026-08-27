import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Admin sembrado por apps/api/scripts/seed_e2e.py, junto con la empresa
// 'E2E Seed Company'.
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'adminpass123';

test.describe('Gestión de Empresas B2B (admin)', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD);
        await page.goto(`${BASE_URL}/dashboard/super/empresas`);
    });

    test('muestra la empresa sembrada en el listado', async ({ page }) => {
        await expect(page.locator('h1:has-text("Gestión de Empresas")')).toBeVisible();
        await expect(page.locator('text=E2E Seed Company')).toBeVisible();
    });

    test('permite registrar una nueva empresa desde el formulario', async ({ page }) => {
        await page.click('a:has-text("Nueva Empresa")');
        await expect(page).toHaveURL(/empresas\/nuevo/);

        await page.fill('input[placeholder="Ej: Servicios Industriales S.A."]', 'Nueva Empresa E2E');
        await page.fill('input[placeholder="30-XXXXXXXX-X"]', '30-12345678-9');
        await page.fill('input[placeholder="administracion@empresa.com"]', 'contacto@nuevaempresae2e.com');

        await page.click('button:has-text("Registrar Empresa")');

        await page.waitForURL(/dashboard\/super\/empresas$/);
        await expect(page.locator('text=Nueva Empresa E2E')).toBeVisible();
    });
});
