'use client';

import React, { useEffect, useState } from 'react';
import { 
    Sliders, 
    Plus, 
    Search, 
    RefreshCcw,
    CheckCircle2,
    LayoutTree
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { accountingApi } from '@/lib/api/accounting';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from 'sonner';

export default function PlanCuentasPage() {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAccounts = async () => {
        setIsLoading(true);
        try {
            const data = await accountingApi.getAccounts();
            setAccounts(data);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleSeed = async () => {
        try {
            await accountingApi.seedAccounts();
            toast.success('Plan de cuentas inicializado');
            fetchAccounts();
        } catch (error) {
            toast.error('Error al inicializar');
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <LayoutTree className="h-6 w-6 text-primary" />
                        Plan de Cuentas
                    </h1>
                    <p className="text-slate-700 text-sm">Estructura jerárquica para el registro contable.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSeed}>
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Resetear a Default
                    </Button>
                    <Button disabled>
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Cuenta
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-sm ring-1 ring-slate-100 bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Código</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nombre</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Tipo</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Seleccionable</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="px-6 py-4 text-center"><Skeleton className="h-4 w-4 mx-auto" /></td>
                                    </tr>
                                ))
                            ) : (
                                accounts.map((acc) => (
                                    <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-mono text-slate-500">{acc.code}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm ${acc.isSelectable ? 'font-medium text-slate-900' : 'font-black text-primary'}`}>
                                                {acc.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">{acc.type}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {acc.isSelectable ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-300 uppercase">Grupo</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!isLoading && accounts.length === 0 && (
                    <div className="p-20 text-center space-y-4">
                        <div className="mx-auto h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                            <LayoutTree className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-slate-900 font-bold">No hay cuentas configuradas</p>
                            <p className="text-slate-500 text-sm">Debes inicializar el plan de cuentas para comenzar.</p>
                        </div>
                        <Button onClick={handleSeed}>
                            Inicializar Plan de Cuentas
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}
