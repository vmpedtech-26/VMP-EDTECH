'use client';

import React from 'react';
import { Play } from 'lucide-react';

interface TheoriaViewerProps {
    titulo: string;
    contenidoHtml?: string;
    videoUrl?: string;
    onComplete: () => void;
}

export function TheoriaViewer({ titulo, contenidoHtml, videoUrl, onComplete }: TheoriaViewerProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {videoUrl && (
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg">
                    {/* Simple video embed placeholder - in real app use ReactPlayer or similar */}
                    <div className="w-full h-full flex flex-col items-center justify-center text-white space-y-4">
                        <Play className="h-16 w-16 text-primary animate-pulse" />
                        <p className="text-lg font-medium">Cargando video de capacitación...</p>
                        <p className="text-sm text-slate-700">{videoUrl}</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 p-8 md:p-12 shadow-sm prose prose-blue max-w-none">
                <h1 className="text-3xl font-bold text-slate-900 mb-6">{titulo}</h1>
                <div
                    dangerouslySetInnerHTML={{ __html: contenidoHtml || '<p>Cargando contenido teórico...</p>' }}
                    className="text-slate-700 leading-relaxed text-lg space-y-4"
                />
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={onComplete}
                    className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all hover:-translate-y-1 active:scale-95"
                >
                    He terminado de leer →
                </button>
            </div>
        </div>
    );
}
