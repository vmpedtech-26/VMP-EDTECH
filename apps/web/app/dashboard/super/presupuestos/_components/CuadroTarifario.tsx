'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ItemTarifario } from '@/lib/api/presupuestos-hse';

interface Props {
    items: ItemTarifario[];
    onChange: (items: ItemTarifario[]) => void;
    readOnly?: boolean;
}

export function CuadroTarifario({ items, onChange, readOnly = false }: Props) {
    const handleAdd = () => {
        onChange([
            ...items,
            { codigo: '', concepto: '', unidad: '', cantidad: 1, precio_unitario: 0, importe: 0 }
        ]);
    };

    const handleRemove = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    const handleChange = (index: number, field: keyof ItemTarifario, value: string | number) => {
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };
        
        if (field === 'cantidad' || field === 'precio_unitario') {
            item.importe = Number(item.cantidad) * Number(item.precio_unitario);
        }
        
        newItems[index] = item;
        onChange(newItems);
    };

    const subtotal = items.reduce((acc, item) => acc + (item.importe || 0), 0);
    const iva = subtotal * 0.21;
    const total = subtotal + iva;

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#060D1A] text-white">
                        <tr>
                            <th className="px-4 py-3 font-medium w-32">Código</th>
                            <th className="px-4 py-3 font-medium">Concepto</th>
                            <th className="px-4 py-3 font-medium w-24">Unidad</th>
                            <th className="px-4 py-3 font-medium w-24">Cant.</th>
                            <th className="px-4 py-3 font-medium w-32">P. Unitario</th>
                            <th className="px-4 py-3 font-medium w-32">Importe</th>
                            {!readOnly && <th className="px-4 py-3 w-12"></th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={readOnly ? 6 : 7} className="px-4 py-8 text-center text-gray-500">
                                    No hay ítems en el cuadro tarifario.
                                </td>
                            </tr>
                        ) : (
                            items.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-2">
                                        <input
                                            className="w-full bg-transparent border-none outline-none focus:ring-1 focus:ring-[#0D9488] rounded px-2 py-1 text-sm"
                                            value={item.codigo}
                                            onChange={(e) => handleChange(idx, 'codigo', e.target.value)}
                                            readOnly={readOnly}
                                            placeholder="Ej: SERV-01"
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            className="w-full bg-transparent border-none outline-none focus:ring-1 focus:ring-[#0D9488] rounded px-2 py-1 text-sm"
                                            value={item.concepto}
                                            onChange={(e) => handleChange(idx, 'concepto', e.target.value)}
                                            readOnly={readOnly}
                                            placeholder="Descripción del servicio"
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            className="w-full bg-transparent border-none outline-none focus:ring-1 focus:ring-[#0D9488] rounded px-2 py-1 text-sm"
                                            value={item.unidad}
                                            onChange={(e) => handleChange(idx, 'unidad', e.target.value)}
                                            readOnly={readOnly}
                                            placeholder="Ej: Mes"
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="number"
                                            className="w-full bg-transparent border-none outline-none focus:ring-1 focus:ring-[#0D9488] rounded px-2 py-1 text-sm"
                                            value={item.cantidad}
                                            onChange={(e) => handleChange(idx, 'cantidad', Number(e.target.value))}
                                            readOnly={readOnly}
                                            min="0"
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center">
                                            <span className="text-gray-500 mr-1">$</span>
                                            <input
                                                type="number"
                                                className="w-full bg-transparent border-none outline-none focus:ring-1 focus:ring-[#0D9488] rounded px-2 py-1 text-sm"
                                                value={item.precio_unitario}
                                                onChange={(e) => handleChange(idx, 'precio_unitario', Number(e.target.value))}
                                                readOnly={readOnly}
                                                min="0"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 font-medium">
                                        ${item.importe.toLocaleString('es-AR')}
                                    </td>
                                    {!readOnly && (
                                        <td className="px-4 py-2 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleRemove(idx)}
                                                className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50"
                                                aria-label="Eliminar ítem"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-gray-200 text-sm">
                        <tr>
                            <td colSpan={4}></td>
                            <td className="px-4 py-3 font-semibold text-right">Subtotal:</td>
                            <td className="px-4 py-3 font-semibold">${subtotal.toLocaleString('es-AR')}</td>
                            {!readOnly && <td></td>}
                        </tr>
                        <tr>
                            <td colSpan={4}></td>
                            <td className="px-4 py-3 font-semibold text-right">IVA (21%):</td>
                            <td className="px-4 py-3 font-semibold">${iva.toLocaleString('es-AR')}</td>
                            {!readOnly && <td></td>}
                        </tr>
                        <tr className="bg-[#060D1A] text-white">
                            <td colSpan={4}></td>
                            <td className="px-4 py-3 font-bold text-right text-lg">TOTAL:</td>
                            <td className="px-4 py-3 font-bold text-[#F97316] text-lg">
                                ${total.toLocaleString('es-AR')}
                            </td>
                            {!readOnly && <td></td>}
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            {!readOnly && (
                <div className="flex justify-start">
                    <Button type="button" variant="outline" size="sm" onClick={handleAdd} className="border-[#0D9488] text-[#0D9488] hover:bg-[#0D9488] hover:text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar ítem
                    </Button>
                </div>
            )}
        </div>
    );
}
