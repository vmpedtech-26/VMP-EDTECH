import { Curso, CursoDetail, Modulo } from '@/types/training';
import { api } from '../api-client';

export interface CursoAsignado {
    id: string;
    nombre: string;
    codigo: string;
    descripcion: string;
    activo: boolean;
    modalidad: 'ONLINE' | 'IN_COMPANY' | 'HYBRID';
    totalInscripciones: number;
    completadas: number;
    credencialesEmitidas: number;
    tasaCompletitud: number;
}

export const cursosApi = {
    /**
     * Listar todos los cursos activos
     */
    async listarCursos(): Promise<Curso[]> {
        return api.get('/cursos');
    },

    /**
     * Cursos donde el usuario actual es el instructor asignado, con métricas
     */
    async listarCursosAsignados(): Promise<CursoAsignado[]> {
        return api.get('/cursos/asignados');
    },

    /**
     * Obtener detalle de un curso con sus módulos
     */
    async obtenerCurso(id: string): Promise<CursoDetail> {
        return api.get(`/cursos/${id}`);
    },

    /**
     * Crear un nuevo curso (Solo SUPER_ADMIN)
     */
    async crearCurso(data: Partial<Curso>): Promise<Curso> {
        return api.post('/cursos', data);
    },

    /**
     * Actualizar un curso (Solo SUPER_ADMIN)
     */
    async actualizarCurso(id: string, data: Partial<Curso>): Promise<Curso> {
        return api.put(`/cursos/${id}`, data);
    },

    /**
     * Eliminar un curso (Solo SUPER_ADMIN)
     */
    async eliminarCurso(id: string): Promise<{ message: string }> {
        return api.delete(`/cursos/${id}`);
    },

    /**
     * Listar módulos de un curso
     */
    async obtenerModulos(cursoId: string): Promise<Modulo[]> {
        return api.get(`/cursos/${cursoId}/modulos`);
    },

    /**
     * Obtener detalle de un módulo específico
     */
    async obtenerModulo(cursoId: string, moduloId: string): Promise<Modulo> {
        return api.get(`/cursos/${cursoId}/modulos/${moduloId}`);
    },

    /**
     * Crear un módulo (Solo SUPER_ADMIN)
     */
    async crearModulo(cursoId: string, data: any): Promise<Modulo> {
        return api.post(`/cursos/${cursoId}/modulos`, data);
    },

    /**
     * Eliminar un módulo (Solo SUPER_ADMIN)
     */
    async eliminarModulo(cursoId: string, moduloId: string): Promise<{ message: string }> {
        return api.delete(`/cursos/${cursoId}/modulos/${moduloId}`);
    },

    /**
     * Obtener detalle de un módulo con respuestas (Solo ADMIN)
     */
    async obtenerModuloAdmin(cursoId: string, moduloId: string): Promise<any> {
        return api.get(`/cursos/${cursoId}/modulos/${moduloId}/admin`);
    },

    /**
     * Actualizar contenido de un módulo (Solo SUPER_ADMIN)
     */
    async actualizarModulo(cursoId: string, moduloId: string, data: any): Promise<any> {
        return api.put(`/cursos/${cursoId}/modulos/${moduloId}`, data);
    },
};
