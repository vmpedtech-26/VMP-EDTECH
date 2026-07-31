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
};
