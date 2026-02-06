import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

test.describe('Landing Page', () => {
    test('should load landing page successfully', async ({ page }) => {
        await page.goto(BASE_URL);

        // Verificar que el título contiene VMP
        await expect(page).toHaveTitle(/VMP/i);

        // Verificar que el logo está visible
        await expect(page.locator('text=VMP SERVICIOS')).toBeVisible();
    });

    test('should display course catalog', async ({ page }) => {
        await page.goto(BASE_URL);

        // Scroll al catálogo de cursos
        await page.locator('text=Nuestros Cursos').scrollIntoViewIfNeeded();

        // Verificar que hay cursos visibles
        const courses = page.locator('[data-testid="course-card"]');
        await expect(courses.first()).toBeVisible();
    });

    test('should open quoter modal', async ({ page }) => {
        await page.goto(BASE_URL);

        // Click en botón de cotizar
        await page.click('text=Solicitar Cotización');

        // Verificar que el modal se abre
        await expect(page.locator('text=Cotización Personalizada')).toBeVisible();
    });

    test('should submit quotation form', async ({ page }) => {
        await page.goto(BASE_URL);

        // Abrir cotizador
        await page.click('text=Solicitar Cotización');

        // Llenar formulario
        await page.fill('input[name="empresa"]', 'Test Company E2E');
        await page.fill('input[name="nombre"]', 'John Doe');
        await page.fill('input[name="email"]', 'john@testcompany.com');
        await page.fill('input[name="telefono"]', '1234567890');

        // Seleccionar cantidad
        await page.click('text=10 conductores');

        // Seleccionar curso
        await page.click('text=Manejo Defensivo');

        // Seleccionar modalidad
        await page.click('text=Online');

        // Aceptar términos
        await page.check('input[type="checkbox"][name="acceptTerms"]');

        // Enviar
        await page.click('button[type="submit"]');

        // Verificar mensaje de éxito
        await expect(page.locator('text=Cotización enviada')).toBeVisible({ timeout: 10000 });
    });
});
