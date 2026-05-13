'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    ArrowLeft, 
    Plus, 
    Trash2, 
    Save, 
    Calculator, 
    Truck, 
    FileText 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { accountingApi } from '@/lib/api/accounting';

export default function NuevaCompraPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        proveedor: '',
        cuit: '',
        numero: '',
        fecha: new Date().toISOString().split('T')[0],
        metodoPago: 'EFECTIVO',
        categoria: 'OTROS',
    });

    const [items, setItems] = useState([
        { descripcion: '', cantidad: 1, precioUnit: 0, subtotal: 0 }
    ]);

    const handleAddItem = () => {
        setItems([...items, { descripcion: '', cantidad: 1, precioUnit: 0, subtotal: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        
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
            await accountingApi.createCompra({
                ...formData,
                subtotal: subtotalGral,
                iva,
                percepciones: 0,
                total,
                items
            });
            router.push('/dashboard/super/contabilidad/compras');
        } catch (error) {
            alert('Error al registrar compra: ' + (error instanceof Error ? error.message : String(error)));
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
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Registrar Nueva Compra</h1>
                    <p className="text-slate-500 text-sm font-medium">Carga un comprobante de gasto o pago a proveedor.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 border-none shadow-sm ring-1 ring-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Proveedor</label>
                                <div className="relative">
                                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Ej: Librería Central"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold"
                                        value={formData.proveedor}
                                        onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">CUIT (Opcional)</label>
                                <input 
                                    type="text" 
                                    placeholder="20-XXXXXXXX-X"
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold"
                                    value={formData.cuit}
                                    onChange={(e) => setFormData({...formData, cuit: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Número Comprobante</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Ej: 0001-00001234"
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
                        </div>
                    </Card>

                    <Card className="p-6 border-none shadow-sm ring-1 ring-slate-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-slate-900 tracking-tight">Ítems del Comprobante</h3>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                                <Plus className="h-4 w-4 mr-2" />
                                Añadir
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 relative group">
                                    <div className="flex-1 space-y-1">
                                        <input 
                                            type="text" 
                                            placeholder="Descripción del gasto"
                                            required
                                            className="w-full px-4 py-2 bg-white border-none rounded-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                                            value={item.descripcion}
                                            onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-full md:w-20 space-y-1">
                                        <input 
                                            type="number" 
                                            required
                                            className="w-full px-4 py-2 bg-white border-none rounded-xl ring-1 ring-slate-200 text-sm font-bold text-center"
                                            value={item.cantidad}
                                            onChange={(e) => handleItemChange(index, 'cantidad', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="w-full md:w-28 space-y-1">
                                        <input 
                                            type="number" 
                                            required
                                            className="w-full px-4 py-2 bg-white border-none rounded-xl ring-1 ring-slate-200 text-sm font-bold"
                                            value={item.precioUnit}
                                            onChange={(e) => handleItemChange(index, 'precioUnit', parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <button 
                                        type="button"
                                        className="text-slate-300 hover:text-rose-500 transition-colors"
                                        onClick={() => handleRemoveItem(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="p-6 border-none shadow-lg ring-1 ring-slate-200 bg-slate-900 text-white">
                        <h3 className="font-black text-xl mb-6 tracking-tight">Total a Pagar</h3>
                        <div className="space-y-3 font-medium">
                            <div className="flex justify-between text-slate-400 text-sm">
                                <span>Subtotal</span>
                                <span>${subtotalGral.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-400 text-sm">
                                <span>IVA</span>
                                <span>${iva.toLocaleString()}</span>
                            </div>
                            <div className="pt-4 border-t border-slate-800 flex justify-between items-baseline">
                                <span className="text-lg font-black">TOTAL</span>
                                <span className="text-3xl font-black text-primary">${total.toLocaleString()}</span>
                            </div>
                        </div>
                        <Button 
                            className="w-full mt-8 h-12 rounded-xl font-black"
                            disabled={isLoading || !formData.proveedor}
                        >
                            {isLoading ? 'Guardando...' : 'Guardar Compra'}
                            <Save className="ml-2 h-4 w-4" />
                        </Button>
                    </Card>
                </div>
            </form>
        </div>
    );
}
