'use client';

import React, { useEffect, useState } from 'react';
import { History, Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { capacitacionesAdminApi, HistoricoItem } from '@/lib/api/capacitaciones-admin';
import { toast } from 'sonner';

const ESTADO_BADGE: Record<string, string> = {
    COMPLETADO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    APROBADO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REPROBADO: 'bg-red-50 text-red-700 border-red-200',
};

export default function HistoricoPage() {
    const [items, setItems] = useState<HistoricoItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        capacitacionesAdminApi.listarHistorico(0, 200)
            .then((res) => setItems(res.items || []))
            .catch((error) => {
                console.error('Error fetching historico:', error);
                toast.error('No se pudo cargar el histórico. Verificá tu conexión.');
            })
            .finally(() => setIsLoading(false));
    }, []);

    const filtered = items.filter((i) =>
        i.alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.curso.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <History className="h-6 w-6 text-primary" />
                    Histórico de Capacitaciones
                </h1>
                <p className="text-slate-500 text-sm mt-1">Registro de capacitaciones finalizadas por alumno y curso</p>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar por alumno o curso..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                />
            </div>

            <Card className="border-none shadow-sm ring-1 ring-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Alumno</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Curso</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Progreso</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Finalizado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8">
                                        <EmptyState
                                            icon={History}
                                            title="Sin registros"
                                            description="Todavía no hay capacitaciones finalizadas registradas."
                                        />
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-900">{item.alumno.nombre}</p>
                                            <p className="text-xs text-slate-500">{item.alumno.email}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700">{item.curso.nombre}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${ESTADO_BADGE[item.estado] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                {item.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700">{item.progreso}%</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {item.finDate ? new Date(item.finDate).toLocaleDateString('es-AR') : '—'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
