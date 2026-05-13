'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Plus,
    Search,
    Filter,
    FileText,
    TrendingDown,
    Truck,
    DollarSign,
    MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { accountingApi } from '@/lib/api/accounting';

export default function ComprasPage() {
    const [compras, setCompras] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCompras = async () => {
        try {
            const data = await accountingApi.getCompras();
            setCompras(data);
        } catch (error) {
            console.error('Error fetching compras:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCompras();
    }, []);

    const filteredCompras = compras.filter(c =>
        c.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.numero && c.numero.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Registro de Compras</h1>
                    <p className="text-slate-700 text-sm">Gestiona tus gastos y pagos a proveedores.</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/super/contabilidad/compras/nuevo">
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Compra
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 border-none shadow-sm ring-1 ring-slate-100 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                            <TrendingDown className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-600">Total en Gastos</p>
                            <h3 className="text-2xl font-black text-slate-900">
                                ${compras.reduce((acc, c) => acc + c.total, 0).toLocaleString('es-AR')}
                            </h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 border-none shadow-sm ring-1 ring-slate-100 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Truck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-600">Proveedores Activos</p>
                            <h3 className="text-2xl font-black text-slate-900">
                                {new Set(compras.map(c => c.proveedor)).size}
                            </h3>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-50 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar proveedor o comprobante..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtrar
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Proveedor</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-8 w-8 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : (
                                filteredCompras.map((compra) => (
                                    <tr key={compra.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {new Date(compra.fecha).toLocaleDateString('es-AR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">{compra.proveedor}</span>
                                                <span className="text-[10px] text-slate-500">{compra.numero}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">
                                                {compra.categoria}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-slate-900">${compra.total.toLocaleString('es-AR')}</span>
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

                {!isLoading && filteredCompras.length === 0 && (
                    <div className="p-20">
                        <EmptyState
                            icon={Truck}
                            title="Sin compras registradas"
                            description="Comienza a cargar tus gastos operativos."
                            action={
                                <Button asChild>
                                    <Link href="/dashboard/super/contabilidad/compras/nuevo">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Registrar Compra
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
