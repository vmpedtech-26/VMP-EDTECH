import { api } from '../api-client';

export interface ItemTarifario {
    id?: string;
    codigo: string;
    concepto: string;
    unidad: string;
    cantidad: number;
    precio_unitario: number;
    importe: number;
}

export interface IndicadorHSE {
    concepto: string;
    valor: string;
}

export interface PresupuestoHSE {
    id: string;
    numero_cotizacion: string;
    cliente_nombre: string;
    cliente_cuit: string;
    recurso_nombre: string;
    recurso_cargo: string;
    recurso_matricula: string;
    fecha_desde: string;
    fecha_hasta: string;
    cantidad_jornadas: number;
    horario: string;
    lugar_prestacion: string;
    alcance_tecnico: string;
    entregables: string;
    exclusiones: string;
    condiciones_comerciales: string;
    items: ItemTarifario[];
    indicadores_hse: IndicadorHSE[];
    vigencia_oferta: string;
    subtotal: number;
    iva: number;
    total: number;
    estado: 'BORRADOR' | 'ENVIADO' | 'ACEPTADO' | 'RECHAZADO';
    fecha_emision: string;
    createdAt: string;
}

export interface PlantillaPresupuesto {
    id: string;
    nombre: string;
    descripcion?: string | null;
    items: ItemTarifario[];
    alcance_tecnico?: string | null;
    entregables?: string | null;
    exclusiones?: string | null;
    condiciones_comerciales?: string | null;
}

export const presupuestosHseApi = {
    async listar(): Promise<PresupuestoHSE[]> {
        return api.get('/presupuestos-hse');
    },

    async obtenerPlantillas(): Promise<PlantillaPresupuesto[]> {
        return api.get('/presupuestos-hse/plantillas');
    },

    async obtener(id: string): Promise<PresupuestoHSE> {
        return api.get(`/presupuestos-hse/${id}`);
    },

    async crear(data: Partial<PresupuestoHSE>): Promise<PresupuestoHSE> {
        return api.post('/presupuestos-hse', data);
    },

    async actualizar(id: string, data: Partial<PresupuestoHSE>): Promise<PresupuestoHSE> {
        return api.put(`/presupuestos-hse/${id}`, data);
    },

    async eliminar(id: string): Promise<{ message: string }> {
        return api.delete(`/presupuestos-hse/${id}`);
    },

    async duplicar(id: string): Promise<PresupuestoHSE> {
        return api.post(`/presupuestos-hse/${id}/duplicar`, {});
    },

    async generarPdf(id: string): Promise<Blob> {
        const token = typeof window !== 'undefined' ? localStorage.getItem('vmp_token') : null;
        const envUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vmp-edtech-6wgw.onrender.com';
        const API_URL = (envUrl.includes('railway') || envUrl.includes('api.vmp-edtech.com'))
            ? 'https://vmp-edtech-6wgw.onrender.com'
            : envUrl;
            
        const res = await fetch(`${API_URL}/api/presupuestos-hse/${id}/generar-pdf`, {
            method: 'POST',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
        });
        if (!res.ok) throw new Error('Error generando PDF');
        return res.blob();
    },

    async iaCompletar(prompt: string): Promise<Partial<PresupuestoHSE>> {
        return api.post('/presupuestos-hse/ia/completar', { texto: prompt });
    },
    async iaRedactarAlcance(prompt: string): Promise<{ alcance_tecnico: string; entregables: string; exclusiones: string; condiciones_comerciales: string }> {
        return api.post('/presupuestos-hse/ia/redactar-alcance', { texto: prompt });
    },
    async iaSugerirTarifas(prompt: string): Promise<{ items: ItemTarifario[] }> {
        return api.post('/presupuestos-hse/ia/sugerir-tarifas', { texto: prompt });
    }
};
