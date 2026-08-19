import { api } from '../api-client';

export interface Empresa {
    id: string;
    nombre: string;
    cuit: string;
    direccion?: string;
    telefono?: string;
    email: string;
    activa: boolean;
    createdAt: string;

    // SSO corporativo (Azure AD / Entra ID)
    ssoActive?: boolean;
    ssoDomain?: string | null;
    ssoProvider?: string | null;
    ssoClientId?: string | null;
    ssoTenantId?: string | null;
    ssoClientSecret?: string | null; // solo de escritura: para guardar uno nuevo
    ssoClientSecretSet?: boolean; // informa si ya hay uno guardado, sin revelarlo
}

export const empresasApi = {
    /**
     * Listar todas las empresas (Solo SUPER_ADMIN)
     */
    async listarEmpresas(): Promise<Empresa[]> {
        return api.get('/empresas');
    },

    /**
     * Obtener detalle de una empresa
     */
    async obtenerEmpresa(id: string): Promise<Empresa> {
        return api.get(`/empresas/${id}`);
    },

    /**
     * Crear una nueva empresa
     */
    async crearEmpresa(data: Partial<Empresa>): Promise<Empresa> {
        return api.post('/empresas', data);
    },

    /**
     * Actualizar una empresa
     */
    async actualizarEmpresa(id: string, data: Partial<Empresa>): Promise<Empresa> {
        return api.put(`/empresas/${id}`, data);
    },

    /**
     * Eliminar o desactivar una empresa
     */
    async eliminarEmpresa(id: string): Promise<{ message: string }> {
        return api.delete(`/empresas/${id}`);
    },
};
