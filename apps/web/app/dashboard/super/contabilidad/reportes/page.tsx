'use client';

import React, { useEffect, useState } from 'react';
import { 
    PieChart, 
    BarChart3, 
    FileSpreadsheet, 
    ArrowRight,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { accountingApi } from '@/lib/api/accounting';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ReportesContablesPage() {
    const [balance, setBalance] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBalance = async () => {
        try {
            const data = await accountingApi.getBalance();
            setBalance(data);
        } catch (error) {
            console.error('Error fetching balance:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, []);

    return (
        <div className="space-y-8 pb-20">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reportes Financieros</h1>
                <p className="text-slate-700 text-sm">Análisis y balances de la situación económica de VMP.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Reports Menu */}
                <div className="space-y-4">
                    {[
                        { title: 'Balance de Sumas y Saldos', icon: FileSpreadsheet, desc: 'Estado actual de todas las cuentas.' },
                        { title: 'Estado de Resultados', icon: BarChart3, desc: 'Pérdidas y ganancias del período.' },
                        { title: 'Flujo de Caja', icon: TrendingUp, desc: 'Movimiento de efectivo proyectado.' },
                    ].map((rep, i) => (
                        <Card key={i} className="p-4 border-none shadow-sm ring-1 ring-slate-100 hover:ring-primary/40 transition-all cursor-pointer group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                        <rep.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{rep.title}</h4>
                                        <p className="text-[10px] text-slate-500">{rep.desc}</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-all" />
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Main Report View: Balance Preview */}
                <Card className="lg:col-span-2 p-6 border-none shadow-sm ring-1 ring-slate-100 bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            Balance de Sumas y Saldos
                        </h3>
                        <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">
                            Ver reporte completo
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <th className="py-3 px-2">Código</th>
                                    <th className="py-3 px-2">Cuenta</th>
                                    <th className="py-3 px-2 text-right">Debe</th>
                                    <th className="py-3 px-2 text-right">Haber</th>
                                    <th className="py-3 px-2 text-right">Saldo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i}>
                                            <td className="py-3 px-2"><Skeleton className="h-3 w-8" /></td>
                                            <td className="py-3 px-2"><Skeleton className="h-3 w-32" /></td>
                                            <td className="py-3 px-2 text-right"><Skeleton className="h-3 w-12 ml-auto" /></td>
                                            <td className="py-3 px-2 text-right"><Skeleton className="h-3 w-12 ml-auto" /></td>
                                            <td className="py-3 px-2 text-right"><Skeleton className="h-3 w-16 ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : (
                                    balance.map((row) => (
                                        <tr key={row.accountCode} className="hover:bg-slate-50/50 transition-colors text-xs font-medium">
                                            <td className="py-3 px-2 text-slate-500">{row.accountCode}</td>
                                            <td className="py-3 px-2 text-slate-900 font-bold">{row.accountName}</td>
                                            <td className="py-3 px-2 text-right text-slate-600">${row.debit.toLocaleString()}</td>
                                            <td className="py-3 px-2 text-right text-slate-600">${row.credit.toLocaleString()}</td>
                                            <td className={`py-3 px-2 text-right font-black ${row.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                ${row.balance.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
