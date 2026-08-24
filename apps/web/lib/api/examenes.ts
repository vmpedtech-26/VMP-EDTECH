import { QuizFeedbackResponse, Credencial } from '@/types/training';
import { api } from '../api-client';

export interface ExamenDetallePregunta {
    preguntaId: string;
    pregunta: string;
    opciones: string[];
    respuestaElegida: number;
    respuestaCorrecta: number;
    correcta: boolean;
    explicacion?: string | null;
}

export interface ExamenDetalle {
    id: string;
    alumno: { nombre: string; apellido: string; dni: string; email: string };
    curso: { nombre: string; codigo: string };
    calificacion: number | null;
    aprobado: boolean | null;
    realizadoAt: string | null;
    preguntas: ExamenDetallePregunta[];
}

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
     * Generar una credencial para una inscripción específica
     * inscripcionId: ID de la inscripción del alumno en el curso
     */
    async generarCredencial(inscripcionId: string): Promise<{ message: string; pdfUrl: string; numero: string }> {
        return api.post(`/examenes/generar-credencial/${inscripcionId}`, {});
    },

    /**
     * Detalle de un examen puntual con revisión pregunta por pregunta (Instructor/Admin)
     */
    async obtenerDetalle(examenId: string): Promise<ExamenDetalle> {
        return api.get(`/examenes/${examenId}`);
    },
};
