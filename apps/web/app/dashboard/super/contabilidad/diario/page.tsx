'use client';

import React, { useEffect, useState } from 'react';
import { 
    BookOpen, 
    Search, 
    Filter, 
    Calendar,
    ArrowUpDown,
    Download
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { accountingApi } from '@/lib/api/accounting';
import { Skeleton } from '@/components/ui/Skeleton';

export default function LibroDiarioPage() {
    const [entries, setEntries] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchJournal = async () => {
        try {
            const data = await accountingApi.getJournal();
            setEntries(data);
        } catch (error) {
            console.error('Error fetching journal:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchJournal();
    }, []);

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-primary" />
                        Libro Diario
                    </h1>
                    <p className="text-slate-700 text-sm">Registro cronológico de todos los asientos contables.</p>
                </div>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar PDF
                </Button>
            </div>

            <Card className="border-none shadow-sm ring-1 ring-slate-100 overflow-hidden">
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
                            ) : (
                                entries.map((journal) => (
                                    <React.Fragment key={journal.id}>
                                        {/* Main Journal Row */}
                                        <tr className="bg-slate-50/30">
                                            <td className="px-6 py-3 text-sm font-bold text-slate-900">
                                                {new Date(journal.date).toLocaleDateString('es-AR')}
                                            </td>
                                            <td colSpan={3} className="px-6 py-3 text-sm font-black text-primary">
                                                {journal.concept} {journal.reference && `(Ref: ${journal.reference})`}
                                            </td>
                                        </tr>
                                        {/* Ledger Entries */}
                                        {journal.entries.map((entry: any) => (
                                            <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-2"></td>
                                                <td className="px-6 py-2">
                                                    <div className={`text-sm ${entry.credit > 0 ? 'pl-8 text-slate-600' : 'font-bold text-slate-800'}`}>
                                                        {entry.accountId} {/* Debería ser el nombre de la cuenta, pero por ahora ID */}
                                                    </div>
                                                    {entry.description && <div className="text-[10px] text-slate-400 pl-8">{entry.description}</div>}
                                                </td>
                                                <td className="px-6 py-2 text-right text-sm font-mono">
                                                    {entry.debit > 0 ? `$${entry.debit.toLocaleString()}` : '-'}
                                                </td>
                                                <td className="px-6 py-2 text-right text-sm font-mono">
                                                    {entry.credit > 0 ? `$${entry.credit.toLocaleString()}` : '-'}
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
        </div>
    );
}
