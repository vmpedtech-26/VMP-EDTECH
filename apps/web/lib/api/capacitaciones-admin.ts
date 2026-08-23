import { api } from '../api-client';

export type EstadoSolicitud = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'EN_CURSO' | 'COMPLETADA';

export interface SolicitudCapacitacion {
    id: string;
    empresa: { id: string; nombre: string };
    curso: { id: string; nombre: string };
    solicitante: { nombre: string; email: string };
    cantidadPersonas: number;
    estado: EstadoSolicitud;
    observaciones?: string | null;
    createdAt: string;
}

export interface HistoricoItem {
    id: string;
    alumno: { id: string; nombre: string; email: string };
    curso: { id: string; nombre: string; codigo: string };
    estado: string;
    progreso: number;
    finDate: string | null;
    updatedAt: string;
}

export const capacitacionesAdminApi = {
    async listarSolicitudes(skip = 0, limit = 50): Promise<{ items: SolicitudCapacitacion[]; total: number }> {
        return api.get('/capacitaciones/training-requests', { params: { skip, limit } });
    },
    async actualizarSolicitud(id: string, estado: EstadoSolicitud) {
        return api.patch(`/capacitaciones/training-requests/${id}`, { estado });
    },
    async listarHistorico(skip = 0, limit = 50): Promise<{ items: HistoricoItem[]; total: number }> {
        return api.get('/capacitaciones/history', { params: { skip, limit } });
    },
};
