import { api } from '../api-client';

export interface Obd2Session {
    id: string;
    inscripcionId: string;
    fecha: string;
    fuerzaFrenado: number | null;
    aceleracion: number | null;
    curvasScore: number | null;
    esquivoAlce: boolean | null;
}

export const obd2Api = {
    async obtenerMetricas(inscripcionId: string): Promise<Obd2Session[]> {
        return api.get(`/obd2/metrics/${inscripcionId}`);
    },
};
