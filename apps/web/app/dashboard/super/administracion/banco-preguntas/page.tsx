'use client';

import React, { useEffect, useState } from 'react';
import { HelpCircle, Plus, Trash2, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { administracionApi, PreguntaBanco } from '@/lib/api/administracion';
import { toast } from 'sonner';

const DIFICULTAD_BADGE: Record<string, string> = {
    alta: 'bg-red-50 text-red-600 border-red-200',
    media: 'bg-amber-50 text-amber-600 border-amber-200',
    baja: 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

const emptyForm = {
    pregunta: '',
    opciones: ['', '', '', ''],
    respuestaCorrecta: 0,
    area: '',
    dificultad: 'media',
};

export default function BancoPreguntasPage() {
    const [items, setItems] = useState<PreguntaBanco[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);

    const load = async () => {
        setIsLoading(true);
        try {
            const data = await administracionApi.listarPreguntas();
            setItems(data);
        } catch (error) {
            console.error('Error fetching preguntas:', error);
            toast.error('No se pudo cargar el banco de preguntas. Verificá tu conexión.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const updateOpcion = (index: number, value: string) => {
        const opciones = [...form.opciones];
        opciones[index] = value;
        setForm({ ...form, opciones });
    };

    const handleCreate = async () => {
        if (!form.pregunta.trim() || form.opciones.some((o) => !o.trim())) {
            toast.error('Completá la pregunta y las 4 opciones.');
            return;
        }
        setIsSaving(true);
        try {
            await administracionApi.crearPregunta(form);
            setForm(emptyForm);
            setShowForm(false);
            toast.success('Pregunta creada correctamente');
            load();
        } catch (error) {
            toast.error('No se pudo crear la pregunta.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta pregunta?')) return;
        setDeletingId(id);
        try {
            await administracionApi.eliminarPregunta(id);
            toast.success('Pregunta eliminada');
            setItems((prev) => prev.filter((i) => i.id !== id));
        } catch (error) {
            toast.error('No se pudo eliminar la pregunta.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <HelpCircle className="h-6 w-6 text-primary" />
                        Banco de Preguntas
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Preguntas reutilizables para exámenes</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'outline' : 'primary'}>
                    {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    {showForm ? 'Cancelar' : 'Nueva pregunta'}
                </Button>
            </div>

            {showForm && (
                <Card className="p-6 border-none shadow-sm ring-1 ring-slate-100 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Pregunta</label>
                        <input
                            type="text"
                            value={form.pregunta}
                            onChange={(e) => setForm({ ...form, pregunta: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {form.opciones.map((op, i) => (
                            <div key={i}>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1">
                                    <input
                                        type="radio"
                                        name="correcta"
                                        checked={form.respuestaCorrecta === i}
                                        onChange={() => setForm({ ...form, respuestaCorrecta: i })}
                                    />
                                    Opción {i + 1} {form.respuestaCorrecta === i && <span className="text-emerald-600">(Correcta)</span>}
                                </label>
                                <input
                                    type="text"
                                    value={op}
                                    onChange={(e) => updateOpcion(i, e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Área</label>
                            <input
                                type="text"
                                value={form.area}
                                onChange={(e) => setForm({ ...form, area: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Dificultad</label>
                            <select
                                value={form.dificultad}
                                onChange={(e) => setForm({ ...form, dificultad: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="baja">Baja</option>
                                <option value="media">Media</option>
                                <option value="alta">Alta</option>
                            </select>
                        </div>
                    </div>
                    <Button onClick={handleCreate} disabled={isSaving}>
                        {isSaving ? 'Guardando...' : 'Guardar pregunta'}
                    </Button>
                </Card>
            )}

            <Card className="border-none shadow-sm ring-1 ring-slate-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-6 space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                ) : items.length === 0 ? (
                    <EmptyState
                        icon={HelpCircle}
                        title="Sin preguntas creadas"
                        description="Todavía no agregaste ninguna pregunta al banco."
                    />
                ) : (
                    <div className="divide-y divide-slate-50">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors gap-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">{item.pregunta}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {item.area && <span className="text-xs text-slate-500">{item.area}</span>}
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${DIFICULTAD_BADGE[item.dificultad] || DIFICULTAD_BADGE.media}`}>
                                            {item.dificultad}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="xs"
                                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full shrink-0"
                                    onClick={() => handleDelete(item.id)}
                                    disabled={deletingId === item.id}
                                    aria-label="Eliminar pregunta"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
