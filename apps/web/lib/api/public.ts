import { api } from '../api-client';
import { Curso } from '@/types/training';

export const publicApi = {
    /**
     * Listar todos los cursos públicos para la landing page
     */
    async listarCursosPublicos(): Promise<Curso[]> {
        return api.get('/public/cursos');
    },

    /**
     * Validar una credencial públicamente
     */
    async validarCredencial(numero: string): Promise<any> {
        return api.get(`/public/validar/${numero}`);
    }
};
