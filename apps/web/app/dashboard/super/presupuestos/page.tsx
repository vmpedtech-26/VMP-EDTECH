'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, FileText, Download, Edit2, Copy, Trash2, Loader2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { presupuestosHseApi, PresupuestoHSE } from '@/lib/api/presupuestos-hse';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ESTADO_COLORS: Record<string, string> = {
    BORRADOR: 'bg-slate-100 text-slate-700 border-slate-200',
    ENVIADO: 'bg-blue-100 text-blue-700 border-blue-200',
    ACEPTADO: 'bg-green-100 text-green-700 border-green-200',
    RECHAZADO: 'bg-red-100 text-red-700 border-red-200'
};

export default function PresupuestosHSEPage() {
    const [presupuestos, setPresupuestos] = useState<PresupuestoHSE[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPresupuestos = async () => {
        try {
            const data = await presupuestosHseApi.listar();
            setPresupuestos(data || []);
        } catch (error) {
            console.error('Error fetching presupuestos:', error);
            // toast.error('Error al cargar los presupuestos');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPresupuestos();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar este presupuesto?')) return;
        try {
            await presupuestosHseApi.eliminar(id);
            toast.success('Presupuesto eliminado');
            fetchPresupuestos();
        } catch (error) {
            toast.error('Error al eliminar el presupuesto');
        }
    };

    const handleDuplicar = async (id: string) => {
        try {
            await presupuestosHseApi.duplicar(id);
            toast.success('Presupuesto duplicado exitosamente');
            fetchPresupuestos();
        } catch (error) {
            toast.error('Error al duplicar el presupuesto');
        }
    };

    const handleDownloadPdf = async (id: string, name: string) => {
        try {
            toast.loading('Generando PDF...', { id: 'pdf' });
            const blob = await presupuestosHseApi.generarPdf(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Presupuesto-${name}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('PDF descargado', { id: 'pdf' });
        } catch (error) {
            toast.error('Error al generar PDF', { id: 'pdf' });
        }
    };

    const filtered = presupuestos.filter(p =>
        p.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.numero_cotizacion?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Generador de Presupuestos HSE</h1>
                    <p className="text-gray-500 text-sm">Administra cotizaciones y presupuestos de Higiene, Seguridad y Medio Ambiente.</p>
                </div>
                <Button className="w-full md:w-auto bg-[#060D1A] hover:bg-[#060D1A]/90 text-white" asChild>
                    <Link href="/dashboard/super/presupuestos/nuevo">
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Presupuesto
                    </Link>
                </Button>
            </div>

            {/* Filters and search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#0D9488] transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente o nro cotización..."
                        className="w-full pl-11 pr-4 py-3 bg-white border-none rounded-xl shadow-sm ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-[#0D9488]/20 transition-all font-medium text-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table area */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-white uppercase bg-[#060D1A]">
                            <tr>
                                <th className="px-6 py-4 font-medium">N.º Cotización</th>
                                <th className="px-6 py-4 font-medium">Cliente</th>
                                <th className="px-6 py-4 font-medium">Recurso</th>
                                <th className="px-6 py-4 font-medium">Fecha Emisión</th>
                                <th className="px-6 py-4 font-medium">Total</th>
                                <th className="px-6 py-4 font-medium">Estado</th>
                                <th className="px-6 py-4 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-8 w-24 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8">
                                        <EmptyState
                                            icon={FileText}
                                            title="No se encontraron presupuestos"
                                            description={searchTerm ? "Intenta con otros términos de búsqueda." : "Aún no has creado ningún presupuesto HSE."}
                                            action={
                                                !searchTerm && (
                                                    <Button asChild className="bg-[#060D1A] hover:bg-[#060D1A]/90 text-white">
                                                        <Link href="/dashboard/super/presupuestos/nuevo">
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Crear Primer Presupuesto
                                                        </Link>
                                                    </Button>
                                                )
                                            }
                                        />
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{p.numero_cotizacion}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{p.cliente_nombre}</div>
                                            <div className="text-xs text-gray-500">CUIT: {p.cliente_cuit}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{p.recurso_nombre}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {p.fecha_emision ? format(new Date(p.fecha_emision), "d 'de' MMMM, yyyy", { locale: es }) : '-'}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-[#F97316]">
                                            ${p.total?.toLocaleString('es-AR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${ESTADO_COLORS[p.estado] || ESTADO_COLORS.BORRADOR}`}>
                                                {p.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="xs"
                                                    className="h-8 w-8 p-0 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-full"
                                                    onClick={() => handleDownloadPdf(p.id, p.numero_cotizacion)}
                                                    title="Descargar PDF"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="xs"
                                                    className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-100 rounded-full"
                                                    asChild
                                                    title="Editar"
                                                >
                                                    <Link href={`/dashboard/super/presupuestos/${p.id}`}>
                                                        <Edit2 className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="xs"
                                                    className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-100 rounded-full"
                                                    onClick={() => handleDuplicar(p.id)}
                                                    title="Duplicar"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="xs"
                                                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 rounded-full"
                                                    onClick={() => handleDelete(p.id)}
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
