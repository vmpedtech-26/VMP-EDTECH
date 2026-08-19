import { api, API_URL } from '../api-client';

export interface SsoCheckResponse {
    sso_active: boolean;
    domain?: string;
    provider?: string;
    empresa_nombre?: string;
}

export const ssoApi = {
    /**
     * Verifica si el dominio del email tiene SSO corporativo activo.
     */
    async check(email: string): Promise<SsoCheckResponse> {
        return api.post('/auth/sso/check', { email });
    },

    /**
     * URL que arranca el flujo de SSO (navegación de página completa, no fetch):
     * redirige al backend, que a su vez redirige a Azure AD.
     */
    loginUrl(domain: string): string {
        return `${API_URL}/api/auth/sso/login?domain=${encodeURIComponent(domain)}`;
    },

    /**
     * Completa el login: canjea el code+state recibidos de Azure AD por una sesión propia.
     */
    async completeCallback(code: string, state: string): Promise<{ access_token: string; token_type: string; user: any }> {
        return api.post('/auth/sso/callback', { code, state });
    },
};
