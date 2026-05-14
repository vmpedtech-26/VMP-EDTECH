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

async function request(path: string, options: RequestInit & { params?: Record<string, any> } = {}) {
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

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
        throw new Error(error.detail || 'Error en la petición');
    }

    return response.json();
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
