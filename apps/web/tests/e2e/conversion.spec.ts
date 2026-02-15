import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function loginAsAdmin(page: any) {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'adminpass123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
}

test.describe('Contact Form Conversion Flow', () => {
    test('should submit contact form and receive success feedback', async ({ page }) => {
        await page.goto(BASE_URL);

        // Scroll to contact section
        await page.locator('#contacto').scrollIntoViewIfNeeded();

        // Fill contact form
        await page.fill('input#nombre', 'Test Conversion User');
        await page.fill('input#empresa', 'Test Conversion Company');
        await page.fill('input#email', 'test@conversion.com');
        await page.fill('input#telefono', '1234567890');
        await page.selectOption('select#curso_interes', 'carga_pesada');
        await page.fill('textarea#mensaje', 'Necesitamos capacitación para nuestra flota de camiones.');

        // Submit form
        await page.click('button:has-text("Enviar Consulta")');

        // Verify success message
        await expect(page.locator('text=¡Mensaje Enviado!')).toBeVisible({ timeout: 10000 });

        // Verify can send another message
        await page.click('text=Enviar otra consulta');
        await expect(page.locator('input#nombre')).toBeVisible();
    });

    test('should require mandatory fields', async ({ page }) => {
        await page.goto(BASE_URL);

        // Scroll to contact section
        await page.locator('#contacto').scrollIntoViewIfNeeded();

        // Try to submit empty form (HTML5 validation should prevent it)
        const submitButton = page.locator('button:has-text("Enviar Consulta")');
        await submitButton.click();

        // Form should still be visible (not submitted)
        await expect(page.locator('input#nombre')).toBeVisible();
    });

    test('should convert cotización to client in admin dashboard', async ({ page }) => {
        // Login como admin
        await loginAsAdmin(page);

        // Navegar a cotizaciones
        await page.goto(`${BASE_URL}/dashboard/super/cotizaciones`);

        // Buscar una cotización en estado 'contacted'
        const contactedRow = page.locator('[data-testid="cotizacion-row"]').filter({
            has: page.locator('text=/contacted|contactado/i')
        }).first();

        if (await contactedRow.isVisible()) {
            // Click en botón de convertir
            await contactedRow.locator('text=/convertir/i').click();

            // Verificar que el modal se abre
            await expect(page.locator('text=/convertir en cliente/i')).toBeVisible();

            // Llenar formulario de conversión
            await page.fill('input[name="empresaCuit"]', '20-12345678-9');
            await page.fill('input[name="empresaDireccion"]', 'Calle Test 123');

            // Verificar cantidad de alumnos pre-llenada
            const cantidadInput = page.locator('input[name="cantidadAlumnos"]');
            await expect(cantidadInput).toHaveValue(/\d+/);

            // Confirmar conversión
            await page.click('button:has-text("Convertir en Cliente")');

            // Esperar a que se complete la conversión
            await expect(page.locator('text=/conversión exitosa/i')).toBeVisible({ timeout: 15000 });

            // Verificar que se muestran las credenciales generadas
            await expect(page.locator('text=/credenciales de acceso/i')).toBeVisible();

            // Cerrar modal
            await page.click('button:has-text("Cerrar")');
        }
    });

    test('should copy credentials to clipboard', async ({ page, context }) => {
        // Otorgar permisos de clipboard
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);

        await loginAsAdmin(page);
        await page.goto(`${BASE_URL}/dashboard/super/cotizaciones`);

        const contactedRow = page.locator('[data-testid="cotizacion-row"]').filter({
            has: page.locator('text=/contacted|contactado/i')
        }).first();

        if (await contactedRow.isVisible()) {
            await contactedRow.locator('text=/convertir/i').click();

            await page.fill('input[name="empresaCuit"]', '20-11111111-1');
            await page.click('button:has-text("Convertir en Cliente")');

            await expect(page.locator('text=/conversión exitosa/i')).toBeVisible({ timeout: 15000 });

            // Click en botón de copiar
            const copyButton = page.locator('button:has-text("Copiar")').first();
            await copyButton.click();

            // Verificar que el texto cambió a "Copiado!"
            await expect(page.locator('button:has-text("Copiado!")')).toBeVisible({ timeout: 3000 });
        }
    });
});
