let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Asegurar HTTPS si estamos en un entorno seguro
if (typeof window !== 'undefined' && window.location.protocol === 'https:' && API_URL.startsWith('http://')) {
    API_URL = API_URL.replace('http://', 'https://');
}

async function request(path: string, options: RequestInit & { params?: Record<string, any> } = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('vmp_token') : null;

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

    let response: Response;
    try {
        response = await fetch(url, {
            ...options,
            headers,
        });
    } catch (e: any) {
        console.error('Network error requesting:', url, options.method || 'GET', e);
        throw new Error('Error de conexión con el servidor. Verifique su conexión o la URL del API.');
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));

        // Manejo especial para errores de autenticación
        if (response.status === 401) {
            console.error('Authentication error (401):', error.detail);
            let message = error.detail;
            if (message === 'Could not validate credentials') {
                message = 'Sesión expirada o inválida. Por favor, inicie sesión de nuevo.';
            }
            throw new Error(message || 'Sesión expirada o inválida. Por favor, inicie sesión de nuevo.');
        }

        throw new Error(error.detail || 'Error en la petición');
    }

    return response.json();
}

async function requestBlob(path: string, options: RequestInit & { params?: Record<string, any> } = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('vmp_token') : null;

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

    let response: Response;
    try {
        response = await fetch(url, {
            ...options,
            headers,
        });
    } catch (e: any) {
        console.error('Network error requesting blob:', url, e);
        throw new Error('Error de conexión con el servidor.');
    }

    if (!response.ok) {
        throw new Error('Error al descargar el archivo');
    }

    return response.blob();
}

export type ApiOptions = RequestInit & { params?: Record<string, any> };

export const api = {
    get: (path: string, options?: ApiOptions) => request(path, { ...options, method: 'GET' }),
    getBlob: (path: string, options?: ApiOptions) => requestBlob(path, { ...options, method: 'GET' }),
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
