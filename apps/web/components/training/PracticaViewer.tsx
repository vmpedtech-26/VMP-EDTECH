'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Camera, Upload, CheckCircle2, FileText, Loader2, Info, Clock, AlertCircle, MessageSquare } from 'lucide-react';
import { TareaPractica, Evidencia } from '@/types/training';
import { evidenciasApi } from '@/lib/api/evidencias';

interface PracticaViewerProps {
    tareas: TareaPractica[];
    onComplete: () => Promise<void>;
}

export function PracticaViewer({ tareas, onComplete }: PracticaViewerProps) {
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [evidencias, setEvidencias] = useState<Record<string, Evidencia>>({});
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const fetchInitialEvidencias = async () => {
            try {
                // Fetch evidences for each task
                const results = await Promise.all(
                    tareas.map(t => evidenciasApi.obtenerEvidencias(t.id))
                );

                const newEvidencias: Record<string, Evidencia> = {};
                tareas.forEach((t, i) => {
                    if (results[i] && results[i].length > 0) {
                        newEvidencias[t.id] = results[i][0]; // Take most recent
                    }
                });
                setEvidencias(newEvidencias);
            } catch (error) {
                console.error('Error fetching initial evidences:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialEvidencias();
    }, [tareas]);

    const handleFileChange = async (tareaId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading({ ...uploading, [tareaId]: true });
        try {
            const res = await evidenciasApi.uploadEvidencia(file, tareaId);
            if (res.success) {
                setEvidencias({ ...evidencias, [tareaId]: res.evidencia });
            }
        } catch (error) {
            console.error('Error uploading evidence:', error);
            alert('Error al subir la evidencia');
        } finally {
            setUploading({ ...uploading, [tareaId]: false });
        }
    };

    const isAllApproved = tareas.every(t => evidencias[t.id]?.estado === 'APROBADA');
    const isAllUploaded = tareas.every(t => evidencias[t.id]);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await onComplete();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto space-y-4">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-8 flex items-start gap-6 text-blue-900 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Info className="h-24 w-24" />
                </div>
                <div className="bg-white rounded-2xl p-3 shadow-inner shrink-0">
                    <Info className="h-6 w-6 text-blue-600" />
                </div>
                <div className="relative z-10">
                    <h3 className="font-bold text-xl mb-2">Instrucciones Prácticas</h3>
                    <p className="text-sm leading-relaxed text-blue-800/80">
                        Para aprobar este módulo, debés completar cada una de las actividades listadas abajo.
                        Subí las fotos requeridas como evidencia para que un instructor pueda revisarlas y aprobar tu progreso.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {tareas.map((tarea, idx) => {
                    const evidencia = evidencias[tarea.id];
                    const estaAprobada = evidencia?.estado === 'APROBADA';
                    const estaRechazada = evidencia?.estado === 'RECHAZADA';
                    const estaPendiente = evidencia?.estado === 'PENDIENTE';

                    return (
                        <Card key={tarea.id} className={`group relative overflow-hidden transition-all duration-300 border-0 shadow-lg ${estaAprobada ? 'ring-2 ring-green-500/20' : 'ring-1 ring-slate-200'}`}>
                            {estaAprobada && (
                                <div className="absolute top-0 right-0 p-4 z-20">
                                    <div className="bg-green-500 text-white rounded-full p-1 shadow-lg transform scale-110">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row gap-8 items-center p-8 bg-white relative z-10">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500">
                                            {idx + 1}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Tarea del Curso</div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 leading-tight">{tarea.descripcion}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                        <Camera className="h-4 w-4" />
                                        {tarea.requiereFoto ? 'Requiere fotografía de comprobación' : 'Requiere validación de tarea'}
                                    </div>
                                </div>

                                <div className="shrink-0">
                                    {evidencia ? (
                                        <div className="flex flex-col items-center min-w-[140px]">
                                            {estaPendiente && (
                                                <div className="flex flex-col items-center animate-in zoom-in duration-300">
                                                    <div className="bg-warning/10 rounded-3xl p-5 mb-3 border border-warning/20">
                                                        <Clock className="h-10 w-10 text-warning animate-pulse" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-warning uppercase tracking-widest">En Revisión</span>
                                                </div>
                                            )}
                                            {estaAprobada && (
                                                <div className="flex flex-col items-center animate-in zoom-in duration-300">
                                                    <div className="bg-green-50 rounded-3xl p-5 mb-3 border border-green-100">
                                                        <CheckCircle2 className="h-10 w-10 text-green-500" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Completada</span>
                                                </div>
                                            )}
                                            {estaRechazada && (
                                                <div className="relative group/upload">
                                                    <input
                                                        type="file"
                                                        id={`file-${tarea.id}`}
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileChange(tarea.id, e)}
                                                        disabled={uploading[tarea.id]}
                                                    />
                                                    <label
                                                        htmlFor={`file-${tarea.id}`}
                                                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-red-200 rounded-[2.5rem] bg-red-50/30 hover:bg-red-50 hover:border-red-400 transition-all text-red-500 cursor-pointer group-hover/upload:scale-105"
                                                    >
                                                        <Upload className="h-8 w-8 mb-2" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Reintentar</span>
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="relative group/upload">
                                            <input
                                                type="file"
                                                id={`file-${tarea.id}`}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(tarea.id, e)}
                                                disabled={uploading[tarea.id]}
                                            />
                                            <label
                                                htmlFor={`file-${tarea.id}`}
                                                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] hover:border-primary hover:bg-primary/5 transition-all text-slate-400 hover:text-primary min-w-[140px] cursor-pointer group-hover/upload:scale-105 active:scale-95"
                                            >
                                                {uploading[tarea.id] ? (
                                                    <Loader2 className="h-10 w-10 animate-spin" />
                                                ) : (
                                                    <Camera className="h-10 w-10 mb-2" />
                                                )}
                                                <span className="text-[10px] font-black uppercase tracking-widest mt-1">
                                                    {uploading[tarea.id] ? 'Subiendo' : 'Subir Foto'}
                                                </span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {(estaRechazada || (estaAprobada && evidencia.feedback)) && (
                                <div className="px-8 pb-8 mt-[-8px] relative z-10 animate-in slide-in-from-top-2 duration-500">
                                    <div className={`p-5 rounded-[2rem] flex gap-4 border ${estaRechazada ? 'bg-red-50 text-red-900 border-red-100' : 'bg-green-50/50 text-green-900 border-green-100'}`}>
                                        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${estaRechazada ? 'bg-red-100' : 'bg-green-100'}`}>
                                            {estaRechazada ? <AlertCircle className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm mb-1">{estaRechazada ? 'Revisión: Tarea Rechazada' : 'Comentario del Instructor'}</p>
                                            <p className="text-sm opacity-80 leading-relaxed italic">
                                                "{evidencia.feedback || 'Tu evidencia fue revisada pero requiere cambios. Por favor, revisá las instrucciones y volvé a subirla.'}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            <div className="flex justify-center pt-10">
                <Button
                    size="lg"
                    disabled={!isAllApproved || submitting}
                    onClick={handleSubmit}
                    className="min-w-[300px] h-16 text-lg rounded-[2rem] shadow-2xl shadow-primary/30 transform hover:-translate-y-1 active:translate-y-0 transition-all font-black"
                >
                    {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> :
                        !isAllUploaded ? 'Completá todas las actividades' :
                            !isAllApproved ? 'Esperando aprobación médica/técnica...' :
                                '¡Módulo Completado! →'}
                </Button>
            </div>
        </div>
    );
}
