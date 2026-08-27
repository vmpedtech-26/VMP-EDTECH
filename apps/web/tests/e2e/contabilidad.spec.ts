import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'adminpass123';

// Smoke test: el seed E2E no carga datos contables, así que solo se verifica
// que cada sección del módulo cargue sin romperse (sin JS errors ni 500s).
test.describe('Sistema Contable (admin)', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD);
    });

    test('carga el Centro Contable', async ({ page }) => {
        await page.goto(`${BASE_URL}/dashboard/super/contabilidad`);
        await expect(page.locator('h1:has-text("Centro Contable")')).toBeVisible();
    });

    test('carga el Libro Diario sin errores', async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (err) => errors.push(err.message));

        await page.goto(`${BASE_URL}/dashboard/super/contabilidad/diario`);
        await page.waitForLoadState('networkidle');

        expect(errors).toEqual([]);
    });
});
