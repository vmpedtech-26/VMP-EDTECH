import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Landing Page', () => {
    test('should load landing page successfully', async ({ page }) => {
        await page.goto(BASE_URL);

        // Verificar que el título contiene VMP
        await expect(page).toHaveTitle(/VMP/i);

        // Verificar que el logo está visible
        await expect(page.locator('text=VMP - EDTECH')).toBeVisible();
    });

    test('should display course catalog with updated names', async ({ page }) => {
        await page.goto(BASE_URL);

        // Scroll al catálogo de cursos
        await page.locator('text=Nuestros Cursos').scrollIntoViewIfNeeded();

        // Verificar cursos renombrados
        await expect(page.locator('text=Conducción Preventiva').first()).toBeVisible();
        await expect(page.locator('text=Conducción Flota Liviana / Pesada').first()).toBeVisible();
        await expect(page.locator('text=Conducción Doble Tracción').first()).toBeVisible();
    });

    test('should display contact form section', async ({ page }) => {
        await page.goto(BASE_URL);

        // Scroll a la sección de contacto
        await page.locator('#contacto').scrollIntoViewIfNeeded();

        // Verificar que el formulario está visible
        await expect(page.locator('#contacto')).toBeVisible();
        await expect(page.locator('text=Hablemos de tu Proyecto')).toBeVisible();

        // Verificar campos del formulario
        await expect(page.locator('input#nombre')).toBeVisible();
        await expect(page.locator('input#empresa')).toBeVisible();
        await expect(page.locator('input#email')).toBeVisible();
        await expect(page.locator('textarea#mensaje')).toBeVisible();
    });

    test('should submit contact form', async ({ page }) => {
        await page.goto(BASE_URL);

        // Scroll a contacto
        await page.locator('#contacto').scrollIntoViewIfNeeded();

        // Llenar formulario
        await page.fill('input#nombre', 'Test User E2E');
        await page.fill('input#empresa', 'Test Transport S.A.');
        await page.fill('input#email', 'test@testcompany.com');
        await page.fill('input#telefono', '1234567890');
        await page.selectOption('select#curso_interes', 'conduccion_preventiva');
        await page.fill('textarea#mensaje', 'Necesitamos capacitación para 20 conductores.');

        // Enviar
        await page.click('button:has-text("Enviar Consulta")');

        // Verificar mensaje de éxito
        await expect(page.locator('text=¡Mensaje Enviado!')).toBeVisible({ timeout: 10000 });
    });

    test('should not have any ANSV references', async ({ page }) => {
        await page.goto(BASE_URL);

        // Verificar que no hay referencias a ANSV en toda la página
        const bodyText = await page.locator('body').textContent();
        expect(bodyText).not.toContain('ANSV');
    });

    test('should not have cotizador section', async ({ page }) => {
        await page.goto(BASE_URL);

        // Verificar que no hay sección de cotizador
        const bodyText = await page.locator('body').textContent();
        expect(bodyText).not.toContain('Cotización Personalizada');
        expect(bodyText).not.toContain('Solicitar Cotización');
    });
});
