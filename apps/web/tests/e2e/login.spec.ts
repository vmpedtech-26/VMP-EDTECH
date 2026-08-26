import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Usuario sembrado por apps/api/scripts/seed_e2e.py en el job de CI.
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpass123';

test.describe('Authentication Flow', () => {
    test('should display login page', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);

        await expect(page.locator('text=Iniciar Sesión')).toBeVisible();
        await expect(page.locator('input[type="email"]')).toBeVisible();
        // El password recién aparece después del primer paso (chequeo de SSO).
        await expect(page.locator('input[type="password"]')).not.toBeAttached();
    });

    test('should show error on invalid credentials', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);

        await page.fill('input[type="email"]', 'invalid@example.com');
        await page.click('button[type="submit"]');
        await page.fill('input[type="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        await expect(page.locator('text=/incorrect|inválid/i')).toBeVisible({ timeout: 5000 });
    });

    test('should navigate to forgot password', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);

        await page.fill('input[type="email"]', TEST_EMAIL);
        await page.click('button[type="submit"]');

        await page.click('text=/olvidaste.*contraseña/i');

        await expect(page).toHaveURL(/forgot-password/);
        await expect(page.locator('text=/olvidaste.*contraseña/i')).toBeVisible();
    });

    test('should submit forgot password request', async ({ page }) => {
        await page.goto(`${BASE_URL}/forgot-password`);

        await page.fill('input[type="email"]', TEST_EMAIL);
        await page.click('button[type="submit"]');

        await expect(page.locator('text=/email enviado/i')).toBeVisible({ timeout: 5000 });
    });

    test('should login with valid credentials', async ({ page }) => {
        await login(page, BASE_URL, TEST_EMAIL, TEST_PASSWORD);

        await expect(page).toHaveURL(/dashboard/);
    });

    test('should logout successfully', async ({ page }) => {
        await login(page, BASE_URL, TEST_EMAIL, TEST_PASSWORD);

        await page.click('text=Cerrar Sesión');

        await expect(page).toHaveURL(/login/);
    });
});
