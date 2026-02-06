import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Authentication Flow', () => {
    test('should display login page', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);

        await expect(page.locator('text=Iniciar Sesión')).toBeVisible();
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('should show error on invalid credentials', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);

        await page.fill('input[type="email"]', 'invalid@example.com');
        await page.fill('input[type="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        // Verificar mensaje de error
        await expect(page.locator('text=/incorrect|inválid/i')).toBeVisible({ timeout: 5000 });
    });

    test('should navigate to forgot password', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);

        await page.click('text=/olvidaste.*contraseña/i');

        await expect(page).toHaveURL(/forgot-password/);
        await expect(page.locator('text=/olvidaste.*contraseña/i')).toBeVisible();
    });

    test('should submit forgot password request', async ({ page }) => {
        await page.goto(`${BASE_URL}/forgot-password`);

        await page.fill('input[type="email"]', 'test@example.com');
        await page.click('button[type="submit"]');

        // Verificar mensaje de éxito
        await expect(page.locator('text=/email enviado/i')).toBeVisible({ timeout: 5000 });
    });

    test('should login with valid credentials', async ({ page }) => {
        // Este test requiere un usuario de prueba en la DB
        await page.goto(`${BASE_URL}/login`);

        // Usar credenciales de prueba (deben existir en la DB de test)
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'testpass123');
        await page.click('button[type="submit"]');

        // Verificar redirección al dashboard
        await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
    });

    test('should logout successfully', async ({ page }) => {
        // Login primero
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'testpass123');
        await page.click('button[type="submit"]');

        await page.waitForURL(/dashboard/, { timeout: 10000 });

        // Logout
        await page.click('[data-testid="user-menu"]');
        await page.click('text=/cerrar sesión/i');

        // Verificar redirección al login
        await expect(page).toHaveURL(/login/);
    });
});
