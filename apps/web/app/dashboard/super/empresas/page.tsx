'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Plus,
    Building2,
    Search,
    Filter,
    MoreVertical,
    Mail,
    Phone,
    MapPin,
    ShieldCheck,
    Trash2,
    Loader2,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { empresasApi, Empresa } from '@/lib/api/empresas';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function EmpresasPage() {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchEmpresas = async () => {
        try {
            const data = await empresasApi.listarEmpresas();
            setEmpresas(data);
        } catch (error) {
            console.error('Error fetching empresas:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmpresas();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar/desactivar esta empresa?')) return;
        try {
            await empresasApi.eliminarEmpresa(id);
            fetchEmpresas();
        } catch (error: any) {
            alert(error.message || 'Error al eliminar la empresa');
        }
    };

    const filteredEmpresas = empresas.filter(e =>
        e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.cuit.includes(searchTerm)
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Header section with actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Empresas</h1>
                    <p className="text-slate-700 text-sm">Administra las organizaciones y sus configuraciones.</p>
                </div>
                <Button className="w-full md:w-auto" asChild>
                    <Link href="/dashboard/super/empresas/nuevo">
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Empresa
                    </Link>
                </Button>
            </div>

            {/* Filters and search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o CUIT..."
                        className="w-full pl-11 pr-4 py-3 bg-white border-none rounded-xl shadow-sm ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="bg-white border-slate-200">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                </Button>
            </div>

            {/* Content area: Cards display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmpresas.map((empresa) => (
                    <Card key={empresa.id} className="p-0 border-none shadow-sm ring-1 ring-gray-100 overflow-hidden flex flex-col group hover:shadow-xl hover:ring-primary/10 transition-all duration-300">
                        {/* Status bar */}
                        <div className={`h-1.5 w-full ${empresa.activa ? 'bg-emerald-500' : 'bg-gray-300'}`} />

                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                                <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <div className="flex items-center gap-1">
                                    {empresa.activa ? (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wider">
                                            <CheckCircle2 className="h-3 w-3" /> Activa
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-full uppercase tracking-wider">
                                            <XCircle className="h-3 w-3" /> Inactiva
                                        </span>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors line-clamp-1">{empresa.nombre}</h3>
                            <div className="flex items-center text-xs font-mono text-slate-600 mb-6 bg-slate-50 px-2 py-1 rounded w-fit">
                                CUIT: {empresa.cuit}
                            </div>

                            <div className="space-y-3 mb-8">
                                <div className="flex items-center text-sm text-slate-700 gap-3 group/item">
                                    <div className="h-8 w-8 rounded-lg bg-blue-50/50 flex items-center justify-center text-blue-500 group-hover/item:bg-blue-50 transition-colors">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <span className="truncate">{empresa.email}</span>
                                </div>
                                {empresa.telefono && (
                                    <div className="flex items-center text-sm text-slate-700 gap-3 group/item">
                                        <div className="h-8 w-8 rounded-lg bg-orange-50/50 flex items-center justify-center text-orange-500 group-hover/item:bg-orange-50 transition-colors">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <span>{empresa.telefono}</span>
                                    </div>
                                )}
                                {empresa.direccion && (
                                    <div className="flex items-center text-sm text-slate-700 gap-3 group/item">
                                        <div className="h-8 w-8 rounded-lg bg-purple-50/50 flex items-center justify-center text-purple-500 group-hover/item:bg-purple-50 transition-colors">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <span className="truncate">{empresa.direccion}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 border-t border-gray-50 flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="xs" className="h-8 w-8 p-0 rounded-full hover:bg-red-50 hover:text-red-500" onClick={() => handleDelete(empresa.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="xs" className="h-8 w-8 p-0 rounded-full">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button variant="outline" size="sm" className="rounded-xl border-primary/20 text-primary hover:bg-primary hover:text-white transition-all font-bold">
                                    Administrar
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}

                {filteredEmpresas.length === 0 && !isLoading && (
                    <div className="col-span-full">
                        <EmptyState
                            icon={Building2}
                            title="No se encontraron empresas"
                            description={searchTerm ? `No hay resultados para "${searchTerm}". Intenta con otros términos.` : "Aún no hay empresas registradas en la plataforma."}
                            action={
                                searchTerm ? (
                                    <Button variant="outline" onClick={() => setSearchTerm('')}>
                                        Limpiar búsqueda
                                    </Button>
                                ) : (
                                    <Button asChild>
                                        <Link href="/dashboard/super/empresas/nuevo">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Registrar mi primera empresa
                                        </Link>
                                    </Button>
                                )
                            }
                        />
                    </div>
                )}

                {isLoading && (
                    <>
                        <div className="md:col-span-1 p-6 space-y-4 bg-white rounded-2xl border border-slate-100">
                            <Skeleton className="h-12 w-12 rounded-xl" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <div className="space-y-2 pt-4 border-t border-gray-50">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>
                        <div className="md:col-span-1 p-6 space-y-4 bg-white rounded-2xl border border-slate-100">
                            <Skeleton className="h-12 w-12 rounded-xl" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <div className="space-y-2 pt-4 border-t border-gray-50">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>
                        <div className="md:col-span-1 p-6 space-y-4 bg-white rounded-2xl border border-slate-100">
                            <Skeleton className="h-12 w-12 rounded-xl" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <div className="space-y-2 pt-4 border-t border-gray-50">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
