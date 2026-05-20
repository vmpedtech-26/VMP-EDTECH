'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Plus,
    Search,
    Filter,
    FileText,
    Download,
    TrendingUp,
    Calendar,
    Building2,
    DollarSign,
    MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { accountingApi, Venta } from '@/lib/api/accounting';

export default function VentasPage() {
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchVentas = async () => {
        try {
            const data = await accountingApi.getVentas();
            setVentas(data);
        } catch (error) {
            console.error('Error fetching ventas:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVentas();
    }, []);

    const filteredVentas = ventas.filter(v =>
        v.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.companyId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalVentas = ventas.reduce((acc, v) => acc + v.total, 0);

    return (
        <div className="space-y-8 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Registro de Ventas</h1>
                    <p className="text-slate-700 text-sm">Gestiona la facturación y cobranzas de clientes.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="hidden md:flex">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                    </Button>
                    <Button asChild>
                        <Link href="/dashboard/super/contabilidad/ventas/nuevo">
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva Venta
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-none shadow-sm ring-1 ring-slate-100 bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-600">Total Facturado</p>
                            <h3 className="text-2xl font-black text-slate-900">
                                ${totalVentas.toLocaleString('es-AR')}
                            </h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 border-none shadow-sm ring-1 ring-slate-100 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-600">Comprobantes</p>
                            <h3 className="text-2xl font-black text-slate-900">{ventas.length}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 border-none shadow-sm ring-1 ring-slate-100 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-600">Este Mes</p>
                            <h3 className="text-2xl font-black text-slate-900">{ventas.filter(v => new Date(v.fecha).getMonth() === new Date().getMonth()).length}</h3>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por número o empresa..."
                        className="w-full pl-11 pr-4 py-3 bg-white border-none rounded-xl shadow-sm ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="bg-white border-slate-200">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Número</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Empresa</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></td>
                                    </tr>
                                ))
                            ) : (
                                filteredVentas.map((venta) => (
                                    <tr key={venta.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {new Date(venta.fecha).toLocaleDateString('es-AR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-slate-900">{venta.numero}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-slate-400" />
                                                <span className="text-sm text-slate-700">{venta.companyId}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-slate-900">${venta.total.toLocaleString('es-AR')}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                venta.estado === 'COBRADA' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                                {venta.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!isLoading && filteredVentas.length === 0 && (
                    <div className="p-20">
                        <EmptyState
                            icon={DollarSign}
                            title="No hay ventas registradas"
                            description="Comienza a registrar la facturación de tus clientes."
                            action={
                                <Button asChild>
                                    <Link href="/dashboard/super/contabilidad/ventas/nuevo">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Registrar Venta
                                    </Link>
                                </Button>
                            }
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
