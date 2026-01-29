'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Camera, Upload, CheckCircle2, FileText, Loader2, Info } from 'lucide-react';
import { TareaPractica } from '@/types/training';
import { evidenciasApi } from '@/lib/api/evidencias';

interface PracticaViewerProps {
    tareas: TareaPractica[];
    onComplete: () => Promise<void>;
}

export function PracticaViewer({ tareas, onComplete }: PracticaViewerProps) {
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [uploaded, setUploaded] = useState<Record<string, string>>({}); // Almacena URL de la foto

    const handleFileChange = async (tareaId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading({ ...uploading, [tareaId]: true });
        try {
            const res = await evidenciasApi.uploadEvidencia(file, tareaId);
            if (res.success) {
                setUploaded({ ...uploaded, [tareaId]: res.evidencia.fotoUrl });
            }
        } catch (error) {
            console.error('Error uploading evidence:', error);
            alert('Error al subir la evidencia');
        } finally {
            setUploading({ ...uploading, [tareaId]: false });
        }
    };

    const isAllUploaded = tareas.every(t => uploaded[t.id]);

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
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Actividad {idx + 1}</div>
                                <h3 className="text-xl font-bold text-gray-900">{tarea.descripcion}</h3>
                                <p className="text-sm text-gray-500">
                                    {tarea.requiereFoto ? 'Requiere fotografía de evidencia' : 'Requiere confirmación de tarea'}
                                </p>
                            </div>

                            <div className="shrink-0">
                                {uploaded[tarea.id] ? (
                                    <div className="flex flex-col items-center">
                                        <div className="bg-success/10 rounded-lg p-2 mb-2">
                                            <CheckCircle2 className="h-10 w-10 text-success" />
                                        </div>
                                        <span className="text-xs font-bold text-success">Evidencia subida</span>
                                    </div>
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
                                            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all text-gray-400 hover:text-primary min-w-[120px] cursor-pointer"
                                        >
                                            {uploading[tarea.id] ? (
                                                <Loader2 className="h-8 w-8 animate-spin" />
                                            ) : (
                                                <Camera className="h-8 w-8 mb-2" />
                                            )}
                                            <span className="text-xs font-bold uppercase tracking-wider">
                                                {uploading[tarea.id] ? 'Subiendo...' : 'Subir Foto'}
                                            </span>
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="flex justify-end pt-8">
                <Button
                    size="lg"
                    disabled={!isAllUploaded || submitting}
                    onClick={handleSubmit}
                    className="min-w-[250px] shadow-xl shadow-primary/20"
                >
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Finalizar Módulo Práctico'}
                </Button>
            </div>
        </div>
    );
}
