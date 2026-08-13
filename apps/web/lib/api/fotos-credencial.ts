import { api } from '../api-client';

export type EstadoFoto = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

export interface FotoCredencial {
    id: string;
    alumnoId: string;
    fotoUrl: string;
    comentario: string | null;
    estado: EstadoFoto;
    feedback: string | null;
    evaluadorId: string | null;
    uploadedAt: string;
    updatedAt: string | null;
}

export const fotosCredencialApi = {
    async miFoto(alumnoId: string): Promise<FotoCredencial | null> {
        try {
            return await api.get(`/fotos-credencial/alumno/${alumnoId}`);
        } catch (error: any) {
            // El backend devuelve 404 con detail "No se encontró foto para este alumno"
            // cuando el alumno todavía no subió ninguna; api-client no expone el status
            // HTTP, así que distinguimos por el mensaje.
            if (/no se encontr/i.test(error?.message || '')) {
                return null;
            }
            throw error;
        }
    },

    async subirFoto(alumnoId: string, file: File): Promise<{ success: boolean; foto: FotoCredencial; message: string }> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('alumnoId', alumnoId);
        return api.post('/fotos-credencial/upload', formData);
    },
};
