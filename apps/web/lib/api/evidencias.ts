import { Evidencia, UploadEvidenciaResponse } from '@/types/training';
import { api } from '../api-client';

export const evidenciasApi = {
    /**
     * Subir foto de evidencia
     */
    async uploadEvidencia(
        file: File,
        tareaId: string,
        comentario?: string
    ): Promise<UploadEvidenciaResponse> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tareaId', tareaId);
        if (comentario) {
            formData.append('comentario', comentario);
        }

        return api.post('/evidencias/upload', formData);
    },

    /**
     * Obtener evidencias de una tarea
     */
    async obtenerEvidencias(tareaId: string): Promise<Evidencia[]> {
        const response = await api.get(`/evidencias/tarea/${tareaId}`);
        return response.evidencias;
    },

    /**
     * Eliminar evidencia
     */
    async eliminarEvidencia(id: string): Promise<{ success: boolean; message: string }> {
        return api.delete(`/evidencias/${id}`);
    },

    /**
     * Listar evidencias pendientes de revisión (Instructor)
     */
    async listarRevisiones(): Promise<Evidencia[]> {
        const response = await api.get('/evidencias/revision');
        return response.evidencias;
    },

    /**
     * Evaluar evidencia (Instructor)
     */
    async evaluarEvidencia(
        id: string,
        data: { estado: 'APROBADA' | 'RECHAZADA'; feedback?: string }
    ): Promise<Evidencia> {
        return api.put(`/evidencias/${id}/evaluar`, data);
    },
};
