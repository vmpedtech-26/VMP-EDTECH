'use client';

import React, { useEffect, useState } from 'react';
import { 
    Book, 
    Search, 
    Filter, 
    Calendar,
    ArrowUpDown,
    Download,
    FileSpreadsheet,
    RefreshCw,
    TrendingUp
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { accountingApi } from '@/lib/api/accounting';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from 'sonner';

export default function LibroMayorPage() {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [selectedCode, setSelectedCode] = useState('');
    const [mayorData, setMayorData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const data = await accountingApi.getAccounts();
            const selectable = data.filter((a: any) => a.isSelectable);
            setAccounts(selectable);
            if (selectable.length > 0) {
                setSelectedCode(selectable[0].code);
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
            toast.error('No se pudo cargar el plan de cuentas.');
        } finally {
            setIsLoadingAccounts(false);
        }
    };

    const fetchMayor = async () => {
        if (!selectedCode) return;
        setIsLoading(true);
        try {
            const data = await accountingApi.getMayorCuenta(selectedCode, desde || undefined, hasta || undefined);
            setMayorData(data);
        } catch (error: any) {
            console.error('Error fetching mayor:', error);
            const msg = error.response?.data?.detail || 'No se pudo cargar el Libro Mayor de esta cuenta.';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedCode) {
            fetchMayor();
        }
    }, [selectedCode, desde, hasta]);

    const handleClearFilters = () => {
        setDesde('');
        setHasta('');
    };

    const handleExportCSV = () => {
        try {
            if (!mayorData || !mayorData.entries || mayorData.entries.length === 0) {
                toast.error('No hay datos para exportar.');
                return;
            }

            let csvContent = "\ufeff"; // UTF-8 BOM
            csvContent += `Libro Mayor - Cuenta: ${mayorData.account.code} - ${mayorData.account.name} (Tipo: ${mayorData.account.type})\n`;
            csvContent += `Generado el: ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}\n`;
            if (desde || hasta) {
                csvContent += `Rango de Fechas: Desde ${desde || 'Inicio'} Hasta ${hasta || 'Fin'}\n`;
            }
            csvContent += `Saldo Acumulado Final: $${mayorData.balance.toFixed(2).replace('.', ',')}\n\n`;
            
            csvContent += "Fecha;Concepto del Asiento;Referencia;Tipo;Descripción del Movimiento;Debe;Haber;Saldo Acumulado\n";
            
            mayorData.entries.forEach((entry: any) => {
                const fechaStr = new Date(entry.date).toLocaleDateString('es-AR');
                const concepto = entry.concept || '';
                const refStr = entry.reference || '';
                const tipo = entry.type || 'GENERAL';
                const desc = entry.description || '';
                const debeStr = entry.debit > 0 ? entry.debit.toString().replace('.', ',') : '';
                const haberStr = entry.credit > 0 ? entry.credit.toString().replace('.', ',') : '';
                const saldoStr = entry.balance.toString().replace('.', ',');
                
                csvContent += `"${fechaStr}";"${concepto}";"${refStr}";"${tipo}";"${desc}";"${debeStr}";"${haberStr}";"${saldoStr}"\n`;
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `libro_mayor_${selectedCode}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Libro Mayor exportado a Excel (CSV) correctamente');
        } catch (error) {
            console.error('Error al exportar CSV:', error);
            toast.error('Ocurrió un error al exportar.');
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Book className="h-6 w-6 text-primary" />
                        Libro Mayor por Cuenta
                    </h1>
                    <p className="text-slate-700 text-sm">Auditoría detallada y cálculo de saldo de una cuenta contable específica.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        onClick={handleExportCSV} 
                        disabled={isLoading || !mayorData || !mayorData.entries || mayorData.entries.length === 0}
                    >
                        <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />
                        Exportar Excel
                    </Button>
                </div>
            </div>

            {/* Controles de Selección y Filtro */}
            <Card className="p-6 border-none shadow-sm ring-1 ring-slate-100 bg-white space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    
                    {/* Selector de Cuenta */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Seleccionar Cuenta Contable</label>
                        {isLoadingAccounts ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <select
                                value={selectedCode}
                                onChange={(e) => setSelectedCode(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            >
                                <option value="">Selecciona una cuenta...</option>
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.code}>
                                        {acc.code} - {acc.name} ({acc.type})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Filtros de Fecha */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Desde</label>
                        <Input 
                            type="date" 
                            className="h-10 text-xs" 
                            value={desde} 
                            onChange={(e) => setDesde(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hasta</label>
                        <Input 
                            type="date" 
                            className="h-10 text-xs" 
                            value={hasta} 
                            onChange={(e) => setHasta(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    {(desde || hasta) && (
                        <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs text-slate-700 hover:text-slate-900">
                            Limpiar Fechas
                        </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={fetchMayor} className="text-xs flex items-center gap-1 text-slate-700">
                        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                </div>
            </Card>

            {/* Ficha Resumen de Cuenta */}
            {mayorData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-5 bg-white border-none shadow-sm ring-1 ring-slate-100 flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Book className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Cuenta Seleccionada</p>
                            <h3 className="text-base font-black text-slate-900">{mayorData.account.code}</h3>
                            <p className="text-sm font-bold text-slate-700">{mayorData.account.name}</p>
                        </div>
                    </Card>

                    <Card className="p-5 bg-white border-none shadow-sm ring-1 ring-slate-100 flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Naturaleza / Tipo</p>
                            <h3 className="text-base font-black text-slate-900">{mayorData.account.type}</h3>
                            <p className="text-xs text-slate-600">
                                {mayorData.account.type === 'ASSET' ? 'Activo (Saldo Deudor)' :
                                 mayorData.account.type === 'LIABILITY' ? 'Pasivo (Saldo Acreedor)' :
                                 mayorData.account.type === 'EQUITY' ? 'Patrimonio Neto (Acreedor)' :
                                 mayorData.account.type === 'REVENUE' ? 'Ingreso (Saldo Acreedor)' : 'Egreso (Saldo Deudor)'}
                            </p>
                        </div>
                    </Card>

                    <Card className={`p-5 border-none shadow-sm ring-1 ring-slate-100 flex items-center gap-4 ${
                        mayorData.balance >= 0 ? 'bg-emerald-50/30' : 'bg-rose-50/30'
                    }`}>
                        <div className={`p-3 rounded-xl ${
                            mayorData.balance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                            <span className="text-lg font-black">$</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Saldo Contable Final</p>
                            <h3 className={`text-xl font-black ${
                                mayorData.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'
                            }`}>
                                ${mayorData.balance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </h3>
                            <p className="text-xs text-slate-700">Saldo acumulado en el período.</p>
                        </div>
                    </Card>
                </div>
            )}

            {/* Tabla de Movimientos */}
            <Card className="border-none shadow-sm ring-1 ring-slate-100 overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Fecha</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Concepto del Asiento</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Detalle Movimiento</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Debe</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Haber</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right bg-slate-50/80">Saldo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-16 ml-auto" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-16 ml-auto" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-20 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : !mayorData || !mayorData.entries || mayorData.entries.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-slate-700 text-sm">
                                        No se registran movimientos para esta cuenta contable en el período.
                                    </td>
                                </tr>
                            ) : (
                                mayorData.entries.map((entry: any) => (
                                    <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-900 whitespace-nowrap">
                                            {new Date(entry.date).toLocaleDateString('es-AR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-900">{entry.concept}</div>
                                            {entry.reference && <div className="text-xs text-slate-700 font-bold">Ref: {entry.reference}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700">
                                            {entry.description}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-mono text-slate-900">
                                            {entry.debit > 0 ? `$${entry.debit.toLocaleString('es-AR', {minimumFractionDigits: 2})}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-mono text-slate-900">
                                            {entry.credit > 0 ? `$${entry.credit.toLocaleString('es-AR', {minimumFractionDigits: 2})}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-mono font-bold text-slate-900 bg-slate-50/30">
                                            ${entry.balance.toLocaleString('es-AR', {minimumFractionDigits: 2})}
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
