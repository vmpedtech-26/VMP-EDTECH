'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import {
    CheckCircle2,
    XCircle,
    MessageSquare,
    User,
    BookOpen,
    Calendar,
    ArrowLeft,
    Loader2,
    Maximize2,
    Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { evidenciasApi } from '@/lib/api/evidencias';
import { Evidencia } from '@/types/training';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function EvaluarEvidenciaPage() {
    const { id } = useParams();
    const router = useRouter();
    const [evidencia, setEvidencia] = useState<Evidencia | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        const fetchEvidencia = async () => {
            try {
                const revisiones = await evidenciasApi.listarRevisiones();
                const item = revisiones.find(e => e.id === id);
                if (item) {
                    setEvidencia(item);
                } else {
                    toast.error("Evidencia no encontrada o ya procesada");
                    router.push('/dashboard/instructor/tareas');
                }
            } catch (error) {
                console.error('Error fetching evidence:', error);
                toast.error("Error al cargar la evidencia");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchEvidencia();
    }, [id, router]);

    const handleEvaluar = async (nuevoEstado: 'APROBADA' | 'RECHAZADA') => {
        if (!evidencia) return;

        setIsSubmitting(true);
        try {
            await evidenciasApi.evaluarEvidencia(evidencia.id, {
                estado: nuevoEstado,
                feedback: feedback.trim() || undefined
            });

            toast.success(nuevoEstado === 'APROBADA' ? 'Evidencia aprobada correctamente' : 'Evidencia rechazada');
            router.push('/dashboard/instructor/tareas');
            router.refresh();
        } catch (error) {
            console.error('Error evaluating evidence:', error);
            toast.error("Error al procesar la evaluación");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <Skeleton className="h-10 w-32" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-[400px] rounded-2xl" />
                    <Skeleton className="h-[400px] rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!evidencia) return null;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.back()} className="-ml-2">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al listado
                </Button>
                <div className="flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-amber-200">
                        Revisión Manual Requerida
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Evidence View (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="relative group rounded-[2.5rem] overflow-hidden bg-slate-100 border border-slate-200 shadow-2xl">
                        <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none opacity-20" />

                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={evidencia.fotoUrl}
                            alt="Evidencia del alumno"
                            className="w-full aspect-[4/3] object-contain relative z-10"
                        />

                        <div className="absolute top-6 right-6 z-20">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-2xl shadow-xl h-12 w-12 flex items-center justify-center bg-white/80 backdrop-blur-md border-white/40 border-2 hover:scale-110 transition-transform"
                                asChild
                            >
                                <a href={evidencia.fotoUrl} target="_blank" rel="noopener noreferrer">
                                    <Maximize2 className="h-5 w-5 text-slate-900" />
                                </a>
                            </Button>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent z-20">
                            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Evidencia Enviada</p>
                            <h3 className="text-white font-bold text-xl">{evidencia.tarea?.descripcion}</h3>
                        </div>
                    </div>
                </div>

                {/* Right: Info & Evaluation (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="p-8 space-y-8 border-0 shadow-2xl shadow-slate-200/50 rounded-[2.5rem]">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Alumno</p>
                                    <h2 className="text-xl font-bold text-slate-900">{evidencia.alumno?.nombre} {evidencia.alumno?.apellido}</h2>
                                </div>
                            </div>

                            <div className="space-y-4 py-6 border-y border-slate-100">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <BookOpen className="h-4 w-4" />
                                        <span>Curso</span>
                                    </div>
                                    <span className="font-bold text-slate-900">{evidencia.tarea?.modulo.curso.nombre}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Calendar className="h-4 w-4" />
                                        <span>Fecha envío</span>
                                    </div>
                                    <span className="font-bold text-slate-900">
                                        {format(new Date(evidencia.uploadedAt), "d MMM, yyyy - HH:mm", { locale: es })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {evidencia.comentario && (
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 italic relative">
                                <div className="absolute -top-3 left-6 px-2 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">Comentario Alumno</div>
                                <p className="text-slate-700 leading-relaxed">"{evidencia.comentario}"</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-black text-slate-800 uppercase tracking-widest">
                                    Evaluación Final
                                </label>
                            </div>
                            <textarea
                                className="w-full p-6 bg-slate-50 border-0 rounded-3xl focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[140px] text-slate-700 placeholder:text-slate-400"
                                placeholder="Añade un feedback constructivo para el estudiante..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                className="h-16 rounded-2xl text-red-600 hover:bg-red-50 hover:text-red-700 border-red-100 font-bold"
                                onClick={() => handleEvaluar('RECHAZADA')}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5 mr-2" />}
                                Rechazar
                            </Button>
                            <Button
                                className="h-16 rounded-2xl bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 font-bold"
                                onClick={() => handleEvaluar('APROBADA')}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                                Aprobar
                            </Button>
                        </div>
                    </Card>

                    <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 flex items-start gap-4 text-primary-dark">
                        <Info className="h-6 w-6 shrink-0 mt-0.5" />
                        <p className="text-xs leading-relaxed font-medium">
                            Tu evaluación se reflejará instantáneamente en el panel del alumno. Si rechazas, el alumno podrá volver a subir una nueva evidencia.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
