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
     * (Usa el nuevo router de credenciales)
     */
    async misCredenciales(): Promise<Credencial[]> {
        return api.get('/credenciales/mis-credenciales');
    },

    /**
     * Generar una credencial manualmente
     * (Usa el nuevo router de credenciales)
     */
    async generarCredencial(
        alumnoId: string,
        cursoId: string
    ): Promise<any> {
        return api.post('/credenciales/generar', {
            alumnoId,
            cursoId,
        });
    },
};

