'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Camera, Upload, CheckCircle2, FileText, Loader2, Info, Clock, AlertCircle } from 'lucide-react';
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

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4 text-blue-800">
                <Info className="h-6 w-6 shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-bold text-lg mb-1">Módulo Práctico</h3>
                    <p className="text-sm leading-relaxed opacity-90">
                        Para completar este módulo, debes realizar las siguientes tareas y subir una fotografía como evidencia de cumplimiento. Estas evidencias serán revisadas por un supervisor.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {tareas.map((tarea, idx) => (
                    <Card key={tarea.id} className="relative overflow-hidden border-0 shadow-md ring-1 ring-gray-100">
                        {uploaded[tarea.id] && (
                            <div className="absolute top-0 right-0 p-4">
                                <CheckCircle2 className="h-6 w-6 text-success" />
                            </div>
                        )}
                        <div className="flex flex-col md:flex-row gap-6 items-center p-6 bg-white">
                            <div className="flex-1 space-y-2">
                                <div className="text-xs font-bold text-slate-600 uppercase tracking-widest">Actividad {idx + 1}</div>
                                <h3 className="text-xl font-bold text-slate-900">{tarea.descripcion}</h3>
                                <p className="text-sm text-slate-700">
                                    {tarea.requiereFoto ? 'Requiere fotografía de evidencia' : 'Requiere confirmación de tarea'}
                                </p>
                            </div>

                            <div className="shrink-0 flex flex-col items-center gap-2">
                                {evidencias[tarea.id] ? (
                                    <>
                                        {evidencias[tarea.id].estado === 'PENDIENTE' && (
                                            <div className="flex flex-col items-center">
                                                <div className="bg-warning/10 rounded-xl p-3 mb-2 animate-pulse">
                                                    <Clock className="h-8 w-8 text-warning" />
                                                </div>
                                                <span className="text-[10px] font-bold text-warning uppercase">En revisión</span>
                                            </div>
                                        )}
                                        {evidencias[tarea.id].estado === 'APROBADA' && (
                                            <div className="flex flex-col items-center">
                                                <div className="bg-success/10 rounded-xl p-3 mb-2">
                                                    <CheckCircle2 className="h-8 w-8 text-success" />
                                                </div>
                                                <span className="text-[10px] font-bold text-success uppercase">Aprobada</span>
                                            </div>
                                        )}
                                        {evidencias[tarea.id].estado === 'RECHAZADA' && (
                                            <div className="relative">
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
                                                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-red-200 rounded-2xl bg-red-50/30 hover:bg-red-50 transition-all text-red-400 cursor-pointer"
                                                >
                                                    <Upload className="h-6 w-6 mb-2" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Reintento</span>
                                                </label>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="relative">
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
                                            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all text-slate-600 hover:text-primary min-w-[120px] cursor-pointer"
                                        >
                                            {uploading[tarea.id] ? (
                                                <Loader2 className="h-8 w-8 animate-spin" />
                                            ) : (
                                                <Camera className="h-8 w-8 mb-2" />
                                            )}
                                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                                {uploading[tarea.id] ? 'Subiendo...' : 'Subir Foto'}
                                            </span>
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>
                        {evidencias[tarea.id]?.estado === 'RECHAZADA' && (
                            <div className="px-6 pb-6 mt-2">
                                <div className="p-4 bg-red-50 rounded-2xl text-red-800 text-sm border border-red-100 flex gap-3">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <div>
                                        <p className="font-bold">Tarea Rechazada</p>
                                        <p className="opacity-90">{evidencias[tarea.id].feedback || 'Por favor, sube la evidencia nuevamente con mejor calidad o siguiendo las instrucciones.'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {evidencias[tarea.id]?.estado === 'APROBADA' && evidencias[tarea.id]?.feedback && (
                            <div className="px-6 pb-6 mt-2">
                                <div className="p-4 bg-green-50 rounded-2xl text-green-800 text-sm border border-green-100 flex gap-3">
                                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                                    <div>
                                        <p className="font-bold">Feedback del Instructor</p>
                                        <p className="opacity-90">{evidencias[tarea.id].feedback}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            <div className="flex justify-end pt-8">
                <Button
                    size="lg"
                    disabled={!isAllApproved || submitting}
                    onClick={handleSubmit}
                    className="min-w-[250px] shadow-xl shadow-primary/20"
                >
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> :
                        !isAllUploaded ? 'Sube todas las evidencias' :
                            !isAllApproved ? 'Esperando aprobación...' :
                                'Finalizar Módulo Práctico'}
                </Button>
            </div>
        </div>
    );
}
