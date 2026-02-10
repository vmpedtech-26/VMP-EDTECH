'use client';

import { useState } from 'react';
import { Modulo } from '@/types/training';
import { Button } from '@/components/ui/Button';
import { inscripcionesApi } from '@/lib/api/inscripciones';
import { CheckCircle } from 'lucide-react';

interface ModuloTeoriaProps {
    modulo: Modulo;
    cursoId: string;
    onCompletar: () => void;
}

export function ModuloTeoria({ modulo, cursoId, onCompletar }: ModuloTeoriaProps) {
    const [loading, setLoading] = useState(false);

    const handleCompletar = async () => {
        setLoading(true);
        try {
            await inscripcionesApi.completarModulo(cursoId, modulo.id);
            onCompletar();
        } catch (error) {
            console.error('Error al completar módulo:', error);
            alert('Error al completar el módulo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-900">{modulo.titulo}</h2>
                <div className="flex items-center space-x-2 mt-2 text-sm text-slate-800">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                        Módulo Teórico
                    </span>
                </div>
            </div>

            {/* Live Class Alert */}
            {modulo.liveClassUrl && modulo.liveClassDate && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900 mb-1">
                                Clase en Vivo Programada
                            </h3>
                            <p className="text-slate-700 mb-3">
                                {new Date(modulo.liveClassDate).toLocaleString('es-AR', {
                                    dateStyle: 'full',
                                    timeStyle: 'short'
                                })}
                            </p>
                            <div className="flex items-center space-x-3">
                                <Button
                                    onClick={() => window.open(modulo.liveClassUrl, '_blank')}
                                    size="sm"
                                >
                                    {modulo.liveClassPlatform === 'google_meet' ? (
                                        <>🎥 Unirse a Google Meet</>
                                    ) : (
                                        <>👥 Unirse a Teams</>
                                    )}
                                </Button>
                                <span className="text-sm text-slate-800">
                                    {modulo.liveClassPlatform === 'google_meet' ? 'Google Meet' : 'Microsoft Teams'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Video (si existe) */}
            {modulo.videoUrl && (
                <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                    <video
                        src={modulo.videoUrl}
                        controls
                        className="w-full h-full"
                    />
                </div>
            )}

            {/* Contenido HTML */}
            {modulo.contenidoHtml && (
                <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: modulo.contenidoHtml }}
                />
            )}

            {/* Botón Completar */}
            <div className="flex justify-end pt-6 border-t">
                <Button
                    onClick={handleCompletar}
                    disabled={loading}
                    size="lg"
                >
                    {loading ? (
                        <>Guardando...</>
                    ) : (
                        <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Completar y Continuar
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
