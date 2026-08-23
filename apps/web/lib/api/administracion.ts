import { api } from '../api-client';

export interface CatalogItem {
    id: string;
    nombre: string;
}

export interface Puesto extends CatalogItem {
    sector?: { nombre: string } | null;
}

export interface Localidad extends CatalogItem {
    provincia?: string | null;
}

export interface Appearance {
    nombre: string;
    brandTag: string;
    tagline: string;
    tema: string;
    colorPrimario: string;
}

export interface PreguntaBanco {
    id: string;
    pregunta: string;
    opciones: string[];
    respuestaCorrecta: number;
    area?: string | null;
    dificultad: string;
}

export interface PlantillaEvaluacion {
    id: string;
    nombre: string;
    descripcion?: string | null;
    tiempoLimite?: number | null;
    notaMinima: number;
}

export const administracionApi = {
    // Sectores
    async listarSectores(): Promise<CatalogItem[]> {
        const res = await api.get('/administration/sectors');
        return res.items || [];
    },
    async crearSector(nombre: string) {
        return api.post('/administration/sectors', { nombre });
    },
    async eliminarSector(id: string) {
        return api.delete(`/administration/sectors/${id}`);
    },

    // Puestos
    async listarPuestos(): Promise<Puesto[]> {
        const res = await api.get('/administration/job-positions');
        return res.items || [];
    },
    async crearPuesto(nombre: string, sectorId?: string) {
        return api.post('/administration/job-positions', { nombre, sectorId: sectorId || undefined });
    },
    async eliminarPuesto(id: string) {
        return api.delete(`/administration/job-positions/${id}`);
    },

    // Localidades
    async listarLocalidades(): Promise<Localidad[]> {
        const res = await api.get('/administration/service-locations');
        return res.items || [];
    },
    async crearLocalidad(nombre: string, provincia?: string) {
        return api.post('/administration/service-locations', { nombre, provincia: provincia || undefined });
    },
    async eliminarLocalidad(id: string) {
        return api.delete(`/administration/service-locations/${id}`);
    },

    // Áreas operativas
    async listarAreas(): Promise<CatalogItem[]> {
        const res = await api.get('/administration/operational-areas');
        return res.items || [];
    },
    async crearArea(nombre: string) {
        return api.post('/administration/operational-areas', { nombre });
    },
    async eliminarArea(id: string) {
        return api.delete(`/administration/operational-areas/${id}`);
    },

    // Apariencia / branding
    async obtenerApariencia(): Promise<Appearance> {
        return api.get('/administration/appearance');
    },
    async actualizarApariencia(data: Partial<Appearance>) {
        return api.patch('/administration/appearance', data);
    },

    // Banco de preguntas
    async listarPreguntas(): Promise<PreguntaBanco[]> {
        const res = await api.get('/banco-preguntas');
        return res.items || [];
    },
    async crearPregunta(data: { pregunta: string; opciones: string[]; respuestaCorrecta: number; area?: string; dificultad: string }) {
        return api.post('/banco-preguntas', data);
    },
    async eliminarPregunta(id: string) {
        return api.delete(`/banco-preguntas/${id}`);
    },

    // Plantillas de evaluación
    async listarPlantillas(): Promise<PlantillaEvaluacion[]> {
        const res = await api.get('/plantillas-evaluacion');
        return res.items || [];
    },
    async crearPlantilla(data: { nombre: string; descripcion?: string; preguntas: any[]; tiempoLimite?: number; notaMinima: number }) {
        return api.post('/plantillas-evaluacion', data);
    },
    async eliminarPlantilla(id: string) {
        return api.delete(`/plantillas-evaluacion/${id}`);
    },
};
