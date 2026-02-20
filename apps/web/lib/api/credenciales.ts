import { api } from '../api-client';

export interface CredencialListItem {
    id: string;
    numero: string;
    pdfUrl: string;
    qrCodeUrl: string;
    fechaEmision: string;
    fechaVencimiento?: string;
    alumnoNombre: string;
    alumnoApellido: string;
    alumnoDni: string;
    cursoNombre: string;
    cursoCodigo: string;
    empresaNombre?: string;
}

export const credencialesApi = {
    /**
     * Listar credenciales (INSTRUCTOR/SUPER_ADMIN)
     */
    async listar(params?: {
        empresaId?: string;
        cursoId?: string;
        alumnoId?: string;
    }): Promise<CredencialListItem[]> {
        return api.get('/credenciales/', { params });
    },

    /**
     * Mis credenciales (ALUMNO)
     */
    async misCredenciales() {
        return api.get('/credenciales/mis-credenciales');
    },

    /**
     * Generar credencial manualmente (INSTRUCTOR/SUPER_ADMIN)
     */
    async generar(alumnoId: string, cursoId: string) {
        return api.post('/credenciales/generar', { alumnoId, cursoId });
    },

    /**
     * Descargar lote de credenciales en un solo PDF
     */
    async descargarLote(cursoId: string): Promise<{ pdfUrl: string }> {
        return api.get('/credenciales/batch-pdf', { params: { cursoId } });
    },

    /**
     * Eliminar credencial (SUPER_ADMIN)
     */
    async eliminar(credencialId: string) {
        return api.delete(`/credenciales/${credencialId}`);
    },
};
