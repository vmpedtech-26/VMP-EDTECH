// API configuration and utilities

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface CotizacionData {
    empresa: string;
    cuit?: string;
    nombre: string;
    email: string;
    telefono: string;
    comentarios?: string;
    quantity: number;
    course: string;
    modality: string;
    totalPrice: number;
    pricePerStudent: number;
    discount: number;
    acceptMarketing: boolean;
    acceptTerms: boolean;
}

export interface ContactFormData {
    nombre: string;
    email: string;
    empresa: string;
    telefono?: string;
    mensaje: string;
    curso_interes?: string;
}


export interface CotizacionResponse {
    id: number;
    empresa: string;
    nombre: string;
    email: string;
    telefono: string;
    quantity: number;
    course: string;
    modality: string;
    totalPrice: number;
    status: string;
    createdAt: string;
}

class ApiError extends Error {
    constructor(public status: number, message: string, public details?: any) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Submit a quote/cotizacion to the backend
 */
export async function submitCotizacion(data: CotizacionData): Promise<CotizacionResponse> {
    try {
        const response = await fetch(`${API_URL}/api/cotizaciones/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                response.status,
                errorData.detail || `Error ${response.status}: ${response.statusText}`,
                errorData
            );
        }

        const result = await response.json();
        return result;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        // Network or other errors
        throw new ApiError(
            0,
            'Error de conexión. Por favor verifica tu conexión a internet e intenta nuevamente.',
            error
        );
    }
}

/**
 * Get all cotizaciones (for admin panel)
 */
export async function getCotizaciones(
    skip: number = 0,
    limit: number = 100,
    status?: string
): Promise<CotizacionResponse[]> {
    try {
        const params = new URLSearchParams({
            skip: skip.toString(),
            limit: limit.toString(),
        });

        if (status) {
            params.append('status', status);
        }

        const response = await fetch(`${API_URL}/api/cotizaciones/?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                response.status,
                errorData.detail || `Error ${response.status}: ${response.statusText}`,
                errorData
            );
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            0,
            'Error de conexión al obtener cotizaciones.',
            error
        );
    }
}

/**
 * Update cotizacion status
 */
export async function updateCotizacionStatus(
    id: number,
    status: 'pending' | 'contacted' | 'converted' | 'rejected'
): Promise<any> {
    try {
        const response = await fetch(`${API_URL}/api/cotizaciones/${id}/status?status=${status}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                response.status,
                errorData.detail || `Error ${response.status}: ${response.statusText}`,
                errorData
            );
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            0,
            'Error de conexión al actualizar estado.',
            error
        );
    }
}

/**
 * Convert cotizacion to client (create company + students + enrollments)
 */
export interface ConvertCotizacionRequest {
    empresaNombre?: string;
    empresaCuit?: string;
    empresaDireccion?: string;
    empresaTelefono?: string;
    cantidadAlumnos?: number;
}

export interface ConvertCotizacionResponse {
    empresa: {
        id: string;
        nombre: string;
        cuit: string;
        email: string;
    };
    alumnos: Array<{
        id: string;
        nombre: string;
        apellido: string;
        email: string;
        dni: string;
        password_temporal: string;
    }>;
    inscripciones: Array<{
        id: string;
        alumnoId: string;
        cursoId: string;
        curso: string;
    }>;
    credenciales: {
        empresa_email: string;
        alumnos: Array<{
            email: string;
            password: string;
        }>;
        nota: string;
    };
    message: string;
}

export async function convertCotizacionToClient(
    id: number,
    data: ConvertCotizacionRequest = {}
): Promise<ConvertCotizacionResponse> {
    try {
        const response = await fetch(`${API_URL}/api/cotizaciones/${id}/convert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                response.status,
                errorData.detail || `Error ${response.status}: ${response.statusText}`,
                errorData
            );
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            0,
            'Error de conexión al convertir cotización.',
            error
        );
    }
}

/**
 * Submit contact form
 */
export async function submitContactForm(data: ContactFormData): Promise<any> {
    try {
        const response = await fetch(`${API_URL}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                response.status,
                errorData.detail || `Error ${response.status}: ${response.statusText}`,
                errorData
            );
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            0,
            'Error de conexión al enviar el formulario de contacto.',
            error
        );
    }
}


export { ApiError };

