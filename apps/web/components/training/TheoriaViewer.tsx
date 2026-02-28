import React from 'react';
import { Play, Video, ExternalLink, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cursosApi } from '@/lib/api/cursos';
import { toast } from 'sonner';

interface TheoriaViewerProps {
    cursoId?: string;
    moduloId?: string;
    titulo: string;
    contenidoHtml?: string;
    videoUrl?: string;
    liveClassUrl?: string;
    onComplete: () => void;
}

export function TheoriaViewer({ cursoId, moduloId, titulo, contenidoHtml, videoUrl, liveClassUrl, onComplete }: TheoriaViewerProps) {
    const [isCheckingIn, setIsCheckingIn] = React.useState(false);
    const [hasCheckedIn, setHasCheckedIn] = React.useState(false);

    const handleCheckIn = async () => {
        if (!cursoId || !moduloId) return;
        setIsCheckingIn(true);
        try {
            await cursosApi.registrarAsistencia(cursoId, moduloId);
            setHasCheckedIn(true);
            toast.success("Asistencia registrada correctamente");
        } catch (error) {
            console.error("Error check-in:", error);
            toast.error("Error al registrar asistencia");
        } finally {
            setIsCheckingIn(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {liveClassUrl && (
                <div className="bg-gradient-to-r from-[#0A192F] to-[#112240] rounded-2xl p-8 border border-white/10 shadow-xl overflow-hidden relative group">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors" />

                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                        <div className="w-20 h-20 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                            <div className="relative">
                                <Video className="h-10 w-10 text-primary" />
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl font-bold text-white mb-2">Clase en Vivo Iniciada</h2>
                            <p className="text-gray-400 max-w-md">
                                Un instructor está esperando en la sala virtual. Unite para participar de la capacitación interactiva.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 w-full md:w-auto">
                            <a
                                href={liveClassUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                            >
                                Unirse a la Clase
                                <ExternalLink className="h-5 w-5" />
                            </a>

                            <Button
                                onClick={handleCheckIn}
                                disabled={isCheckingIn || hasCheckedIn}
                                variant="outline"
                                className={hasCheckedIn
                                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                                    : "text-white border-white/20 hover:bg-white/10"}
                            >
                                {isCheckingIn ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> :
                                    hasCheckedIn ? <CheckCircle2 className="h-4 w-4 mr-2" /> : null}
                                {hasCheckedIn ? "Asistencia Registrada" : "Presente en Clase"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
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
