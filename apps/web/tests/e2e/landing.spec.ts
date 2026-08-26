import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Landing Page', () => {
    test('should load landing page successfully', async ({ page }) => {
        await page.goto(BASE_URL);

        await expect(page).toHaveTitle(/VMP/i);
        await expect(page.locator('img[alt*="VMP"]').first()).toBeVisible();
    });

    test('should display course catalog', async ({ page }) => {
        await page.goto(BASE_URL);

        await page.locator('text=Programas de Capacitación').scrollIntoViewIfNeeded();

        const courses = page.locator('[data-testid="course-card"]');
        await expect(courses.first()).toBeVisible();
    });

    test('should submit contact form', async ({ page }) => {
        await page.goto(BASE_URL);

        await page.locator('#contacto').scrollIntoViewIfNeeded();

        const suffix = Date.now();
        await page.fill('input[name="nombre"]', 'John Doe');
        await page.fill('input[name="empresa"]', 'Test Company E2E');
        await page.fill('input[name="email"]', `john-${suffix}@testcompany.com`);
        await page.fill('input[name="telefono"]', '1234567890');
        await page.fill('textarea[name="mensaje"]', 'Consulta de prueba E2E.');

        await page.click('#contacto button[type="submit"]');

        await expect(page.locator('text=/mensaje enviado/i')).toBeVisible({ timeout: 10000 });
    });
});
