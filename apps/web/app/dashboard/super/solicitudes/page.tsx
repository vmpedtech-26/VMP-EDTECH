'use client';

import React, { useEffect, useState } from 'react';
import { Inbox, Check, X, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { capacitacionesAdminApi, SolicitudCapacitacion, EstadoSolicitud } from '@/lib/api/capacitaciones-admin';
import { toast } from 'sonner';

const ESTADO_BADGE: Record<string, string> = {
    PENDIENTE: 'bg-amber-50 text-amber-700 border-amber-200',
    APROBADA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    RECHAZADA: 'bg-red-50 text-red-700 border-red-200',
    EN_CURSO: 'bg-blue-50 text-blue-700 border-blue-200',
    COMPLETADA: 'bg-slate-100 text-slate-600 border-slate-200',
};

const ESTADO_LABEL: Record<string, string> = {
    PENDIENTE: 'Pendiente',
    APROBADA: 'Aprobada',
    RECHAZADA: 'Rechazada',
    EN_CURSO: 'En curso',
    COMPLETADA: 'Completada',
};

export default function SolicitudesPage() {
    const [items, setItems] = useState<SolicitudCapacitacion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filtro, setFiltro] = useState<'TODAS' | EstadoSolicitud>('PENDIENTE');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const load = async () => {
        setIsLoading(true);
        try {
            const data = await capacitacionesAdminApi.listarSolicitudes(0, 200);
            setItems(data.items || []);
        } catch (error) {
            console.error('Error fetching solicitudes:', error);
            toast.error('No se pudieron cargar las solicitudes. Verificá tu conexión.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleUpdate = async (id: string, estado: EstadoSolicitud) => {
        setUpdatingId(id);
        try {
            await capacitacionesAdminApi.actualizarSolicitud(id, estado);
            toast.success(estado === 'APROBADA' ? 'Solicitud aprobada' : 'Solicitud rechazada');
            setItems((prev) => prev.map((s) => (s.id === id ? { ...s, estado } : s)));
        } catch (error) {
            toast.error('No se pudo actualizar la solicitud.');
        } finally {
            setUpdatingId(null);
        }
    };

    const filtered = filtro === 'TODAS' ? items : items.filter((s) => s.estado === filtro);
    const pendientesCount = items.filter((s) => s.estado === 'PENDIENTE').length;

    return (
        <div className="space-y-8 pb-20">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Inbox className="h-6 w-6 text-primary" />
                    Solicitudes de Capacitación
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    Pedidos de capacitación enviados por empresas clientes
                    {pendientesCount > 0 && (
                        <span className="ml-2 text-amber-600 font-bold">· {pendientesCount} pendientes</span>
                    )}
                </p>
            </div>

            <div className="flex gap-2 flex-wrap">
                {(['TODAS', 'PENDIENTE', 'APROBADA', 'RECHAZADA', 'EN_CURSO', 'COMPLETADA'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFiltro(f)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                            filtro === f ? 'bg-primary text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:ring-primary/30'
                        }`}
                    >
                        {f === 'TODAS' ? 'Todas' : ESTADO_LABEL[f]}
                    </button>
                ))}
            </div>

            <Card className="border-none shadow-sm ring-1 ring-slate-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-6 space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={Inbox}
                        title="Sin solicitudes"
                        description="No hay solicitudes de capacitación en este estado."
                    />
                ) : (
                    <div className="divide-y divide-slate-50">
                        {filtered.map((s) => (
                            <div key={s.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5 hover:bg-slate-50/50 transition-colors">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-slate-400" />
                                        <p className="text-sm font-bold text-slate-900">{s.empresa.nombre}</p>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${ESTADO_BADGE[s.estado]}`}>
                                            {ESTADO_LABEL[s.estado]}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1">
                                        {s.curso.nombre} · {s.cantidadPersonas} persona{s.cantidadPersonas !== 1 ? 's' : ''}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Solicitó {s.solicitante.nombre} ({s.solicitante.email})
                                    </p>
                                    {s.observaciones && (
                                        <p className="text-xs text-slate-500 mt-1 italic">"{s.observaciones}"</p>
                                    )}
                                </div>
                                {s.estado === 'PENDIENTE' && (
                                    <div className="flex gap-2 shrink-0">
                                        <Button
                                            size="sm"
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                            onClick={() => handleUpdate(s.id, 'APROBADA')}
                                            disabled={updatingId === s.id}
                                        >
                                            <Check className="h-4 w-4 mr-1" />
                                            Aprobar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                            onClick={() => handleUpdate(s.id, 'RECHAZADA')}
                                            disabled={updatingId === s.id}
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            Rechazar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
