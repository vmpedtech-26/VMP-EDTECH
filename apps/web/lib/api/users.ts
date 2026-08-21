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

export interface InscripcionAlumno {
    id: string;
    curso_id: string;
    curso_nombre: string;
    progreso: number;
    estado: string;
    usa_telemetria_obd2: boolean;
    obd2_sessions_count: number;
}

export const usersApi = {
    /**
     * Listar usuarios con filtros
     */
    async listarUsuarios(params?: { rol?: string; empresaId?: string }): Promise<UserAdmin[]> {
        return api.get('/users', { params });
    },

    /**
     * Obtener detalle de un usuario
     */
    async obtenerUsuario(id: string): Promise<UserAdmin> {
        return api.get(`/users/${id}`);
    },

    /**
     * Cursos en los que está inscripto un alumno (progreso + sesiones OBD2)
     */
    async listarInscripciones(id: string): Promise<InscripcionAlumno[]> {
        return api.get(`/users/${id}/inscripciones`);
    },

    /**
     * Crear un nuevo usuario
     */
    async crearUsuario(data: any): Promise<UserAdmin> {
        return api.post('/users', data);
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
     * Cargar lote masivo de alumnos (nómina). Todos los alumnos del lote
     * quedan vinculados a la misma empresa.
     */
    async crearMasivo(
        alumnos: Array<{ dni: string; nombre: string; apellido: string; email?: string }>,
        empresaId?: string
    ): Promise<{ creados: number; errores: Array<{ dni: string; motivo: string }> }> {
        return api.post('/users/masivo', { alumnos, empresaId });
    },
};
