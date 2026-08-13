/**
 * Convierte un nombre de empresa en un slug URL-friendly.
 * Debe producir exactamente el mismo resultado que `slugify()` en
 * apps/api/routers/public.py, ya que el backend resuelve el link de
 * auto-registro (/registro/{slug}) comparando contra este mismo cálculo.
 */
export function slugify(texto: string): string {
    const sinAcentos = texto.normalize('NFKD').replace(/\p{Diacritic}/gu, '');
    return sinAcentos
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
