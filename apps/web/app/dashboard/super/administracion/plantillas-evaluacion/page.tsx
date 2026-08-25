'use client';

import React, { useEffect, useState } from 'react';
import { ClipboardList, Plus, Trash2, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { administracionApi, PlantillaEvaluacion, PreguntaBanco } from '@/lib/api/administracion';
import { toast } from 'sonner';

const emptyForm = {
    nombre: '',
    descripcion: '',
    notaMinima: 60,
    tiempoLimite: '',
};

export default function PlantillasEvaluacionPage() {
    const [items, setItems] = useState<PlantillaEvaluacion[]>([]);
    const [preguntas, setPreguntas] = useState<PreguntaBanco[]>([]);
    const [selectedPreguntas, setSelectedPreguntas] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);

    const load = async () => {
        setIsLoading(true);
        try {
            const [plantillasData, preguntasData] = await Promise.all([
                administracionApi.listarPlantillas(),
                administracionApi.listarPreguntas(),
            ]);
            setItems(plantillasData);
            setPreguntas(preguntasData);
        } catch (error) {
            console.error('Error fetching plantillas:', error);
            toast.error('No se pudieron cargar las plantillas. Verificá tu conexión.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const togglePregunta = (id: string) => {
        setSelectedPreguntas((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
    };

    const handleCreate = async () => {
        if (!form.nombre.trim() || selectedPreguntas.length === 0) {
            toast.error('Completá el nombre y seleccioná al menos una pregunta.');
            return;
        }
        setIsSaving(true);
        try {
            await administracionApi.crearPlantilla({
                nombre: form.nombre.trim(),
                descripcion: form.descripcion || undefined,
                notaMinima: Number(form.notaMinima) || 60,
                tiempoLimite: form.tiempoLimite ? Number(form.tiempoLimite) : undefined,
                preguntas: selectedPreguntas.map((preguntaId) => ({ preguntaId })),
            });
            setForm(emptyForm);
            setSelectedPreguntas([]);
            setShowForm(false);
            toast.success('Plantilla creada correctamente');
            load();
        } catch (error) {
            toast.error('No se pudo crear la plantilla.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta plantilla?')) return;
        setDeletingId(id);
        try {
            await administracionApi.eliminarPlantilla(id);
            toast.success('Plantilla eliminada');
            setItems((prev) => prev.filter((i) => i.id !== id));
        } catch (error) {
            toast.error('No se pudo eliminar la plantilla.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <ClipboardList className="h-6 w-6 text-primary" />
                        Plantillas de Evaluación
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Plantillas para exámenes y evaluaciones</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'outline' : 'primary'}>
                    {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    {showForm ? 'Cancelar' : 'Nueva plantilla'}
                </Button>
            </div>

            {showForm && (
                <Card className="p-6 border-none shadow-sm ring-1 ring-slate-100 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Nombre</label>
                            <input
                                type="text"
                                value={form.nombre}
                                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Descripción</label>
                            <input
                                type="text"
                                value={form.descripcion}
                                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Nota mínima (sobre 100)</label>
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={form.notaMinima}
                                onChange={(e) => setForm({ ...form, notaMinima: Number(e.target.value) })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Tiempo límite (min, opcional)</label>
                            <input
                                type="number"
                                min={1}
                                value={form.tiempoLimite}
                                onChange={(e) => setForm({ ...form, tiempoLimite: e.target.value })}
                                placeholder="Sin límite"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Preguntas del banco ({selectedPreguntas.length} seleccionadas)
                        </label>
                        {preguntas.length === 0 ? (
                            <p className="text-sm text-slate-500">
                                No hay preguntas en el banco todavía. Cargá preguntas primero en{' '}
                                <span className="font-bold">Banco de Preguntas</span>.
                            </p>
                        ) : (
                            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                                {preguntas.map((p) => (
                                    <label key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedPreguntas.includes(p.id)}
                                            onChange={() => togglePregunta(p.id)}
                                        />
                                        <span className="text-sm text-slate-800">{p.pregunta}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button onClick={handleCreate} disabled={isSaving}>
                        {isSaving ? 'Guardando...' : 'Guardar plantilla'}
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
                        icon={ClipboardList}
                        title="Sin plantillas creadas"
                        description="Todavía no armaste ninguna plantilla de evaluación."
                    />
                ) : (
                    <div className="divide-y divide-slate-50">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors gap-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-900">{item.nombre}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {item.descripcion ? `${item.descripcion} · ` : ''}
                                        Nota mínima {item.notaMinima}/100
                                        {item.tiempoLimite ? ` · ${item.tiempoLimite} min` : ' · Sin límite de tiempo'}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="xs"
                                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full shrink-0"
                                    onClick={() => handleDelete(item.id)}
                                    disabled={deletingId === item.id}
                                    aria-label="Eliminar plantilla"
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
