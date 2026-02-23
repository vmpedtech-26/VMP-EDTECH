'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Check, X, Upload, Users, Building2, Filter } from 'lucide-react';
import Image from 'next/image';
import { api } from '@/lib/api-client';

interface Alumno {
    id: string;
    nombre: string;
    apellido: string;
    dni: string;
    email: string;
    empresaId: string;
    empresaNombre?: string;
    fotoCredencial?: {
        id: string;
        fotoUrl: string;
        estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
        comentario?: string;
        feedback?: string;
    };
}

interface Empresa {
    id: string;
    nombre: string;
}

export default function ParticipantesPage() {
    const [alumnos, setAlumnos] = useState<Alumno[]>([]);
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [selectedEmpresa, setSelectedEmpresa] = useState<string>('all');
    const [filtroEstado, setFiltroEstado] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [uploadingFor, setUploadingFor] = useState<string | null>(null);

    useEffect(() => {
        fetchEmpresas();
        fetchAlumnos();
    }, [selectedEmpresa]);

    const fetchEmpresas = async () => {
        try {
            const data = await api.get('/empresas');
            setEmpresas(data);
        } catch (error) {
            console.error('Error fetching empresas:', error);
        }
    };

    const fetchAlumnos = async () => {
        setLoading(true);
        try {
            const params: any = { rol: 'ALUMNO' };
            if (selectedEmpresa !== 'all') {
                params.empresaId = selectedEmpresa;
            }

            const data = await api.get('/users', { params });

            // Fetch fotos for each alumno
            const alumnosWithFotos = await Promise.all(
                data.map(async (alumno: Alumno) => {
                    try {
                        const foto = await api.get(`/fotos-credencial/alumno/${alumno.id}`);
                        return { ...alumno, fotoCredencial: foto };
                    } catch {
                        // No foto found
                    }
                    return alumno;
                })
            );

            setAlumnos(alumnosWithFotos);
        } catch (error) {
            console.error('Error fetching alumnos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (alumnoId: string, file: File) => {
        setUploadingFor(alumnoId);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('alumnoId', alumnoId);
            formData.append('comentario', 'Foto de credencial subida por instructor');

            await api.post('/fotos-credencial/upload', formData);
            await fetchAlumnos(); // Refresh list
            alert('Foto subida exitosamente');
        } catch (error: any) {
            console.error('Error uploading foto:', error);
            alert(`Error: ${error.message || 'No se pudo subir la foto'}`);
        } finally {
            setUploadingFor(null);
        }
    };

    const handleAprobarFoto = async (fotoId: string) => {
        try {
            await api.put(`/fotos-credencial/${fotoId}/evaluar`, {
                estado: 'APROBADA',
                feedback: 'Foto aprobada'
            });
            await fetchAlumnos();
            alert('Foto aprobada exitosamente');
        } catch (error: any) {
            console.error('Error aprobando foto:', error);
            alert(error.message || 'Error al aprobar la foto');
        }
    };

    const handleRechazarFoto = async (fotoId: string) => {
        const feedback = prompt('Motivo del rechazo:');
        if (!feedback) return;

        try {
            await api.put(`/fotos-credencial/${fotoId}/evaluar`, {
                estado: 'RECHAZADA',
                feedback
            });
            await fetchAlumnos();
            alert('Foto rechazada');
        } catch (error: any) {
            console.error('Error rechazando foto:', error);
            alert(error.message || 'Error al rechazar la foto');
        }
    };

    const alumnosFiltrados = alumnos.filter(alumno => {
        if (filtroEstado === 'all') return true;
        if (filtroEstado === 'sin-foto') return !alumno.fotoCredencial;
        if (filtroEstado === 'pendiente') return alumno.fotoCredencial?.estado === 'PENDIENTE';
        if (filtroEstado === 'aprobada') return alumno.fotoCredencial?.estado === 'APROBADA';
        if (filtroEstado === 'rechazada') return alumno.fotoCredencial?.estado === 'RECHAZADA';
        return true;
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Participantes</h1>
                <p className="text-slate-800 mt-2">Gestiona las fotos de credencial de los alumnos</p>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Filtro por empresa */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Building2 className="inline h-4 w-4 mr-1" />
                            Empresa
                        </label>
                        <select
                            value={selectedEmpresa}
                            onChange={(e) => setSelectedEmpresa(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="all">Todas las empresas</option>
                            {empresas.map(empresa => (
                                <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro por estado de foto */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Filter className="inline h-4 w-4 mr-1" />
                            Estado de Foto
                        </label>
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="all">Todos</option>
                            <option value="sin-foto">Sin foto</option>
                            <option value="pendiente">Pendiente aprobación</option>
                            <option value="aprobada">Aprobada</option>
                            <option value="rechazada">Rechazada</option>
                        </select>
                    </div>
                </div>

                <div className="text-sm text-slate-800">
                    Mostrando {alumnosFiltrados.length} de {alumnos.length} participantes
                </div>
            </div>

            {/* Lista de alumnos */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-slate-800">Cargando participantes...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {alumnosFiltrados.map(alumno => (
                        <div key={alumno.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            {/* Foto */}
                            <div className="relative h-64 bg-slate-100 flex items-center justify-center">
                                {alumno.fotoCredencial ? (
                                    <>
                                        <Image
                                            src={alumno.fotoCredencial.fotoUrl}
                                            alt={`${alumno.nombre} ${alumno.apellido}`}
                                            fill
                                            className="object-cover"
                                        />
                                        {/* Badge de estado */}
                                        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${alumno.fotoCredencial.estado === 'APROBADA'
                                            ? 'bg-green-100 text-green-800'
                                            : alumno.fotoCredencial.estado === 'RECHAZADA'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {alumno.fotoCredencial.estado}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center">
                                        <Camera className="h-16 w-16 text-slate-600 mx-auto mb-2" />
                                        <p className="text-slate-700 text-sm">Sin foto</p>
                                    </div>
                                )}
                            </div>

                            {/* Info del alumno */}
                            <div className="p-4">
                                <h3 className="font-semibold text-lg text-slate-900">
                                    {alumno.nombre} {alumno.apellido}
                                </h3>
                                <p className="text-sm text-slate-800">DNI: {alumno.dni}</p>
                                {alumno.empresaNombre && (
                                    <p className="text-sm text-slate-800">
                                        <Building2 className="inline h-3 w-3 mr-1" />
                                        {alumno.empresaNombre}
                                    </p>
                                )}

                                {/* Acciones */}
                                <div className="mt-4 space-y-2">
                                    {!alumno.fotoCredencial || alumno.fotoCredencial.estado === 'RECHAZADA' ? (
                                        <label className="block">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleFileUpload(alumno.id, file);
                                                }}
                                                disabled={uploadingFor === alumno.id}
                                            />
                                            <div className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark cursor-pointer transition-colors">
                                                <Upload className="h-4 w-4 mr-2" />
                                                {uploadingFor === alumno.id ? 'Subiendo...' : 'Subir Foto'}
                                            </div>
                                        </label>
                                    ) : alumno.fotoCredencial.estado === 'PENDIENTE' ? (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleAprobarFoto(alumno.fotoCredencial!.id)}
                                                className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                <Check className="h-4 w-4 mr-1" />
                                                Aprobar
                                            </button>
                                            <button
                                                onClick={() => handleRechazarFoto(alumno.fotoCredencial!.id)}
                                                className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Rechazar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-2 bg-green-50 text-green-700 rounded-lg">
                                            <Check className="inline h-4 w-4 mr-1" />
                                            Foto aprobada
                                        </div>
                                    )}
                                </div>

                                {alumno.fotoCredencial?.feedback && (
                                    <div className="mt-2 p-2 bg-slate-50 rounded text-xs text-slate-800">
                                        <strong>Feedback:</strong> {alumno.fotoCredencial.feedback}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && alumnosFiltrados.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <Users className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay participantes</h3>
                    <p className="text-slate-800">
                        {filtroEstado !== 'all'
                            ? 'No se encontraron participantes con los filtros seleccionados'
                            : 'No hay participantes registrados'}
                    </p>
                </div>
            )}
        </div>
    );
}
