import {
    MisCursosResponse,
    Inscripcion,
    CompletarModuloResponse,
} from '@/types/training';
import { api } from '../api-client';

export const inscripcionesApi = {
    /**
     * Obtener cursos del usuario actual con progreso
     */
    async misCursos(): Promise<MisCursosResponse> {
        return api.get('/inscripciones/mis-cursos');
    },

    /**
     * Inscribirse en un curso
     */
    async inscribirse(cursoId: string): Promise<Inscripcion> {
        return api.post(`/inscripciones/${cursoId}/inscribir`, {});
    },

    /**
     * Obtener estado de inscripción en un curso
     */
    async obtenerInscripcion(cursoId: string): Promise<Inscripcion> {
        return api.get(`/inscripciones/${cursoId}`);
    },

    /**
     * Completar un módulo
     */
    async completarModulo(
        cursoId: string,
        moduloId: string,
        calificacionQuiz?: number,
        aprobadoQuiz?: boolean
    ): Promise<CompletarModuloResponse> {
        return api.post(
            `/inscripciones/${cursoId}/modulos/${moduloId}/completar`,
            {
                moduloId,
                calificacionQuiz,
                aprobadoQuiz,
            }
        );
    },
};
