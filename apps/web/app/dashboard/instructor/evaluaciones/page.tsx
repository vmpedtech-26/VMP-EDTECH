'use client';

import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Eye, CheckCircle, XCircle, Clock, Filter, Search } from 'lucide-react';
import { api } from '@/lib/api-client';

interface Examen {
    id: string;
    moduloId: string;
    alumnoId: string;
    puntaje: number | null;
    aprobado: boolean | null;
    estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADO';
    createdAt: string;
    completedAt: string | null;
    alumno: {
        nombre: string;
        apellido: string;
        dni: string;
        email: string;
    };
    modulo: {
        nombre: string;
        curso: {
            nombre: string;
        };
    };
}

export default function EvaluacionesPage() {
    const [examenes, setExamenes] = useState<Examen[]>([]);
    const [filtroEstado, setFiltroEstado] = useState<string>('COMPLETADO');
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExamenes();
    }, [filtroEstado]);

    const fetchExamenes = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (filtroEstado !== 'all') {
                params.estado = filtroEstado;
            }

            const data = await api.get('/examenes', { params });
            setExamenes(data);
        } catch (error) {
            console.error('Error fetching examenes:', error);
        } finally {
            setLoading(false);
        }
    };

    const examenesFiltrados = examenes.filter(examen => {
        if (!busqueda) return true;
        const searchLower = busqueda.toLowerCase();
        return (
            examen.alumno.nombre.toLowerCase().includes(searchLower) ||
            examen.alumno.apellido.toLowerCase().includes(searchLower) ||
            examen.alumno.dni.includes(searchLower) ||
            examen.modulo.nombre.toLowerCase().includes(searchLower) ||
            examen.modulo.curso.nombre.toLowerCase().includes(searchLower)
        );
    });

    const getEstadoBadge = (estado: string) => {
        const badges = {
            'PENDIENTE': { color: 'bg-slate-100 text-slate-800', icon: Clock },
            'EN_PROGRESO': { color: 'bg-blue-100 text-blue-800', icon: Clock },
            'COMPLETADO': { color: 'bg-green-100 text-green-800', icon: CheckCircle }
        };
        const badge = badges[estado as keyof typeof badges] || badges.PENDIENTE;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                <Icon className="h-3 w-3 mr-1" />
                {estado}
            </span>
        );
    };

    const getAprobadoBadge = (aprobado: boolean | null) => {
        if (aprobado === null) return null;
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
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Evaluaciones</h1>
                <p className="text-slate-800 mt-2">Revisa y gestiona las evaluaciones de los participantes</p>
            </div>

            {/* Filtros y búsqueda */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Búsqueda */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
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

                    {/* Filtro por estado */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Filter className="inline h-4 w-4 mr-1" />
                            Estado
                        </label>
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="all">Todos</option>
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="EN_PROGRESO">En Progreso</option>
                            <option value="COMPLETADO">Completado</option>
                        </select>
                    </div>
                </div>

                <div className="text-sm text-slate-800">
                    Mostrando {examenesFiltrados.length} de {examenes.length} evaluaciones
                </div>
            </div>

            {/* Lista de evaluaciones */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-slate-800">Cargando evaluaciones...</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                                    Alumno
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                                    Curso / Módulo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                                    Puntaje
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                                    Resultado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {examenesFiltrados.map((examen) => (
                                <tr key={examen.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-medium text-slate-900">
                                                {examen.alumno.nombre} {examen.alumno.apellido}
                                            </div>
                                            <div className="text-sm text-slate-700">
                                                DNI: {examen.alumno.dni}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-medium text-slate-900">
                                                {examen.modulo.curso.nombre}
                                            </div>
                                            <div className="text-sm text-slate-700">
                                                {examen.modulo.nombre}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {examen.puntaje !== null ? (
                                            <span className={`text-lg font-bold ${examen.aprobado ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {examen.puntaje}
                                            </span>
                                        ) : (
                                            <span className="text-slate-600">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getEstadoBadge(examen.estado)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getAprobadoBadge(examen.aprobado)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                        {examen.completedAt
                                            ? new Date(examen.completedAt).toLocaleDateString('es-AR')
                                            : new Date(examen.createdAt).toLocaleDateString('es-AR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            className="text-primary hover:text-primary-dark inline-flex items-center"
                                            onClick={() => {
                                                // TODO: Navigate to exam detail
                                                console.log('Ver examen:', examen.id);
                                            }}
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
                            <ClipboardCheck className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay evaluaciones</h3>
                            <p className="text-slate-800">
                                {busqueda || filtroEstado !== 'all'
                                    ? 'No se encontraron evaluaciones con los filtros seleccionados'
                                    : 'No hay evaluaciones registradas'}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
