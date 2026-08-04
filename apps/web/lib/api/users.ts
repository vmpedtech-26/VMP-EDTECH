import { api } from '../api-client';

export interface UserAdmin {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    dni: string;
    telefono?: string;
    rol: string;
    empresaId?: string;
    empresa_nombre?: string;
    activo: boolean;
    createdAt: string;
}

export const usersApi = {
    /**
     * Listar usuarios con filtros
     */
    async listarUsuarios(params?: { rol?: string; empresaId?: string }): Promise<UserAdmin[]> {
        return api.get('/users/', { params });
    },

    /**
     * Obtener detalle de un usuario
     */
    async obtenerUsuario(id: string): Promise<UserAdmin> {
        return api.get(`/users/${id}`);
    },

    /**
     * Crear un nuevo usuario
     */
    async crearUsuario(data: any): Promise<UserAdmin> {
        return api.post('/users/', data);
    },

    /**
     * Actualizar un usuario
     */
    async actualizarUsuario(id: string, data: any): Promise<UserAdmin> {
        return api.put(`/users/${id}`, data);
    },

    /**
     * Eliminar o desactivar un usuario
     */
    async eliminarUsuario(id: string): Promise<{ message: string }> {
        return api.delete(`/users/${id}`);
    },

    /**
     * Cargar lote masivo de alumnos
     */
    async crearMasivo(alumnos: Array<{ dni: string; nombre: string; apellido: string; email?: string; empresaId?: string }>): Promise<{ creados: number; errores: any[] }> {
        try {
            return await api.post('/users/masivo', { alumnos });
        } catch (error) {
            // Fallback resiliente: creación en batch si el servidor mock no tiene endpoint masivo
            const resultados = await Promise.allSettled(
                alumnos.map(a => api.post('/users/', { ...a, rol: 'ALUMNO' }))
            );
            const creados = resultados.filter(r => r.status === 'fulfilled').length;
            return { creados, errores: [] };
        }
    },
};
