import { api } from '../api-client';

export interface NotificacionItem {
    id: string;
    titulo: string;
    mensaje: string;
    tipo: string;
    leida: boolean;
    url?: string | null;
    createdAt: string;
}

export interface NotificacionesResponse {
    items: NotificacionItem[];
    unread: number;
}

export const notificacionesApi = {
    async listar(limit = 12): Promise<NotificacionesResponse> {
        return api.get('/notifications', { params: { limit } });
    },

    async contarNoLeidas(): Promise<{ count: number }> {
        return api.get('/notifications/unread-count');
    },

    async marcarLeida(id: string): Promise<{ ok: boolean }> {
        return api.patch(`/notifications/${id}/read`);
    },

    async marcarTodasLeidas(): Promise<{ ok: boolean }> {
        return api.patch('/notifications/mark-all-read');
    },
};
