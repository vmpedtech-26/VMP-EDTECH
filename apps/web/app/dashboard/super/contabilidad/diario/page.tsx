'use client';

import React, { useEffect, useState } from 'react';
import { 
    BookOpen, 
    Search, 
    Filter, 
    Calendar,
    ArrowUpDown,
    Download,
    Plus,
    FileSpreadsheet,
    RefreshCw
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { accountingApi } from '@/lib/api/accounting';
import { Skeleton } from '@/components/ui/Skeleton';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'sonner';
import ManualEntryModal from '@/components/admin/ManualEntryModal';

export default function LibroDiarioPage() {
    const [entries, setEntries] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchJournal = async () => {
        setIsLoading(true);
        try {
            const data = await accountingApi.getJournal(desde || undefined, hasta || undefined);
            setEntries(data);
        } catch (error) {
            console.error('Error fetching journal:', error);
            toast.error('Ocurrió un error al cargar el Libro Diario.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchJournal();
    }, [desde, hasta]);

    const handleClearFilters = () => {
        setDesde('');
        setHasta('');
    };

    const handleExportCSV = () => {
        try {
            if (entries.length === 0) {
                toast.error('No hay datos para exportar.');
                return;
            }

            let csvContent = "\ufeff"; // UTF-8 BOM
            csvContent += "Fecha;Concepto/Asiento;Referencia;Código Cuenta;Nombre Cuenta;Descripción Movimiento;Debe;Haber\n";
            
            entries.forEach(journal => {
                const fechaStr = new Date(journal.date).toLocaleDateString('es-AR');
                const refStr = journal.reference || '';
                const concepto = journal.concept || '';
                
                if (journal.entries && Array.isArray(journal.entries)) {
                    journal.entries.forEach((entry: any) => {
                        const accCode = entry.account ? entry.account.code : entry.accountId;
                        const accName = entry.account ? entry.account.name : '';
                        const desc = entry.description || '';
                        const debeStr = entry.debit > 0 ? entry.debit.toString().replace('.', ',') : '';
                        const haberStr = entry.credit > 0 ? entry.credit.toString().replace('.', ',') : '';
                        
                        csvContent += `"${fechaStr}";"${concepto}";"${refStr}";"${accCode}";"${accName}";"${desc}";"${debeStr}";"${haberStr}"\n`;
                    });
                }
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `libro_diario_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Libro Diario exportado a Excel (CSV) correctamente');
        } catch (error) {
            console.error('Error al exportar CSV:', error);
            toast.error('Ocurrió un error al exportar a Excel.');
        }
    };

    const handleExportPDF = () => {
        try {
            const doc = new jsPDF();
            
            doc.setFontSize(18);
            doc.text('Libro Diario - VMP EDTECH', 14, 22);
            doc.setFontSize(11);
            doc.text(`Generado el: ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}`, 14, 30);
            if (desde || hasta) {
                doc.text(`Rango: ${desde ? desde : 'Inicio'} al ${hasta ? hasta : 'Fin'}`, 14, 36);
            }

            const tableColumn = ["Fecha", "Concepto / Cuenta", "Debe", "Haber"];
            const tableRows: any[] = [];

            const formatAmount = (val: any) => {
                if (val === undefined || val === null || isNaN(Number(val)) || Number(val) <= 0) return '';
                return `$${Number(val).toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            };

            entries.forEach(journal => {
                // Main row
                tableRows.push([
                    new Date(journal.date).toLocaleDateString('es-AR'),
                    journal.concept + (journal.reference ? ` (Ref: ${journal.reference})` : ''),
                    '',
                    ''
                ]);

                // Entry rows
                if (journal.entries && Array.isArray(journal.entries)) {
                    journal.entries.forEach((entry: any) => {
                        const accountText = entry.account 
                            ? `${entry.account.code} - ${entry.account.name}` 
                            : entry.accountId;
                        tableRows.push([
                            '',
                            `  ${accountText}${entry.description ? ' (' + entry.description + ')' : ''}`,
                            formatAmount(entry.debit),
                            formatAmount(entry.credit)
                        ]);
                    });
                }
                // Blank row for separation
                tableRows.push(['', '', '', '']);
            });

            (doc as any).autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: desde || hasta ? 42 : 40,
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 2 },
                headStyles: { fillColor: [15, 23, 42] },
                alternateRowStyles: { fillColor: [248, 250, 252] },
            });

            doc.save(`libro_diario_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success('Libro Diario exportado a PDF correctamente');
        } catch (error) {
            console.error('Error al exportar PDF:', error);
            toast.error('Ocurrió un error al exportar el PDF. Por favor reintente.');
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-primary" />
                        Libro Diario
                    </h1>
                    <p className="text-slate-700 text-sm">Registro cronológico de todos los asientos contables.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Asiento
                    </Button>
                    <Button variant="outline" onClick={handleExportCSV} disabled={isLoading || entries.length === 0}>
                        <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />
                        Excel
                    </Button>
                    <Button variant="outline" onClick={handleExportPDF} disabled={isLoading || entries.length === 0}>
                        <Download className="h-4 w-4 mr-2 text-rose-500" />
                        PDF
                    </Button>
                </div>
            </div>

            {/* Controles de Filtros */}
            <Card className="p-4 border-none shadow-sm ring-1 ring-slate-100 flex flex-wrap items-center gap-4 bg-white">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 uppercase">Filtrar por Fecha:</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600">Desde:</span>
                        <Input 
                            type="date" 
                            className="w-36 h-9 text-xs" 
                            value={desde} 
                            onChange={(e) => setDesde(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600">Hasta:</span>
                        <Input 
                            type="date" 
                            className="w-36 h-9 text-xs" 
                            value={hasta} 
                            onChange={(e) => setHasta(e.target.value)}
                        />
                    </div>
                    {(desde || hasta) && (
                        <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs h-8 text-slate-700 hover:text-slate-900">
                            Limpiar
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={fetchJournal} className="h-8 w-8 hover:bg-slate-100">
                        <RefreshCw className={`h-4 w-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </Card>

            {/* Tabla Principal */}
            <Card className="border-none shadow-sm ring-1 ring-slate-100 overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Fecha</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Concepto / Cuenta</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Debe</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Haber</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-64" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-16 ml-auto" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-16 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : entries.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-slate-700 text-sm">
                                        No se encontraron asientos contables registrados.
                                    </td>
                                </tr>
                            ) : (
                                entries.map((journal) => (
                                    <React.Fragment key={journal.id}>
                                        {/* Main Journal Row */}
                                        <tr className="bg-slate-50/30">
                                            <td className="px-6 py-3 text-sm font-bold text-slate-900">
                                                {new Date(journal.date).toLocaleDateString('es-AR')}
                                            </td>
                                            <td colSpan={3} className="px-6 py-3 text-sm font-black text-primary flex items-center justify-between">
                                                <span>
                                                    {journal.concept} {journal.reference && `(Ref: ${journal.reference})`}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                                                    journal.type === 'SALES' ? 'bg-blue-100 text-blue-800' :
                                                    journal.type === 'PURCHASES' ? 'bg-amber-100 text-amber-800' :
                                                    'bg-slate-100 text-slate-800'
                                                }`}>
                                                    {journal.type}
                                                </span>
                                            </td>
                                        </tr>
                                        {/* Ledger Entries */}
                                        {journal.entries.map((entry: any) => (
                                            <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-2"></td>
                                                <td className="px-6 py-2">
                                                    <div className={`text-sm ${entry.credit > 0 ? 'pl-8 text-slate-600' : 'font-bold text-slate-800'}`}>
                                                        {entry.account ? `${entry.account.code} - ${entry.account.name}` : entry.accountId}
                                                    </div>
                                                    {entry.description && <div className="text-[10px] text-slate-400 pl-8">{entry.description}</div>}
                                                </td>
                                                <td className="px-6 py-2 text-right text-sm font-mono">
                                                    {entry.debit > 0 ? `$${entry.debit.toLocaleString('es-AR', {minimumFractionDigits: 2})}` : '-'}
                                                </td>
                                                <td className="px-6 py-2 text-right text-sm font-mono">
                                                    {entry.credit > 0 ? `$${entry.credit.toLocaleString('es-AR', {minimumFractionDigits: 2})}` : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="h-4"></tr>
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal de Asiento Manual */}
            <ManualEntryModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchJournal}
            />
        </div>
    );
}
