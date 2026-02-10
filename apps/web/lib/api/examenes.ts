import { QuizFeedbackResponse, Credencial } from '@/types/training';
import { api } from '../api-client';

export const examenesApi = {
    /**
     * Enviar respuestas de quiz
     */
    async enviarQuiz(
        cursoId: string,
        moduloId: string,
        respuestas: Record<string, number>
    ): Promise<QuizFeedbackResponse> {
        return api.post('/examenes/enviar-quiz', {
            cursoId,
            moduloId,
            respuestas,
        });
    },

    /**
     * Obtener todas las credenciales del usuario actual
     */
    async misCredenciales(): Promise<Credencial[]> {
        return api.get('/examenes/mis-credenciales');
    },

    /**
     * Generar una credencial (normalmente automático, pero para manual admin o reintentos)
     */
    async generarCredencial(
        alumnoId: string,
        cursoId: string
    ): Promise<Credencial> {
        return api.post('/examenes/generar-credencial', {
            alumnoId,
            cursoId,
        });
    },
};
