export const API_URL = (() => {
    // 1. Get from env or default to localhost
    let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // 2. Browser-side adjustments
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        
        // If we are on the production domain but the API URL is still pointing to localhost or uses http
        if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
            // Force production API if misconfigured
            if (url.includes('localhost') || url.includes('127.0.0.1')) {
                url = 'https://api.vmp-edtech.com';
            } else {
                url = url.replace('http://', 'https://');
            }
        }
    }
    
    return url;
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

    const timeout = options.timeout || 15000;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
        });

        clearTimeout(id);

        if (response.status === 401) {
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
            const error = await response.json().catch(() => ({ detail: 'Error desconocido en el servidor' }));
            throw new Error(error.detail || `Error ${response.status}: ${response.statusText}`);
        }

        return response.json();
    } catch (error: any) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error('La petición tardó demasiado tiempo. Verifique su conexión.');
        }
        if (error.message.includes('Failed to fetch')) {
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
    delete: (path: string, options?: ApiOptions) => request(path, { ...options, method: 'DELETE' }),
};
