'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { accountingApi } from '@/lib/api/accounting';
import { toast } from 'sonner';

interface ManualEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface EntryRow {
    accountId: string;
    description: string;
    debit: number;
    credit: number;
}

export default function ManualEntryModal({ isOpen, onClose, onSuccess }: ManualEntryModalProps) {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [concept, setConcept] = useState('');
    const [reference, setReference] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [rows, setRows] = useState<EntryRow[]>([
        { accountId: '', description: '', debit: 0, credit: 0 },
        { accountId: '', description: '', debit: 0, credit: 0 }
    ]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchAccounts();
        }
    }, [isOpen]);

    const fetchAccounts = async () => {
        try {
            const data = await accountingApi.getAccounts();
            // Filtrar solo cuentas seleccionables
            setAccounts(data.filter((acc: any) => acc.isSelectable));
        } catch (error) {
            console.error('Error al cargar cuentas:', error);
            toast.error('No se pudieron cargar las cuentas del plan de cuentas.');
        }
    };

    const handleAddRow = () => {
        setRows([...rows, { accountId: '', description: '', debit: 0, credit: 0 }]);
    };

    const handleRemoveRow = (index: number) => {
        if (rows.length <= 2) {
            toast.error('Un asiento contable requiere al menos 2 movimientos.');
            return;
        }
        setRows(rows.filter((_, i) => i !== index));
    };

    const handleRowChange = (index: number, field: keyof EntryRow, value: any) => {
        const newRows = [...rows];
        if (field === 'debit') {
            const numVal = Math.max(0, Number(value));
            newRows[index].debit = numVal;
            if (numVal > 0) newRows[index].credit = 0; // Evitar debito y credito a la vez
        } else if (field === 'credit') {
            const numVal = Math.max(0, Number(value));
            newRows[index].credit = numVal;
            if (numVal > 0) newRows[index].debit = 0; // Evitar debito y credito a la vez
        } else {
            newRows[index][field] = value as string;
        }
        setRows(newRows);
    };

    // Cálculos dinámicos
    const totalDebe = rows.reduce((sum, r) => sum + r.debit, 0);
    const totalHaber = rows.reduce((sum, r) => sum + r.credit, 0);
    const diferencia = Math.abs(totalDebe - totalHaber);
    const balanceado = diferencia < 0.01 && totalDebe > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!concept.trim()) {
            toast.error('Por favor, ingresa el concepto del asiento.');
            return;
        }

        if (!balanceado) {
            toast.error('El asiento no está balanceado. El Debe debe ser igual al Haber.');
            return;
        }

        const invalidRow = rows.find(r => !r.accountId || (r.debit === 0 && r.credit === 0));
        if (invalidRow) {
            toast.error('Todas las filas deben tener una cuenta seleccionada y un importe en Debe o Haber.');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                date: new Date(date).toISOString(),
                concept: concept.trim(),
                reference: reference.trim() || undefined,
                entries: rows.map(r => ({
                    accountId: r.accountId,
                    description: r.description.trim() || undefined,
                    debit: r.debit,
                    credit: r.credit
                }))
            };

            await accountingApi.createManualEntry(payload);
            toast.success('Asiento contable manual registrado correctamente.');
            onSuccess();
            // Reset
            setConcept('');
            setReference('');
            setDate(new Date().toISOString().split('T')[0]);
            setRows([
                { accountId: '', description: '', debit: 0, credit: 0 },
                { accountId: '', description: '', debit: 0, credit: 0 }
            ]);
            onClose();
        } catch (error: any) {
            console.error('Error registrando asiento manual:', error);
            const errMsg = error.response?.data?.detail || 'Ocurrió un error al registrar el asiento.';
            toast.error(errMsg);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-scale-up">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Registrar Asiento Manual</h2>
                        <p className="text-slate-700 text-xs">Crea un nuevo asiento contable libre aplicando partida doble.</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Campos Generales */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha del Asiento</label>
                            <Input 
                                type="date" 
                                value={date} 
                                onChange={(e) => setDate(e.target.value)} 
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Concepto General</label>
                            <Input 
                                type="text" 
                                placeholder="Ej: Ajuste por diferencias de caja o Devengo de alquileres" 
                                value={concept} 
                                onChange={(e) => setConcept(e.target.value)} 
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Referencia (Opcional)</label>
                            <Input 
                                type="text" 
                                placeholder="Ej: AJ-0001" 
                                value={reference} 
                                onChange={(e) => setReference(e.target.value)} 
                            />
                        </div>
                    </div>

                    {/* Tabla de Cuentas / Partidas */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-bold text-slate-800">Partidas (Movimientos)</h3>
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={handleAddRow}
                                className="h-8 px-2 text-xs flex items-center gap-1 border-dashed hover:border-solid"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Agregar Línea
                            </Button>
                        </div>

                        <div className="border border-slate-100 rounded-xl overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
                                        <th className="px-4 py-2 w-1/3">Cuenta Contable</th>
                                        <th className="px-4 py-2 w-1/3">Descripción (Opcional)</th>
                                        <th className="px-4 py-2 w-32 text-right">Debe</th>
                                        <th className="px-4 py-2 w-32 text-right">Haber</th>
                                        <th className="px-4 py-2 w-12 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {rows.map((row, index) => (
                                        <tr key={index} className="hover:bg-slate-50/20 transition-colors">
                                            <td className="px-3 py-2">
                                                <select
                                                    value={row.accountId}
                                                    onChange={(e) => handleRowChange(index, 'accountId', e.target.value)}
                                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                                    required
                                                >
                                                    <option value="">Selecciona una cuenta...</option>
                                                    {accounts.map(acc => (
                                                        <option key={acc.id} value={acc.id}>
                                                            {acc.code} - {acc.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    placeholder="Descripción de la línea..."
                                                    value={row.description}
                                                    onChange={(e) => handleRowChange(index, 'description', e.target.value)}
                                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="0.00"
                                                    value={row.debit || ''}
                                                    onChange={(e) => handleRowChange(index, 'debit', e.target.value)}
                                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-right font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="0.00"
                                                    value={row.credit || ''}
                                                    onChange={(e) => handleRowChange(index, 'credit', e.target.value)}
                                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-right font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveRow(index)}
                                                    className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-50/50 font-bold border-t border-slate-100">
                                        <td colSpan={2} className="px-4 py-3 text-sm text-slate-800 text-right">Totales:</td>
                                        <td className="px-4 py-3 text-sm text-right font-mono text-slate-900">
                                            ${totalDebe.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right font-mono text-slate-900">
                                            ${totalHaber.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Balance Info Alerts */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                        <div className="flex items-center gap-3">
                            {balanceado ? (
                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-amber-500 animate-pulse" />
                            )}
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">Estado del Balance</h4>
                                <p className="text-xs text-slate-600">
                                    {balanceado 
                                        ? 'Asiento balanceado y listo para ser registrado.' 
                                        : `El asiento no balancea. Diferencia actual: $${diferencia.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                                    }
                                </p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            balanceado 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-amber-100 text-amber-800'
                        }`}>
                            {balanceado ? 'Balanceado' : 'Desbalanceado'}
                        </span>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSaving || !balanceado} className="px-6">
                            {isSaving ? 'Registrando...' : 'Registrar Asiento'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
