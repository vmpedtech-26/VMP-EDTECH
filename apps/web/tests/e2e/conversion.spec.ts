import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function loginAsAdmin(page: any) {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'adminpass123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
}

test.describe('Cotización Conversion Flow', () => {
    test('should convert cotización to client successfully', async ({ page }) => {
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

            // Verificar que hay al menos una credencial
            const credenciales = page.locator('[data-testid="credential-item"]');
            await expect(credenciales.first()).toBeVisible();

            // Cerrar modal
            await page.click('button:has-text("Cerrar")');

            // Verificar que la cotización cambió a estado 'converted'
            await page.reload();
            await expect(page.locator('text=/converted|convertido/i').first()).toBeVisible();
        } else {
            // Si no hay cotizaciones en estado 'contacted', crear una primero
            console.log('No hay cotizaciones en estado "contacted" para convertir');

            // Crear cotización de prueba
            await page.goto(BASE_URL);
            await page.click('text=Solicitar Cotización');

            await page.fill('input[name="empresa"]', 'Test Conversion Company');
            await page.fill('input[name="nombre"]', 'Test User');
            await page.fill('input[name="email"]', 'test@conversion.com');
            await page.fill('input[name="telefono"]', '1234567890');

            await page.click('text=5 conductores');
            await page.click('text=Manejo Defensivo');
            await page.click('text=Online');
            await page.check('input[type="checkbox"][name="acceptTerms"]');
            await page.click('button[type="submit"]');

            await expect(page.locator('text=/cotización enviada/i')).toBeVisible({ timeout: 10000 });

            // Volver al dashboard y cambiar estado
            await loginAsAdmin(page);
            await page.goto(`${BASE_URL}/dashboard/super/cotizaciones`);

            const newRow = page.locator('[data-testid="cotizacion-row"]').filter({
                has: page.locator('text=Test Conversion Company')
            }).first();

            // Cambiar a 'contacted'
            await newRow.locator('[data-testid="status-dropdown"]').click();
            await page.click('text=Contactado');
            await page.click('text=Confirmar');

            await page.waitForTimeout(2000);

            // Ahora convertir
            await newRow.locator('text=/convertir/i').click();
            await page.fill('input[name="empresaCuit"]', '20-99999999-9');
            await page.click('button:has-text("Convertir en Cliente")');

            await expect(page.locator('text=/conversión exitosa/i')).toBeVisible({ timeout: 15000 });
        }
    });

    test('should show validation errors on invalid conversion data', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto(`${BASE_URL}/dashboard/super/cotizaciones`);

        const contactedRow = page.locator('[data-testid="cotizacion-row"]').filter({
            has: page.locator('text=/contacted|contactado/i')
        }).first();

        if (await contactedRow.isVisible()) {
            await contactedRow.locator('text=/convertir/i').click();

            // Intentar enviar sin CUIT
            await page.fill('input[name="empresaCuit"]', '');
            await page.click('button:has-text("Convertir en Cliente")');

            // Verificar mensaje de error de validación
            await expect(page.locator('text=/requerido|required/i')).toBeVisible();
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
