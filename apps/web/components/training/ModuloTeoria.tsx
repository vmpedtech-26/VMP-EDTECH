'use client';

import { useState } from 'react';
import { Modulo } from '@/types/training';
import { Button } from '@/components/ui/Button';
import { inscripcionesApi } from '@/lib/api/inscripciones';
import { CheckCircle } from 'lucide-react';
import { LiveClassHub } from '@/components/dashboard/LiveClassHub';

interface ModuloTeoriaProps {
    modulo: Modulo;
    cursoId: string;
    onCompletar: () => void;
}

/** YouTube/Vimeo necesitan un iframe embebido, no sirven como src de <video>. */
function getEmbedUrl(url: string): string | null {
    try {
        const u = new URL(url);
        if (u.hostname.includes('youtube.com')) {
            if (u.pathname.startsWith('/embed/')) return url;
            const videoId = u.searchParams.get('v');
            return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
        }
        if (u.hostname === 'youtu.be') {
            const videoId = u.pathname.slice(1);
            return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
        }
        if (u.hostname.includes('vimeo.com')) {
            const videoId = u.pathname.split('/').filter(Boolean).pop();
            return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
        }
    } catch {
        return null;
    }
    return null;
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
                <h2 className="text-2xl font-bold text-gray-900">{modulo.titulo}</h2>
                <div className="flex items-center space-x-2 mt-2 text-sm text-gray-600">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                        Módulo Teórico
                    </span>
                </div>
            </div>

            {/* Clase en vivo (Meet / Teams / Zoom) */}
            {modulo.liveClassUrl && (
                <LiveClassHub
                    platform={modulo.liveClassPlatform || null}
                    url={modulo.liveClassUrl}
                    date={modulo.liveClassDate}
                    courseName={modulo.titulo}
                />
            )}

            {/* Video (si existe) */}
            {modulo.videoUrl && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    {getEmbedUrl(modulo.videoUrl) ? (
                        <iframe
                            src={getEmbedUrl(modulo.videoUrl)!}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <video
                            src={modulo.videoUrl}
                            controls
                            className="w-full h-full"
                        />
                    )}
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
