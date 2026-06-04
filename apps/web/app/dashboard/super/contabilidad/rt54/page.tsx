'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    ArrowLeft, 
    SlidersHorizontal, 
    Layers, 
    Calculator, 
    BookOpen, 
    Percent, 
    Info, 
    CheckCircle2, 
    TrendingUp, 
    ArrowUpRight,
    Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Rt54SimplificacionesPage() {
    // 1. Categoria de la Entidad
    const [categoria, setCategoria] = useState<'PEQUEÑA' | 'MEDIANA' | 'RESTANTE'>('PEQUEÑA');

    // 2. Inventario de Bienes de Cambio (Elementos de Seguridad VMP)
    // RT 54 permite valuar al costo de la última compra
    const [inventario, setInventario] = useState([
        { id: '1', nombre: 'Arnés de Trabajo en Altura Hércules', stock: 45, costoHistorico: 12000, costoUltimaCompra: 15400, fechaUltimaCompra: '2026-05-12' },
        { id: '2', nombre: 'Casco de Seguridad de Alta Resistencia VMP', stock: 120, costoHistorico: 3500, costoUltimaCompra: 4800, fechaUltimaCompra: '2026-05-18' },
        { id: '3', nombre: 'Detector de Gases Combustibles Portátil', stock: 12, costoHistorico: 85000, costoUltimaCompra: 110000, fechaUltimaCompra: '2026-04-30' },
        { id: '4', nombre: 'Calzado de Seguridad Dieléctrico (Par)', stock: 50, costoHistorico: 15000, costoUltimaCompra: 19500, fechaUltimaCompra: '2026-05-05' },
    ]);

    // Modificar costo de última compra de forma simulada
    const handleUpdateCosto = (id: string, nuevoCosto: number) => {
        setInventario(inventario.map(item => 
            item.id === id ? { ...item, costoUltimaCompra: nuevoCosto } : item
        ));
    };

    // Cálculos
    const valuacionHistorica = inventario.reduce((acc, item) => acc + (item.stock * item.costoHistorico), 0);
    const valuacionUltimaCompra = inventario.reduce((acc, item) => acc + (item.stock * item.costoUltimaCompra), 0);
    const reexpresionInventario = valuacionUltimaCompra - valuacionHistorica;

    return (
        <div className="space-y-8 pb-20 max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 bg-gradient-to-r from-white to-slate-50">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="rounded-full h-10 w-10 p-0 border border-slate-200 hover:bg-slate-100" asChild>
                        <Link href="/dashboard/super/contabilidad">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-2 py-0.5 rounded-full">Normativa FACPCE 2026</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-slate-100 px-2 py-0.5 rounded-full">RT 54 / RT 56</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Parámetros RT 54 | Simplificaciones PyME</h1>
                        <p className="text-slate-600 font-medium">Configura tratamientos simplificados y valúa bienes de cambio de manera ágil bajo la Norma Unificada de Contabilidad.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Columna Principal - Configuración y Valuación */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* 1. Categorización de la Entidad */}
                    <Card className="p-6 border-none shadow-sm ring-1 ring-slate-200 bg-white">
                        <h3 className="font-black text-slate-900 text-lg tracking-tight mb-4">
                            1. Clasificación del Contribuyente (RT 54)
                        </h3>
                        <p className="text-slate-500 text-xs font-semibold mb-6">
                            Clasifica anualmente a la empresa según su volumen de ingresos del ejercicio anterior en moneda homogénea para habilitar las simplificaciones contables autorizadas por la FACPCE.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { 
                                    id: 'PEQUEÑA', 
                                    title: 'Entidad Pequeña', 
                                    desc: 'Ingresos por debajo de los límites de mediana. Máxima simplificación contable.',
                                    active: categoria === 'PEQUEÑA'
                                },
                                { 
                                    id: 'MEDIANA', 
                                    title: 'Entidad Mediana', 
                                    desc: 'Ingresos hasta $3.250.000.000 reexpresados. Exención parcial de desvalorizaciones.',
                                    active: categoria === 'MEDIANA'
                                },
                                { 
                                    id: 'RESTANTE', 
                                    title: 'Restante / Gran Escala', 
                                    desc: 'Ingresos mayores a $3.250.000.000 o interés público. Aplicación retroactiva integral.',
                                    active: categoria === 'RESTANTE'
                                }
                            ].map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategoria(cat.id as any)}
                                    className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-40 transition-all ${
                                        cat.active 
                                        ? 'border-primary bg-primary/5 ring-4 ring-primary/10 shadow-sm' 
                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <div>
                                        <h4 className="font-black text-slate-900 text-sm">{cat.title}</h4>
                                        <p className="text-slate-500 text-[10.5px] mt-1.5 leading-relaxed font-semibold">{cat.desc}</p>
                                    </div>
                                    <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full ${
                                        cat.active ? 'bg-primary text-slate-900' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {cat.active ? 'ACTIVO' : 'SELECCIONAR'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* 2. Valuación de Bienes de Cambio al Costo de la Última Compra */}
                    <Card className="p-6 border-none shadow-sm ring-1 ring-slate-200 bg-white">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-black text-slate-900 text-lg tracking-tight">2. Valuación de Bienes de Cambio</h3>
                                <p className="text-slate-500 text-xs font-semibold mt-1">
                                    Simplificación de Inventario: Medición del stock de reventa basado en la factura de compra más reciente antes del cierre.
                                </p>
                            </div>
                            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-2xl flex items-center gap-1.5 text-xs font-black shadow-sm">
                                <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
                                RT 54 Habilitado
                            </div>
                        </div>

                        {/* Listado de Stock */}
                        <div className="overflow-x-auto rounded-2xl border border-slate-100">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-widest">
                                        <th className="p-3">Descripción Bien de Cambio</th>
                                        <th className="p-3 text-center">Stock</th>
                                        <th className="p-3 text-right">Costo Histórico</th>
                                        <th className="p-3 text-right">Costo Última Factura</th>
                                        <th className="p-3 text-right">Valuación RT 54</th>
                                        <th className="p-3 text-center">Última Compra</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {inventario.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50">
                                            <td className="p-3 font-bold text-slate-800">{item.nombre}</td>
                                            <td className="p-3 text-center font-bold text-slate-600">{item.stock} u</td>
                                            <td className="p-3 text-right text-slate-400">${item.costoHistorico.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                            <td className="p-3 text-right">
                                                <input 
                                                    type="number"
                                                    className="w-24 px-2 py-1 bg-slate-50 hover:bg-white border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-right font-black outline-none"
                                                    value={item.costoUltimaCompra}
                                                    onChange={(e) => handleUpdateCosto(item.id, parseFloat(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td className="p-3 text-right font-black text-slate-900">
                                                ${(item.stock * item.costoUltimaCompra).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                            </td>
                                            <td className="p-3 text-center text-slate-400">{item.fechaUltimaCompra}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 p-4 rounded-2xl bg-teal-50/20 border border-teal-100 flex gap-3 text-xs text-teal-900 leading-relaxed font-semibold">
                            <Info className="h-5 w-5 text-teal-600 shrink-0" />
                            <div>
                                <p className="font-black text-teal-950 mb-0.5">Ventaja de Ingeniería y Simplificación Contable</p>
                                Bajo la RT 54, no es necesario realizar engorrosas ponderaciones matemáticas de costos (como PPP o FIFO) ni complejas auditorías de valor de mercado en PyMEs.
                                Tomar el costo unitario de la última factura simplifica radicalmente los cálculos y representa de forma fidedigna el costo de reposición real en contextos inflacionarios.
                            </div>
                        </div>
                    </Card>

                </div>

                {/* Columna Derecha - Simplificaciones Activas e Impacto Financiero */}
                <div className="space-y-8">
                    
                    {/* Simplificaciones Activas según Categoria */}
                    <Card className="p-6 border-none shadow-sm ring-1 ring-slate-200 bg-white">
                        <h3 className="font-black text-slate-900 text-lg tracking-tight mb-6 flex items-center gap-2">
                            <SlidersHorizontal className="h-5 w-5 text-primary" />
                            Simplificaciones Activas
                        </h3>

                        <div className="space-y-4 text-xs font-semibold">
                            {/* CFI */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-3">
                                <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                                    <Percent className="h-4 w-4" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-slate-800">No segregar CFI</span>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                            categoria === 'PEQUEÑA' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                            {categoria === 'PEQUEÑA' ? 'HABILITADO' : 'INACTIVO'}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-[10px] leading-relaxed font-medium">
                                        Exención total de segregar los Componentes Financieros Implícitos en transacciones financieras normales.
                                    </p>
                                </div>
                            </div>

                            {/* Impuesto Diferido */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-3">
                                <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                                    <Layers className="h-4 w-4" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-slate-800">Exención Impuesto Diferido</span>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                            categoria === 'PEQUEÑA' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                            {categoria === 'PEQUEÑA' ? 'HABILITADO' : 'INACTIVO'}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-[10px] leading-relaxed font-medium">
                                        Posibilidad de no registrar el Impuesto Diferido, reconociendo única y directamente el impuesto a pagar corriente.
                                    </p>
                                </div>
                            </div>

                            {/* Impairment de Activos */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-3">
                                <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                                    <BookOpen className="h-4 w-4" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-slate-800">Omitir Desvalorizaciones</span>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                            categoria !== 'RESTANTE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                            {categoria !== 'RESTANTE' ? 'HABILITADO' : 'INACTIVO'}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-[10px] leading-relaxed font-medium">
                                        Exención de evaluar desvalorizaciones de activos de uso o intangibles si la entidad obtuvo resultados positivos en los últimos ejercicios.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Impacto Patrimonial (Dashboard) */}
                    <Card className="p-6 border-none shadow-lg ring-1 ring-slate-200 bg-slate-900 text-white rounded-3xl relative overflow-hidden">
                        <div className="relative z-10 space-y-6">
                            <h3 className="font-black text-xl tracking-tight flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-primary" />
                                Conciliación de Cierre
                            </h3>

                            <div className="space-y-3 text-xs font-semibold">
                                <div className="flex justify-between text-slate-400">
                                    <span>Valuación Costo Histórico</span>
                                    <span>${valuacionHistorica.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Valuación Costo Última Compra</span>
                                    <span>${valuacionUltimaCompra.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                                <div className="pt-4 border-t border-slate-800 flex justify-between items-baseline">
                                    <span className="text-sm font-bold">REEXPRESIÓN NETA</span>
                                    <span className="text-2xl font-black text-primary">+${reexpresionInventario.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                            </div>

                            <p className="text-slate-500 text-[10px] leading-relaxed">
                                La diferencia neta representa la revaluación de activos permitida por la RT 54 al cierre contable, reflejando el patrimonio neto real ajustado por costo de reposición.
                            </p>
                        </div>
                        {/* Decorative radial glow */}
                        <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-primary/10 rounded-full blur-xl"></div>
                    </Card>

                </div>

            </div>
        </div>
    );
}
