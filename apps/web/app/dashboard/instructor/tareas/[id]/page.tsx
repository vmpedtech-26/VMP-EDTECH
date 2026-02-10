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
    Maximize2
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
        <div className="max-w-5xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al listado
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Evidence Image */}
                <div className="space-y-4">
                    <div className="relative aspect-[3/4] md:aspect-square bg-slate-100 rounded-3xl overflow-hidden border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={evidencia.fotoUrl}
                            alt="Evidencia del alumno"
                            className="w-full h-full object-contain"
                        />
                        <div className="absolute top-4 right-4">
                            <Button variant="outline" size="sm" className="rounded-full shadow-lg h-10 w-10 flex items-center justify-center bg-white" asChild>
                                <a href={evidencia.fotoUrl} target="_blank" rel="noopener noreferrer">
                                    <Maximize2 className="h-4 w-4" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right: Info & Actions */}
                <div className="space-y-6">
                    <Card className="p-6 space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full uppercase">
                                    Revisión Pendiente
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {evidencia.tarea?.descripcion}
                            </h1>
                            <p className="text-slate-700 mt-1">
                                {evidencia.tarea?.modulo.curso.nombre} • {evidencia.tarea?.modulo.titulo}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-100">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <User className="h-4 w-4" />
                                    <span>Alumno</span>
                                </div>
                                <p className="font-bold text-slate-900">{evidencia.alumno?.nombre} {evidencia.alumno?.apellido}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <Calendar className="h-4 w-4" />
                                    <span>Enviado</span>
                                </div>
                                <p className="font-bold text-slate-900">
                                    {format(new Date(evidencia.uploadedAt), "d 'de' MMMM, yyyy", { locale: es })}
                                </p>
                            </div>
                        </div>

                        {evidencia.comentario && (
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <div className="flex items-center gap-2 text-primary mb-2 text-sm font-bold">
                                    <MessageSquare className="h-4 w-4" />
                                    Comentario del alumno:
                                </div>
                                <p className="text-slate-700 italic">"{evidencia.comentario}"</p>
                            </div>
                        )}

                        <div className="space-y-4 pt-4">
                            <label className="block text-sm font-bold text-slate-700">
                                Feedback para el alumno (Opcional)
                            </label>
                            <textarea
                                className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all min-h-[120px]"
                                placeholder="Escribe aquí tus observaciones, correcciones o felicitaciones..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <Button
                                variant="outline"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-100"
                                onClick={() => handleEvaluar('RECHAZADA')}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                                Rechazar
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleEvaluar('APROBADA')}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                                Aprobar Tarea
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
