// Training-related TypeScript types

export type TipoModulo = 'TEORIA' | 'QUIZ' | 'PRACTICA';

export type EstadoInscripcion =
    | 'NO_INICIADO'
    | 'EN_PROGRESO'
    | 'COMPLETADO'
    | 'APROBADO'
    | 'REPROBADO';

export interface Curso {
    id: string;
    nombre: string;
    descripcion: string;
    codigo: string;
    duracionHoras: number;
    vigenciaMeses?: number;
    activo: boolean;
    // Campos opcionales para la creación/edición
    liveClassPlatform?: 'google_meet' | 'teams';
    liveClassUrl?: string;
    evaluationTemplateId?: string;
    empresaId?: string | null;
}

export interface CreateCursoRequest {
    nombre: string;
    descripcion: string;
    codigo: string;
    duracionHoras: number;
    vigenciaMeses?: number;
    empresaId?: string | null;
    liveClassPlatform?: string;
    liveClassUrl?: string;
    evaluationTemplateId?: string;
}

export interface ModuloSummary {
    id: string;
    titulo: string;
    orden: number;
    tipo: TipoModulo;
}

export interface CursoDetail extends Curso {
    modulos: ModuloSummary[];
}

export interface Pregunta {
    id: string;
    pregunta: string;
    opciones: string[];
}

export interface PreguntaFeedback {
    preguntaId: string;
    correcta: boolean;
    respuestaElegida: number;
    respuestaCorrecta: number;
    explicacion?: string;
}

export interface TareaPractica {
    id: string;
    descripcion: string;
    requiereFoto: boolean;
}

export interface Modulo {
    id: string;
    titulo: string;
    orden: number;
    tipo: TipoModulo;
    contenidoHtml?: string;
    videoUrl?: string;
    // Live class support
    liveClassUrl?: string;
    liveClassDate?: string;
    liveClassPlatform?: 'google_meet' | 'teams';
    preguntas?: Pregunta[];
    tareasPracticas?: TareaPractica[];
}

export interface Inscripcion {
    id: string;
    progreso: number;
    estado: EstadoInscripcion;
    inicioDate?: string;
    finDate?: string;
    cursoId: string;
    alumnoId: string;
    modulosCompletados?: string[];
}

export interface MisCursosItem {
    id: string;
    nombre: string;
    descripcion: string;
    codigo: string;
    duracionHoras: number;
    progreso: number;
    estado: EstadoInscripcion;
    proximaActividad?: string;
}

export interface MisCursosResponse {
    cursos: MisCursosItem[];
    stats: {
        cursosActivos: number;
        cursosCompletados: number;
        credencialesObtenidas: number;
        horasAcumuladas: number;
    };
}

export interface QuizFeedbackResponse {
    calificacion: number;
    aprobado: boolean;
    respuestasCorrectas: number;
    totalPreguntas: number;
    feedback: PreguntaFeedback[];
    message: string;
}

export interface CompletarModuloResponse {
    success: boolean;
    nuevoProgreso: number;
    cursoCompletado: boolean;
    credencialGenerada: boolean;
    credencialNumero?: string;
    message: string;
}

export interface Evidencia {
    id: string;
    tareaId: string;
    alumnoId: string;
    fotoUrl: string;
    comentario?: string;
    estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
    feedback?: string;
    evaluadorId?: string;
    uploadedAt: string;
    alumno?: {
        nombre: string;
        apellido: string;
        dni: string;
        email: string;
    };
    tarea?: {
        descripcion: string;
        modulo: {
            titulo: string;
            curso: {
                nombre: string;
            };
        };
    };
}

export interface UploadEvidenciaResponse {
    success: boolean;
    evidencia: Evidencia;
    message: string;
}

export interface Credencial {
    id: string;
    numero: string;
    pdfUrl: string;
    qrCodeUrl: string;
    fechaEmision: string;
    fechaVencimiento?: string;
    curso: Curso;
}
