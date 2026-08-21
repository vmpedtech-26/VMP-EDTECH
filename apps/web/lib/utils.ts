import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Formatea un monto en pesos argentinos: separador de miles con punto, sin decimales por defecto. */
export function formatARS(value: number | null | undefined, options?: { decimals?: number; withSymbol?: boolean }): string {
    const { decimals = 0, withSymbol = true } = options || {};
    const n = value ?? 0;
    const formatted = n.toLocaleString('es-AR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
    return withSymbol ? `$${formatted}` : formatted;
}

/** Formatea un número genérico (no monetario) con separador de miles con punto. */
export function formatNumber(value: number | null | undefined, decimals = 0): string {
    const n = value ?? 0;
    return n.toLocaleString('es-AR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}
