import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Sembrados por apps/api/scripts/seed_e2e.py: alumno + curso COND-DEF con un
// módulo QUIZ de 1 pregunta (respuesta correcta: índice 0, "40 km/h").
const ALUMNO_EMAIL = 'test@example.com';
const ALUMNO_PASSWORD = 'testpass123';

test.describe('Flujo de curso y examen (alumno)', () => {
    let cursoId: string;
    let token: string;

    test.beforeEach(async ({ page, request }) => {
        await login(page, BASE_URL, ALUMNO_EMAIL, ALUMNO_PASSWORD);
        token = await page.evaluate(() => localStorage.getItem('vmp_token') || '');

        const res = await request.get(`${API_URL}/api/cursos`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const cursos = await res.json();
        const curso = cursos.find((c: any) => c.codigo === 'COND-DEF');
        cursoId = curso.id;
    });

    test('el alumno puede inscribirse y ver el curso en "Mis Cursos"', async ({ page }) => {
        await page.goto(`${BASE_URL}/dashboard/cursos/${cursoId}`);
        await expect(page.locator('h1:has-text("Manejo Defensivo")')).toBeVisible();

        await page.click('button:has-text("Inscribirme Ahora")');
        await expect(page.locator('text=En curso')).toBeVisible();

        await page.goto(`${BASE_URL}/dashboard/cursos`);
        await expect(page.locator('h3:has-text("Manejo Defensivo")')).toBeVisible();
    });

    test('el alumno puede rendir el quiz y ver el resultado aprobado', async ({ page }) => {
        await page.goto(`${BASE_URL}/dashboard/cursos/${cursoId}`);

        if (!(await page.locator('text=En curso').isVisible())) {
            await page.click('button:has-text("Inscribirme Ahora")');
            await expect(page.locator('text=En curso')).toBeVisible();
        }

        await page.click('a:has-text("Iniciar")');
        await expect(page.locator('h2:has-text("Evaluación Final")')).toBeVisible();

        // Única pregunta sembrada: la opción correcta es "40 km/h".
        await page.click('button:has-text("40 km/h")');
        await page.click('button:has-text("Enviar Quiz")');

        await expect(page.locator('text=/Respondiste correctamente/i')).toBeVisible();
        await expect(page.locator('button:has-text("Completar y Continuar")')).toBeVisible();
    });
});
