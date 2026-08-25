'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IndicadorHSE } from '@/lib/api/presupuestos-hse';

interface Props {
    indicadores: IndicadorHSE[];
    onChange: (indicadores: IndicadorHSE[]) => void;
}

export function IndicadoresHSE({ indicadores, onChange }: Props) {
    const handleAdd = () => {
        onChange([...indicadores, { concepto: '', valor: '' }]);
    };

    const handleRemove = (index: number) => {
        onChange(indicadores.filter((_, i) => i !== index));
    };

    const handleChange = (index: number, field: keyof IndicadorHSE, value: string) => {
        const next = [...indicadores];
        next[index] = { ...next[index], [field]: value };
        onChange(next);
    };

    return (
        <div className="space-y-3">
            <div>
                <label className="text-sm font-semibold text-gray-700">Indicadores HSE (opcional)</label>
                <p className="text-xs text-gray-500 mt-0.5">
                    Estadísticas propias de VMP para respaldar la propuesta (ej: TRIR, LTIFR, o cualquier otro que quieras mostrar). Si no cargás ninguno, esta sección no aparece en el PDF.
                </p>
            </div>

            {indicadores.length > 0 && (
                <div className="space-y-2">
                    {indicadores.map((ind, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <input
                                className="flex-1 p-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none"
                                placeholder="Concepto (ej: TRIR)"
                                value={ind.concepto}
                                onChange={(e) => handleChange(idx, 'concepto', e.target.value)}
                            />
                            <input
                                className="flex-1 p-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none"
                                placeholder="Valor (ej: 0.8)"
                                value={ind.valor}
                                onChange={(e) => handleChange(idx, 'valor', e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => handleRemove(idx)}
                                className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 shrink-0"
                                aria-label="Eliminar indicador"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <Button type="button" variant="outline" size="sm" onClick={handleAdd} className="border-[#0D9488] text-[#0D9488] hover:bg-[#0D9488] hover:text-white">
                <Plus className="h-4 w-4 mr-2" />
                Agregar indicador
            </Button>
        </div>
    );
}
