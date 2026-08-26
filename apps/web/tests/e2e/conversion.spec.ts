import { test, expect, APIRequestContext } from '@playwright/test';
import { login } from './helpers/auth';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'adminpass123';

/**
 * Crea una cotización propia en estado 'contacted' vía API para que cada
 * test tenga su propio dato aislado (en vez de depender de la única
 * cotización que siembra apps/api/scripts/seed_e2e.py, que se agotaría
 * después del primer test que la convierte).
 */
async function createContactedCotizacion(request: APIRequestContext, label: string) {
    const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const createRes = await request.post(`${API_URL}/api/cotizaciones`, {
        data: {
            empresa: `${label} ${suffix}`,
            nombre: 'John Doe',
            email: `${label.toLowerCase().replace(/\s+/g, '-')}-${suffix}@test.com`,
            telefono: '1234567890',
            quantity: 3,
            course: 'defensivo',
            modality: 'online',
            totalPrice: 30000,
            pricePerStudent: 10000,
            discount: 0,
            acceptMarketing: true,
            acceptTerms: true,
        },
    });
    const cotizacion = await createRes.json();

    const loginRes = await request.post(`${API_URL}/api/auth/login`, {
        data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    const { access_token } = await loginRes.json();

    await request.patch(`${API_URL}/api/cotizaciones/${cotizacion.id}/status`, {
        headers: { Authorization: `Bearer ${access_token}` },
        params: { status: 'contacted' },
    });

    return { ...cotizacion, cuit: `20-${suffix.slice(-8).padStart(8, '0')}-9` };
}

test.describe('Cotización Conversion Flow', () => {
    test('should convert cotización to client successfully', async ({ page, request }) => {
        const cotizacion = await createContactedCotizacion(request, 'Conversion Success');

        await login(page, BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD);
        await page.goto(`${BASE_URL}/dashboard/super/cotizaciones`);

        const row = page.locator('[data-testid="cotizacion-row"]').filter({ hasText: cotizacion.empresa });
        await row.locator('button:has-text("Convertir en Cliente")').click();

        await expect(page.locator('text=/convertir en cliente/i')).toBeVisible();

        await page.fill('input[name="empresaCuit"]', cotizacion.cuit);
        await page.fill('input[name="empresaDireccion"]', 'Calle Test 123');

        const cantidadInput = page.locator('input[name="cantidadAlumnos"]');
        await expect(cantidadInput).toHaveValue(/\d+/);

        await page.click('button[type="submit"]:has-text("Convertir en Cliente")');

        await expect(page.locator('text=/conversión exitosa/i')).toBeVisible({ timeout: 15000 });
        await expect(page.locator('text=/credenciales de acceso/i')).toBeVisible();

        const credenciales = page.locator('[data-testid="credential-item"]');
        await expect(credenciales.first()).toBeVisible();
        await expect(credenciales).toHaveCount(3);

        await page.click('button:has-text("Cerrar")');

        await page.reload();
        await expect(row.locator('[data-testid="status-badge"]')).toContainText(/convertido/i);
    });

    test('should show validation errors on invalid conversion data', async ({ page, request }) => {
        const cotizacion = await createContactedCotizacion(request, 'Conversion Invalid');

        await login(page, BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD);
        await page.goto(`${BASE_URL}/dashboard/super/cotizaciones`);

        const row = page.locator('[data-testid="cotizacion-row"]').filter({ hasText: cotizacion.empresa });
        await row.locator('button:has-text("Convertir en Cliente")').click();

        // Intentar enviar sin CUIT
        await page.fill('input[name="empresaCuit"]', '');
        await page.click('button[type="submit"]:has-text("Convertir en Cliente")');

        await expect(page.locator('text=/requerido|required/i')).toBeVisible();
    });

    test('should copy credentials to clipboard', async ({ page, request, context }) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);

        const cotizacion = await createContactedCotizacion(request, 'Conversion Clipboard');

        await login(page, BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD);
        await page.goto(`${BASE_URL}/dashboard/super/cotizaciones`);

        const row = page.locator('[data-testid="cotizacion-row"]').filter({ hasText: cotizacion.empresa });
        await row.locator('button:has-text("Convertir en Cliente")').click();

        await page.fill('input[name="empresaCuit"]', cotizacion.cuit);
        await page.click('button[type="submit"]:has-text("Convertir en Cliente")');

        await expect(page.locator('text=/conversión exitosa/i')).toBeVisible({ timeout: 15000 });

        const copyButton = page.locator('button:has-text("Copiar")').first();
        await copyButton.click();

        await expect(page.locator('button:has-text("Copiado!")')).toBeVisible({ timeout: 3000 });
    });
});
