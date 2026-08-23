'use client';

import React, { useEffect, useState } from 'react';
import { Briefcase, Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { administracionApi, Puesto, CatalogItem } from '@/lib/api/administracion';
import { toast } from 'sonner';

export default function PuestosPage() {
    const [puestos, setPuestos] = useState<Puesto[]>([]);
    const [sectores, setSectores] = useState<CatalogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [nombre, setNombre] = useState('');
    const [sectorId, setSectorId] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const load = async () => {
        setIsLoading(true);
        try {
            const [puestosData, sectoresData] = await Promise.all([
                administracionApi.listarPuestos(),
                administracionApi.listarSectores(),
            ]);
            setPuestos(puestosData);
            setSectores(sectoresData);
        } catch (error) {
            console.error('Error fetching puestos:', error);
            toast.error('No se pudieron cargar los puestos. Verificá tu conexión.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleCreate = async () => {
        if (!nombre.trim()) return;
        setIsSaving(true);
        try {
            await administracionApi.crearPuesto(nombre.trim(), sectorId || undefined);
            setNombre('');
            setSectorId('');
            toast.success('Puesto creado correctamente');
            load();
        } catch (error) {
            toast.error('No se pudo crear el puesto.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este puesto?')) return;
        setDeletingId(id);
        try {
            await administracionApi.eliminarPuesto(id);
            toast.success('Puesto eliminado');
            setPuestos((prev) => prev.filter((p) => p.id !== id));
        } catch (error) {
            toast.error('No se pudo eliminar el puesto.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Briefcase className="h-6 w-6 text-primary" />
                    Puestos
                </h1>
                <p className="text-slate-500 text-sm mt-1">Puestos y posiciones laborales</p>
            </div>

            <Card className="p-6 border-none shadow-sm ring-1 ring-slate-100">
                <div className="flex flex-col md:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Nombre del puesto"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <select
                        value={sectorId}
                        onChange={(e) => setSectorId(e.target.value)}
                        className="md:w-56 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="">Sin sector</option>
                        {sectores.map((s) => (
                            <option key={s.id} value={s.id}>{s.nombre}</option>
                        ))}
                    </select>
                    <Button onClick={handleCreate} disabled={isSaving || !nombre.trim()}>
                        <Plus className="h-4 w-4 mr-2" />
                        {isSaving ? 'Guardando...' : 'Agregar'}
                    </Button>
                </div>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-slate-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-6 space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full" />
                        ))}
                    </div>
                ) : puestos.length === 0 ? (
                    <EmptyState
                        icon={Briefcase}
                        title="Sin puestos creados"
                        description="Todavía no agregaste ningún puesto."
                    />
                ) : (
                    <div className="divide-y divide-slate-50">
                        {puestos.map((p) => (
                            <div key={p.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{p.nombre}</p>
                                    {p.sector && <p className="text-xs text-slate-500 mt-0.5">{p.sector.nombre}</p>}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="xs"
                                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full"
                                    onClick={() => handleDelete(p.id)}
                                    disabled={deletingId === p.id}
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
