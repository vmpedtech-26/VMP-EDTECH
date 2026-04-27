const getApiUrl = () => {
    // 1. Prioridad: Variable de entorno explícita
    if (process.env.NEXT_PUBLIC_API_URL) {
        const envUrl = process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
        // Si la variable de Vercel apunta al backend muerto, forzamos el nuevo
        if (envUrl.includes('vmp-servicios-production.up.railway.app')) {
            return 'https://web-production-1b0066.up.railway.app';
        }
        return envUrl;
    }

    // 2. Detección automática por dominio (Producción)
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const isProduction = hostname.includes('vercel.app') || 
                            hostname.includes('vmp-edtech.com') || 
                            hostname.includes('vmpservicios.com');
        
        if (isProduction) {
            return 'https://web-production-1b0066.up.railway.app';
        }
    }

    // 3. Fallback: Localhost 8000
    return 'http://localhost:8000';
};

const API_URL = getApiUrl();


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
