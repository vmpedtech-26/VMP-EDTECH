'use client';

import React from 'react';
import {
    Plus,
    Trash2,
    Camera,
    ClipboardList,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface TareaPractica {
    id?: string;
    descripcion: string;
    requiereFoto: boolean;
}

interface PracticaEditorProps {
    tareas: TareaPractica[];
    onChange: (tareas: TareaPractica[]) => void;
}

export function PracticaEditor({ tareas, onChange }: PracticaEditorProps) {
    const addTarea = () => {
        const newTarea: TareaPractica = {
            descripcion: '',
            requiereFoto: true
        };
        onChange([...tareas, newTarea]);
    };

    const updateTarea = (idx: number, data: Partial<TareaPractica>) => {
        const newTareas = [...tareas];
        newTareas[idx] = { ...newTareas[idx], ...data };
        onChange(newTareas);
    };

    const removeTarea = (idx: number) => {
        const newTareas = tareas.filter((_, i) => i !== idx);
        onChange(newTareas);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    Lista de Verificación Práctica ({tareas.length} items)
                </h3>
                <Button onClick={addTarea} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Item
                </Button>
            </div>

            <div className="space-y-3">
                {tareas.map((t, idx) => (
                    <Card key={idx} className="p-4 border-none shadow-sm ring-1 ring-gray-100 group">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                    Instrucción para el Alumno
                                </label>
                                <input
                                    className="w-full px-4 py-2 bg-slate-50 border-none rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Ej: Verifique que el arnés no tenga cortes"
                                    value={t.descripcion}
                                    onChange={(e) => updateTarea(idx, { descripcion: e.target.value })}
                                />
                            </div>

                            <div className="flex items-end gap-2">
                                <button
                                    type="button"
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${t.requiereFoto ? 'bg-primary/10 text-primary ring-1 ring-primary/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                    onClick={() => updateTarea(idx, { requiereFoto: !t.requiereFoto })}
                                >
                                    <Camera className="h-4 w-4" />
                                    {t.requiereFoto ? 'Con Foto' : 'Sin Foto'}
                                </button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-300 hover:text-red-500 h-9 w-9 p-0"
                                    onClick={() => removeTarea(idx)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {tareas.length === 0 && (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                    <ClipboardList className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-slate-700 italic">Define los pasos que el alumno debe realizar y documentar.</p>
                </div>
            )}
        </div>
    );
}
