import { Page } from '@playwright/test';

/**
 * El login es un flujo de dos pasos (email -> chequeo SSO -> password):
 * el input de password no existe en el DOM hasta después de enviar el
 * primer paso, así que hay que completarlos en orden.
 */
export async function login(page: Page, baseUrl: string, email: string, password: string) {
    await page.goto(`${baseUrl}/login`);

    await page.fill('input[type="email"]', email);
    await page.click('button[type="submit"]');

    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/dashboard/, { timeout: 20000 });
}
