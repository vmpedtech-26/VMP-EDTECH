export const API_URL = (() => {
    // 1. Prioritize environment variable if defined and not pointing to localhost
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return envUrl;
    }

    // 2. Browser-side adjustments when envUrl is missing or local
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        
        // Production domain or Vercel preview fallback
        if (hostname.includes('vmp-edtech.com') || hostname.includes('vmpservicios.com') || hostname.includes('vercel.app')) {
            const fallbackUrl = process.env.NEXT_PUBLIC_RAILWAY_URL || 'https://vmp-servicios-production.up.railway.app';
            console.log(`[API-CLIENT] Using Production API URL: ${fallbackUrl}`);
            return fallbackUrl;
        }
    }
    
    return envUrl || 'http://localhost:8000';
})();

async function request(path: string, options: RequestInit & { params?: Record<string, any>, timeout?: number } = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('vmp_token') : null;

    const baseUrl = API_URL;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    let url = `${baseUrl}/api${cleanPath}`;
    
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

    const timeout = options.timeout || 60000;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        let response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
        });

        // Highly resilient retry mechanism for 503 (Database Connection / Lazy Setup)
        let retries = 0;
        const maxRetries = 2;
        const retryDelay = 800;

        while (response.status === 503 && retries < maxRetries) {
            retries++;
            console.warn(`[API-CLIENT] HTTP 503 received (Attempt ${retries}/${maxRetries}). Retrying in ${retryDelay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal,
            });
        }

        clearTimeout(id);

        if (response.status === 401 && cleanPath !== '/auth/login') {
            // Manejar expiración de sesión
            if (typeof window !== 'undefined') {
                localStorage.removeItem('vmp_token');
                localStorage.removeItem('vmp_user');
                document.cookie = 'vmp_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login?error=session_expired';
                }
            }
            throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Error desconocido en el servidor', request_id: undefined }));
            let errMsg = error.detail || `Error ${response.status}: ${response.statusText}`;
            if (error.request_id) {
                errMsg += ` (ID de seguimiento: ${error.request_id})`;
            }
            throw new Error(errMsg);
        }

        return response.json();
    } catch (error: any) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error('La petición tardó demasiado tiempo. Verifique su conexión.');
        }
        if (error.message && error.message.includes('Failed to fetch')) {
            throw new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.');
        }
        throw error;
    }
}

export type ApiOptions = RequestInit & { params?: Record<string, any> };

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
    patch: (path: string, body: any, options?: ApiOptions) =>
        request(path, {
            ...options,
            method: 'PATCH',
            body: body instanceof FormData ? body : JSON.stringify(body),
        }),
    delete: (path: string, options?: ApiOptions) => request(path, { ...options, method: 'DELETE' }),
};
