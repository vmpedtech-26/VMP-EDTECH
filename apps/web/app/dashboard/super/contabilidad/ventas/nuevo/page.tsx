'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    ArrowLeft, 
    Plus, 
    Trash2, 
    Save, 
    Calculator, 
    Building2, 
    FileText 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { accountingApi, VentaItem } from '@/lib/api/accounting';
import { empresasApi, Empresa } from '@/lib/api/empresas';

export default function NuevaVentaPage() {
    const router = useRouter();
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        numero: '',
        companyId: '',
        fecha: new Date().toISOString().split('T')[0],
        metodoPago: 'TRANSFERENCIA',
        condicionIva: 'RI',
    });

    const [items, setItems] = useState<VentaItem[]>([
        { descripcion: '', cantidad: 1, precioUnit: 0, subtotal: 0 }
    ]);

    useEffect(() => {
        empresasApi.listarEmpresas().then(setEmpresas);
    }, []);

    const handleAddItem = () => {
        setItems([...items, { descripcion: '', cantidad: 1, precioUnit: 0, subtotal: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof VentaItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        
        if (field === 'cantidad' || field === 'precioUnit') {
            newItems[index].subtotal = newItems[index].cantidad * newItems[index].precioUnit;
        }
        
        setItems(newItems);
    };

    const subtotalGral = items.reduce((acc, item) => acc + item.subtotal, 0);
    const iva = subtotalGral * 0.21;
    const total = subtotalGral + iva;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await accountingApi.createVenta({
                ...formData,
                subtotal: subtotalGral,
                iva,
                percepciones: 0,
                total,
                estado: 'PENDIENTE',
                items
            });
            router.push('/dashboard/super/contabilidad/ventas');
        } catch (error) {
            alert('Error al registrar venta: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-20 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" className="rounded-full h-10 w-10 p-0" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Registrar Nueva Venta</h1>
                    <p className="text-slate-500 text-sm font-medium">Completa los datos para facturar a un cliente.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* General Info */}
                    <Card className="p-6 border-none shadow-sm ring-1 ring-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Empresa / Cliente</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <select 
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold"
                                        value={formData.companyId}
                                        onChange={(e) => setFormData({...formData, companyId: e.target.value})}
                                    >
                                        <option value="">Seleccionar Empresa</option>
                                        {empresas.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Número de Factura</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Ej: A-0001-00000001"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold"
                                        value={formData.numero}
                                        onChange={(e) => setFormData({...formData, numero: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fecha</label>
                                <input 
                                    type="date" 
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold"
                                    value={formData.fecha}
                                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Método de Pago</label>
                                <select 
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold"
                                    value={formData.metodoPago}
                                    onChange={(e) => setFormData({...formData, metodoPago: e.target.value})}
                                >
                                    <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                                    <option value="EFECTIVO">Efectivo</option>
                                    <option value="MERCADOPAGO">Mercado Pago</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    {/* Items */}
                    <Card className="p-6 border-none shadow-sm ring-1 ring-slate-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-slate-900 tracking-tight">Detalle de Conceptos</h3>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                                <Plus className="h-4 w-4 mr-2" />
                                Añadir Item
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 group relative">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descripción</label>
                                        <input 
                                            type="text" 
                                            placeholder="Ej: Curso de Manejo Defensivo (15 alumnos)"
                                            required
                                            className="w-full px-4 py-2.5 bg-white border-none rounded-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                                            value={item.descripcion}
                                            onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-full md:w-24 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cant.</label>
                                        <input 
                                            type="number" 
                                            required
                                            min="1"
                                            className="w-full px-4 py-2.5 bg-white border-none rounded-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold text-center"
                                            value={item.cantidad}
                                            onChange={(e) => handleItemChange(index, 'cantidad', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="w-full md:w-32 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">P. Unitario</label>
                                        <input 
                                            type="number" 
                                            required
                                            min="0"
                                            step="0.01"
                                            className="w-full px-4 py-2.5 bg-white border-none rounded-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold"
                                            value={item.precioUnit}
                                            onChange={(e) => handleItemChange(index, 'precioUnit', parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <div className="w-full md:w-32 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</label>
                                        <div className="h-10 flex items-center px-4 bg-slate-100 rounded-xl text-sm font-black text-slate-700">
                                            ${item.subtotal.toLocaleString()}
                                        </div>
                                    </div>
                                    {items.length > 1 && (
                                        <button 
                                            type="button"
                                            className="absolute -top-2 -right-2 md:static h-10 w-10 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                                            onClick={() => handleRemoveItem(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Summary & Submit */}
                <div className="space-y-6">
                    <Card className="p-6 border-none shadow-sm ring-1 ring-slate-200 bg-slate-900 text-white">
                        <h3 className="font-black text-xl mb-6 tracking-tight flex items-center gap-2">
                            <Calculator className="h-5 w-5 text-primary" />
                            Resumen Final
                        </h3>
                        
                        <div className="space-y-4 font-medium">
                            <div className="flex justify-between text-slate-400">
                                <span>Subtotal</span>
                                <span>${subtotalGral.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>IVA (21%)</span>
                                <span>${iva.toLocaleString()}</span>
                            </div>
                            <div className="pt-4 border-t border-slate-800 flex justify-between items-baseline">
                                <span className="text-lg font-black">TOTAL</span>
                                <span className="text-3xl font-black text-primary">${total.toLocaleString()}</span>
                            </div>
                        </div>

                        <Button 
                            className="w-full mt-8 h-14 rounded-2xl text-lg font-black shadow-lg shadow-primary/20"
                            disabled={isLoading || !formData.companyId || !formData.numero}
                        >
                            {isLoading ? 'Registrando...' : 'Confirmar Venta'}
                            <Save className="ml-2 h-5 w-5" />
                        </Button>
                    </Card>

                    <Card className="p-4 border-none shadow-sm ring-1 ring-amber-100 bg-amber-50">
                        <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                <Calculator className="h-4 w-4" />
                            </div>
                            <p className="text-xs text-amber-800 leading-relaxed">
                                <strong>Nota Contable:</strong> Al confirmar, se generará automáticamente un asiento en el Libro Diario debitando la cuenta de cobranza y acreditando Ventas e IVA.
                            </p>
                        </div>
                    </Card>
                </div>
            </form>
        </div>
    );
}
