'use client';

import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Search, Download, ClipboardCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { examenesApi, ExamenDetalle } from '@/lib/api/examenes';

interface Examen {
    id: string;
    alumnoId: string;
    cursoId: string;
    calificacion: number | null;
    aprobado: boolean | null;
    realizadoAt: string;
    alumno: {
        nombre: string;
        apellido: string;
        dni: string;
        email: string;
    };
    curso: {
        nombre: string;
        codigo: string;
    };
}

import { api } from '@/lib/api-client';
import { toast } from 'sonner';

export default function EvaluacionesPage() {
    const [examenes, setExamenes] = useState<Examen[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(true);
    const [detalle, setDetalle] = useState<ExamenDetalle | null>(null);
    const [loadingDetalle, setLoadingDetalle] = useState(false);

    const handleVerDetalle = async (examenId: string) => {
        setLoadingDetalle(true);
        try {
            const data = await examenesApi.obtenerDetalle(examenId);
            setDetalle(data);
        } catch (error) {
            console.error('Error fetching detalle examen:', error);
            toast.error('No se pudo cargar el detalle del examen.');
        } finally {
            setLoadingDetalle(false);
        }
    };

    useEffect(() => {
        fetchExamenes();
    }, []);

    const fetchExamenes = async () => {
        setLoading(true);
        try {
            const data = await api.get('/examenes/all');
            setExamenes(data || []);
        } catch (error) {
            console.error('Error fetching examenes:', error);
            toast.error('No se pudieron cargar las evaluaciones. Verificá tu conexión.');
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (!examenesFiltrados.length) return;
        const headers = ['Alumno', 'DNI', 'Email', 'Curso', 'Codigo Curso', 'Calificacion', 'Resultado', 'Fecha'];
        const rows = examenesFiltrados.map(e => [
            `"${e.alumno.nombre} ${e.alumno.apellido}"`,
            `"${e.alumno.dni}"`,
            `"${e.alumno.email}"`,
            `"${e.curso.nombre}"`,
            `"${e.curso.codigo}"`,
            e.calificacion !== null ? `${e.calificacion.toFixed(1)}%` : 'N/A',
            e.aprobado ? 'Aprobado' : 'Desaprobado',
            new Date(e.realizadoAt).toLocaleDateString('es-AR')
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `reporte_evaluaciones_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const examenesFiltrados = examenes.filter(examen => {
        if (!busqueda) return true;
        const searchLower = busqueda.toLowerCase();
        return (
            examen.alumno.nombre.toLowerCase().includes(searchLower) ||
            examen.alumno.apellido.toLowerCase().includes(searchLower) ||
            examen.alumno.dni.includes(searchLower) ||
            examen.curso.nombre.toLowerCase().includes(searchLower)
        );
    });

    const getAprobadoBadge = (aprobado: boolean | null) => {
        if (aprobado === null) return <span className="text-gray-400">N/A</span>;
        return aprobado ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Aprobado
            </span>
        ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                <XCircle className="h-3 w-3 mr-1" />
                Desaprobado
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Evaluaciones</h1>
                    <p className="text-gray-600 mt-2">Revisa y gestiona las evaluaciones de los participantes</p>
                </div>
                <Button
                    onClick={exportToCSV}
                    disabled={examenesFiltrados.length === 0}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <Download className="h-4 w-4" /> Exportar CSV
                </Button>
            </div>

            {/* Filtros y búsqueda */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Search className="inline h-4 w-4 mr-1" />
                        Buscar
                    </label>
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por nombre, DNI, curso..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>
                <div className="text-sm text-gray-600">
                    Mostrando {examenesFiltrados.length} de {examenes.length} evaluaciones
                </div>
            </div>

            {/* Lista de evaluaciones */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando evaluaciones...</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Alumno
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Curso / Módulo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Puntaje
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Resultado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {examenesFiltrados.map((examen) => (
                                <tr key={examen.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-medium text-gray-900">
                                                {examen.alumno.nombre} {examen.alumno.apellido}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                DNI: {examen.alumno.dni}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-medium text-gray-900">
                                                {examen.curso.nombre}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {examen.curso.codigo}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {examen.calificacion !== null && examen.calificacion !== undefined ? (
                                            <span className={`text-lg font-bold ${examen.aprobado ? 'text-green-600' : 'text-red-600'}`}>
                                                {examen.calificacion.toFixed(0)}%
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getAprobadoBadge(examen.aprobado)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(examen.realizadoAt).toLocaleDateString('es-AR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            className="text-primary hover:text-primary-dark inline-flex items-center disabled:opacity-50"
                                            onClick={() => handleVerDetalle(examen.id)}
                                            disabled={loadingDetalle}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            Ver Detalle
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {examenesFiltrados.length === 0 && (
                        <div className="text-center py-12">
                            <ClipboardCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay evaluaciones</h3>
                            <p className="text-gray-600">
                                {busqueda
                                    ? 'No se encontraron evaluaciones con los filtros seleccionados'
                                    : 'No hay evaluaciones registradas'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {detalle && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setDetalle(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {detalle.alumno.nombre} {detalle.alumno.apellido}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {detalle.curso.nombre} · {detalle.curso.codigo} · DNI {detalle.alumno.dni}
                                </p>
                            </div>
                            <button onClick={() => setDetalle(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className={`p-4 rounded-xl border flex items-center justify-between ${detalle.aprobado ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <span className={`font-bold text-lg ${detalle.aprobado ? 'text-green-700' : 'text-red-700'}`}>
                                    {detalle.calificacion?.toFixed(0) ?? '-'}%
                                </span>
                                <span className={`text-sm font-semibold ${detalle.aprobado ? 'text-green-700' : 'text-red-700'}`}>
                                    {detalle.aprobado ? 'Aprobado' : 'Desaprobado'}
                                </span>
                            </div>

                            {detalle.preguntas.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-6">
                                    No hay preguntas registradas para este examen (el módulo pudo haber sido eliminado o modificado).
                                </p>
                            ) : (
                                detalle.preguntas.map((p, i) => (
                                    <div key={p.preguntaId} className={`p-4 rounded-xl border-l-4 ${p.correcta ? 'border-l-green-500 bg-green-50/50' : 'border-l-red-500 bg-red-50/50'}`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="font-semibold text-gray-900">{i + 1}. {p.pregunta}</p>
                                            {p.correcta ? (
                                                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                                            )}
                                        </div>
                                        {!p.correcta && (
                                            <div className="text-sm mt-2 space-y-1">
                                                <p className="text-red-600">
                                                    Respuesta del alumno: {p.respuestaElegida >= 0 ? p.opciones[p.respuestaElegida] : 'Sin responder'}
                                                </p>
                                                <p className="text-green-600">
                                                    Respuesta correcta: {p.opciones[p.respuestaCorrecta]}
                                                </p>
                                            </div>
                                        )}
                                        {p.explicacion && (
                                            <p className="text-sm text-gray-600 bg-white/60 p-2 rounded mt-2">
                                                💡 {p.explicacion}
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
