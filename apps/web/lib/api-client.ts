const envUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vmp-edtech-6wgw.onrender.com';
export const API_URL = (envUrl.includes('railway') || envUrl.includes('api.vmp-edtech.com'))
    ? 'https://vmp-edtech-6wgw.onrender.com'
    : envUrl;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


async function request(path: string, options: RequestInit & { params?: Record<string, any>; maxRetries?: number } = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('vmp_token') : null;
    const maxRetries = options.maxRetries ?? 3;

    let url = `${API_URL}/api${path}`;
    if (options.params) {
        const query = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query.append(key, String(value));
            }
        });
        const queryString = query.toString();
        if (queryString) {
            url += (url.includes('?') ? '&' : '?') + queryString;
        }
    }

    const headers: Record<string, string> = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...((options.headers as Record<string, string>) || {}),
    };

    // Solo añadir JSON Content-Type si no es FormData
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            // Si recibimos 502/503/504 (servidor arrancando en Render), reintentar
            if ([502, 503, 504].includes(response.status) && attempt < maxRetries) {
                console.warn(`[API Client] Servidor en arranque (status ${response.status}). Reintentando (${attempt}/${maxRetries})...`);
                await sleep(2500);
                continue;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Error desconocido en el servidor' }));
                let errorMessage = 'Ocurrió un error al procesar la solicitud.';

                if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                } else if (Array.isArray(errorData.detail)) {
                    // Errores de validación Pydantic/FastAPI
                    const fieldErrors = errorData.detail.map((err: any) => {
                        const loc = Array.isArray(err.loc) ? err.loc.slice(1).join('.') : 'campo';
                        let msg = err.msg || 'Dato inválido';
                        if (msg.includes('value is not a valid email')) msg = 'Email con formato inválido';
                        if (msg.includes('field required')) msg = 'Campo obligatorio requerido';
                        return `• ${loc.toUpperCase()}: ${msg}`;
                    });
                    errorMessage = `Revise los siguientes campos:\n${fieldErrors.join('\n')}`;
                }

                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (err: any) {
            lastError = err;
            const isNetworkOrColdStart =
                err.name === 'TypeError' ||
                (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('servidor')));

            if (isNetworkOrColdStart && attempt < maxRetries) {
                console.warn(`[API Client] Error de conexión/arranque: ${err.message}. Reintentando (${attempt}/${maxRetries}) en 2.5s...`);
                await sleep(2500);
                continue;
            }
            throw err;
        }
    }

    throw lastError || new Error('No se pudo conectar con el servidor tras varios intentos.');
}

export type ApiOptions = RequestInit & { params?: Record<string, any>; maxRetries?: number };

export const api = {
    get: (path: string, options?: ApiOptions) => request(path, { ...options, method: 'GET' }),
    post: (path: string, body: any, options?: ApiOptions) =>
        request(path, {
            ...options,
            method: 'POST',
            body: body instanceof FormData ? body : JSON.stringify(body),
        }),
    put: (path: string, body: any, options?: ApiOptions) =>
        request(path, {
            ...options,
            method: 'PUT',
            body: body instanceof FormData ? body : JSON.stringify(body),
        }),
    patch: (path: string, body?: any, options?: ApiOptions) =>
        request(path, {
            ...options,
            method: 'PATCH',
            body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
        }),
    delete: (path: string, options?: ApiOptions) => request(path, { ...options, method: 'DELETE' }),
};


