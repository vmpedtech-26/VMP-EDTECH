'use client';

import React, { useEffect, useState } from 'react';
import { 
    Sliders, 
    Plus, 
    Search, 
    RefreshCcw,
    CheckCircle2
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAccount, setNewAccount] = useState({ code: '', name: '', type: 'ASSET', isSelectable: true, parentId: '' });

    const handleSeed = async () => {
        try {
            await accountingApi.seedAccounts();
            toast.success('Plan de cuentas inicializado');
            fetchAccounts();
        } catch (error) {
            toast.error('Error al inicializar');
        }
    };

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await accountingApi.createAccount(newAccount);
            toast.success('Cuenta creada exitosamente');
            setIsModalOpen(false);
            setNewAccount({ code: '', name: '', type: 'ASSET', isSelectable: true, parentId: '' });
            fetchAccounts();
        } catch (error) {
            toast.error('Error al crear la cuenta');
            console.error(error);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Sliders className="h-6 w-6 text-primary" />
                        Plan de Cuentas
                    </h1>
                    <p className="text-slate-700 text-sm">Estructura jerárquica para el registro contable.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSeed}>
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Resetear a Default
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Cuenta
                    </Button>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Crear Nueva Cuenta</h2>
                        <form onSubmit={handleCreateAccount} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Código de Cuenta</label>
                                <input required type="text" placeholder="Ej: 1.1.10" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" value={newAccount.code} onChange={e => setNewAccount({...newAccount, code: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Nombre</label>
                                <input required type="text" placeholder="Ej: Banco Galicia" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" value={newAccount.name} onChange={e => setNewAccount({...newAccount, name: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Tipo</label>
                                    <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" value={newAccount.type} onChange={e => setNewAccount({...newAccount, type: e.target.value})}>
                                        <option value="ASSET">Activo</option>
                                        <option value="LIABILITY">Pasivo</option>
                                        <option value="EQUITY">Patrimonio</option>
                                        <option value="REVENUE">Ingreso</option>
                                        <option value="EXPENSE">Egreso</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Nivel</label>
                                    <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" value={newAccount.isSelectable ? 'true' : 'false'} onChange={e => setNewAccount({...newAccount, isSelectable: e.target.value === 'true'})}>
                                        <option value="true">Imputable</option>
                                        <option value="false">Grupo (Carpeta)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-4">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="flex-1">Guardar</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                            <Sliders className="h-6 w-6" />
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
