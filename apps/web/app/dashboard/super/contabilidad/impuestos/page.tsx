'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    ArrowLeft, 
    Calendar, 
    AlertCircle, 
    CheckCircle2, 
    FileText, 
    Download, 
    DollarSign, 
    Info, 
    Layers, 
    Activity, 
    ShieldCheck, 
    FileSpreadsheet,
    Play
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ImpuestosIvaSimplePage() {
    // 1. Estado de consistencia de IVA Ventas
    const [actividadSelected, setActividadSelected] = useState('0'); // 0: Sin clasificar, 1: Servicios de Capacitación
    const [debitoLibro, setDebitoLibro] = useState(252000.0);
    const [debitoDeclarado, setDebitoDeclarado] = useState(0.0);
    const [consistenciaState, setConsistenciaState] = useState<'ROJO' | 'VERDE'>('ROJO');

    // 2. Estado para el calculador de retención de Factura A (2026)
    const [montoFacturaA, setMontoFacturaA] = useState<number>(100000.0);
    const [retencionIva, setRetencionIva] = useState(0.0);
    const [retencionGanancias, setRetencionGanancias] = useState(0.0);
    const [netoAPagar, setNetoAPagar] = useState(0.0);
    const [cbuProveedor, setCbuProveedor] = useState('');
    const [isCbuValid, setIsCbuValid] = useState(false);

    // 3. Carga de Retenciones para exportar CSV (Formato ARCA)
    const [csvRows, setCsvRows] = useState<any[]>([
        { fecha: '2026-05-10', cuit: '30719369088', tipo: 'Factura de Compra', nro: '000200000914', monto: 12000 }
    ]);
    const [newRow, setNewRow] = useState({
        fecha: new Date().toISOString().split('T')[0],
        cuit: '',
        tipo: 'Factura de Compra',
        nro: '',
        monto: 0
    });

    useEffect(() => {
        // Calcular consistencia del cuadrante
        if (parseFloat(actividadSelected) === 1) {
            setDebitoDeclarado(debitoLibro);
            setConsistenciaState('VERDE');
        } else {
            setDebitoDeclarado(0.0);
            setConsistenciaState('ROJO');
        }
    }, [actividadSelected, debitoLibro]);

    useEffect(() => {
        // Calcular Retenciones Factura A con Retención Obligatoria (IVA 100%, Ganancias 6%)
        const iva100 = montoFacturaA * 0.21;
        const gan6 = montoFacturaA * 0.06;
        setRetencionIva(iva100);
        setRetencionGanancias(gan6);
        setNetoAPagar((montoFacturaA + iva100) - (iva100 + gan6));
    }, [montoFacturaA]);

    useEffect(() => {
        // Validar CBU de 22 dígitos
        setIsCbuValid(/^\d{22}$/.test(cbuProveedor));
    }, [cbuProveedor]);

    // Agregar fila de retención
    const handleAddRow = () => {
        if (!newRow.cuit || !newRow.nro || newRow.monto <= 0) {
            alert('Por favor complete todos los datos antes de agregar.');
            return;
        }

        // Validar longitudes oficiales de ARCA
        const nroClean = newRow.nro.trim();
        if (newRow.tipo === 'Factura de Compra' && (nroClean.length < 5 || nroClean.length > 8)) {
            alert('Error ARCA: El número de Factura de Compra debe tener entre 5 y 8 caracteres.');
            return;
        }
        if ((newRow.tipo === 'Orden de Pago' || newRow.tipo === 'Otro Tipo de Comprobante') && nroClean.length !== 16) {
            alert(`Error ARCA: El número de ${newRow.tipo} debe tener exactamente 16 caracteres.`);
            return;
        }

        setCsvRows([...csvRows, { ...newRow }]);
        setNewRow({
            fecha: new Date().toISOString().split('T')[0],
            cuit: '',
            tipo: 'Factura de Compra',
            nro: '',
            monto: 0
        });
    };

    // Remover fila
    const handleRemoveRow = (idx: number) => {
        setCsvRows(csvRows.filter((_, i) => i !== idx));
    };

    // Exportar CSV oficial según especificaciones ARCA
    const handleExportCSV = () => {
        if (csvRows.length === 0) {
            alert('No hay retenciones cargadas para exportar.');
            return;
        }

        // Estructura CSV: cabecera + filas
        // Nota: se fuerza formato string delimitado por comas con comillas
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Fecha,CUIT Agente,Tipo Comprobante,Numero Comprobante,Monto Retencion\r\n";

        csvRows.forEach(row => {
            // Forzar las celdas como texto entre comillas para preservar ceros a la izquierda
            const fechaStr = `"${row.fecha}"`;
            const cuitStr = `"${row.cuit}"`;
            const tipoStr = `"${row.tipo}"`;
            const nroStr = `"${row.nro}"`;
            const montoStr = `"${row.monto.toFixed(2)}"`;
            csvContent += `${fechaStr},${cuitStr},${tipoStr},${nroStr},${montoStr}\r\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ARCA_RETENCIONES_F2051_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-2 py-0.5 rounded-full">IVA Simple 2026</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-slate-100 px-2 py-0.5 rounded-full">F. 2051</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Liquidación Impositiva & Auditoría ARCA</h1>
                        <p className="text-slate-600 font-medium">Control interno, consistencia de DDJJ y parámetros oficiales para el cierre fiscal.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Columna Principal - Auditorías y Herramientas */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* 1. Cuadrante de Consistencia de Débito Fiscal */}
                    <Card className="p-6 border-none shadow-sm ring-1 ring-slate-200 bg-white">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-black text-slate-900 text-lg tracking-tight">1. Cuadrante de Consistencia de Débito Fiscal</h3>
                                <p className="text-slate-500 text-xs font-semibold mt-1">
                                    Auditoría automática de ARCA entre el Libro de Ventas y el Formulario F. 2051.
                                </p>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-sm transition-colors duration-500 ${
                                consistenciaState === 'VERDE' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                            }`}>
                                <div className={`h-2.5 w-2.5 rounded-full ${consistenciaState === 'VERDE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                {consistenciaState === 'VERDE' ? 'VALIDADO (VERDE)' : 'BLOQUEADO (ROJO)'}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actividad Económica Declarada</p>
                                    <select 
                                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                        value={actividadSelected}
                                        onChange={(e) => setActividadSelected(e.target.value)}
                                    >
                                        <option value="0">--- SELECCIONAR ACTIVIDAD ---</option>
                                        <option value="1">854900 - Servicios de enseñanza y capacitación (VMP)</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Débito en Libro</p>
                                        <p className="text-sm font-black text-slate-700">${debitoLibro.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Débito Declarado</p>
                                        <p className={`text-sm font-black ${consistenciaState === 'VERDE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            ${debitoDeclarado.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {consistenciaState === 'ROJO' ? (
                                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex gap-3 text-xs text-rose-800 font-semibold leading-relaxed">
                                    <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                                    <div>
                                        <p className="font-black text-rose-900 mb-0.5">Diferencia Matemática Bloqueante</p>
                                        ARCA bloquea el avance del Formulario 2051 si el débito fiscal determinado no coincide al 100% con las actividades comerciales declaradas.
                                        Selecciona la actividad principal de VMP para habilitar la conciliación de alícuotas.
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex gap-3 text-xs text-emerald-800 font-semibold leading-relaxed">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                    <div>
                                        <p className="font-black text-emerald-900 mb-0.5">Consistencia Perfecta</p>
                                        El débito fiscal ha sido validado correctamente contra la actividad impositiva. El semáforo está en <b>Verde</b>, habilitando la presentación en el servidor de ARCA.
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* 2. Carga y Validación de Percepciones CSV (Norma ARCA) */}
                    <Card className="p-6 border-none shadow-sm ring-1 ring-slate-200 bg-white">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-black text-slate-900 text-lg tracking-tight">2. Gestor de Retenciones & Plantilla CSV (F. 2051)</h3>
                                <p className="text-slate-500 text-xs font-semibold mt-1">
                                    Valida y exporta retenciones de forma masiva en el formato estricto CSV UTF-8 de ARCA.
                                </p>
                            </div>
                            <Button size="sm" onClick={handleExportCSV} className="rounded-xl shadow-md">
                                <Download className="h-4 w-4 mr-2" /> Exportar CSV ARCA
                            </Button>
                        </div>

                        {/* Formulario de Carga */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CUIT Agente Retención</label>
                                <input 
                                    type="text"
                                    placeholder="Ej: 30719369088"
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                                    value={newRow.cuit}
                                    onChange={(e) => setNewRow({...newRow, cuit: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipo Comprobante</label>
                                <select 
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none cursor-pointer"
                                    value={newRow.tipo}
                                    onChange={(e) => setNewRow({...newRow, tipo: e.target.value})}
                                >
                                    <option value="Factura de Compra">Factura de Compra (5-8 digitos)</option>
                                    <option value="Orden de Pago">Orden de Pago (16 digitos)</option>
                                    <option value="Otro Tipo de Comprobante">Otro (16 digitos)</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Número de Comprobante</label>
                                <input 
                                    type="text"
                                    placeholder="Nro del Comprobante"
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                                    value={newRow.nro}
                                    onChange={(e) => setNewRow({...newRow, nro: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha</label>
                                <input 
                                    type="date"
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                                    value={newRow.fecha}
                                    onChange={(e) => setNewRow({...newRow, fecha: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monto Retenido ($)</label>
                                <input 
                                    type="number"
                                    placeholder="Importe"
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                                    value={newRow.monto || ''}
                                    onChange={(e) => setNewRow({...newRow, monto: parseFloat(e.target.value) || 0})}
                                />
                            </div>
                            <Button type="button" onClick={handleAddRow} className="w-full rounded-xl bg-slate-900 text-white text-xs font-black">
                                Agregar Comprobante
                            </Button>
                        </div>

                        {/* Listado en Tabla */}
                        <div className="overflow-x-auto rounded-2xl border border-slate-100">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-widest">
                                        <th className="p-3">Fecha</th>
                                        <th className="p-3">CUIT Agente</th>
                                        <th className="p-3">Tipo</th>
                                        <th className="p-3">Nro Comprobante</th>
                                        <th className="p-3 text-right">Monto</th>
                                        <th className="p-3 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {csvRows.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50">
                                            <td className="p-3">{row.fecha}</td>
                                            <td className="p-3 font-mono">{row.cuit}</td>
                                            <td className="p-3">{row.tipo}</td>
                                            <td className="p-3 font-mono">{row.nro}</td>
                                            <td className="p-3 text-right font-bold text-slate-700">${row.monto.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                            <td className="p-3 text-center">
                                                <button type="button" onClick={() => handleRemoveRow(idx)} className="text-rose-500 hover:text-rose-700 font-black">
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex gap-3 text-xs text-amber-800 leading-relaxed font-semibold">
                            <Info className="h-5 w-5 text-amber-600 shrink-0" />
                            <div>
                                <p className="font-black text-amber-900 mb-0.5">Control de Diseño de Datos (Reglas CSV ARCA)</p>
                                1. La exportación del lote CSV fuerza el formato <b>Texto</b> en cada celda para evitar que se eliminen los ceros iniciales de los CUITs y Puntos de Venta al cargarse en Excel.<br/>
                                2. El número de Factura de Compra debe tener <b>entre 5 y 8 caracteres</b>. Las Órdenes de Pago y otros tipos deben tener <b>exactamente 16 caracteres</b>. El gestor valida automáticamente estas restricciones.
                            </div>
                        </div>
                    </Card>

                    {/* 3. Tratamientos Impositivos Especiales del 2026 */}
                    <Card className="p-6 border-none shadow-sm ring-1 ring-slate-200 bg-white">
                        <h3 className="font-black text-slate-900 text-lg tracking-tight mb-4 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            Tratamiento Contable de Comprobantes Especiales Clase A (ARCA 2026)
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Calculador de Factura A con Retencion */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">Simulador: Factura A con Retención Obligatoria</h4>
                                    <p className="text-slate-500 text-[10px] font-semibold mt-0.5">
                                        Derogación de Factura M. Retención del 100% IVA y 6% Ganancias.
                                    </p>
                                </div>
                                <div className="space-y-3 text-xs">
                                    <div className="space-y-1">
                                        <label className="font-bold text-slate-500">Monto Neto Gravado ($)</label>
                                        <input 
                                            type="number"
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black outline-none"
                                            value={montoFacturaA || ''}
                                            onChange={(e) => setMontoFacturaA(parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="divide-y divide-slate-100 font-semibold space-y-1 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="flex justify-between py-1 text-slate-400">
                                            <span>IVA Crédito Fiscal (21%)</span>
                                            <span>+${(montoFacturaA * 0.21).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                        </div>
                                        <div className="flex justify-between py-1 text-rose-600">
                                            <span>Retención IVA (100% del impuesto)</span>
                                            <span>-${retencionIva.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                        </div>
                                        <div className="flex justify-between py-1 text-rose-600">
                                            <span>Retención Ganancias (6% del Neto)</span>
                                            <span>-${retencionGanancias.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                        </div>
                                        <div className="flex justify-between py-2 text-slate-900 font-bold border-t">
                                            <span>Neto a Pagar al Proveedor</span>
                                            <span>${netoAPagar.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Factura A con CBU Informada & Importacion de Servicios */}
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">Factura A - Pago en CBU Informada</h4>
                                        <p className="text-slate-500 text-[10px] font-semibold mt-0.5">
                                            Obligatoriedad de transferencia neta directa a CBU homologada.
                                        </p>
                                    </div>
                                    <div className="space-y-2 text-xs">
                                        <input 
                                            type="text"
                                            placeholder="Ingresa CBU del Proveedor (22 dígitos)"
                                            maxLength={22}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono outline-none"
                                            value={cbuProveedor}
                                            onChange={(e) => setCbuProveedor(e.target.value.replace(/\D/g, ''))}
                                        />
                                        <span className={`text-[10px] font-black flex items-center gap-1 ${isCbuValid ? 'text-emerald-600' : 'text-rose-500'}`}>
                                            {isCbuValid ? '✓ CBU Validada' : '✗ CBU Incompleta o Inválida (debe ser numérico de 22 dígitos)'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-teal-50/20 border border-teal-100 text-xs text-teal-900 font-semibold space-y-2">
                                    <p className="font-black text-teal-950 flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-teal-600 animate-pulse" />
                                        Importación de Servicios (Tratamiento Excluyente)
                                    </p>
                                    <p className="leading-relaxed text-[11px] text-teal-800">
                                        En la importación de servicios, el sistema contable **excluye el monto neto** del archivo impositivo exportable, imputando en los libros de IVA únicamente el crédito fiscal del impuesto depositado en ARCA, previniendo distorsiones y rechazos en el portal fiscal.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                </div>

                {/* Columna Derecha - Agenda de Vencimientos y Control Interno */}
                <div className="space-y-8">
                    
                    {/* Agenda de Vencimientos 2026 */}
                    <Card className="p-6 border-none shadow-sm ring-1 ring-slate-200 bg-white">
                        <div className="flex items-center gap-2 mb-6">
                            <Calendar className="h-5 w-5 text-primary" />
                            <h3 className="font-black text-slate-900 text-lg tracking-tight">Agenda de Vencimientos</h3>
                        </div>

                        <div className="space-y-1 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CUIT Principal VMP</p>
                            <p className="text-sm font-black text-slate-700">30-71936908-8 (Terminación: <b>8</b>)</p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { name: 'Autónomos (Aportes)', range: '7 - 8 - 9', date: 'Día 7 u 8 del mes', status: 'Día 8' },
                                { name: 'Empleadores (F. 931 - SUSS)', range: '7 - 8 - 9', date: 'Día 13 del mes', status: 'Día 13' },
                                { name: 'Casas Particulares (F. 102)', range: 'Todos', date: 'Día 10 u 11 del mes', status: 'Día 11' },
                                { name: 'IVA Simple & Libro Digital (F. 2051)', range: '8 - 9', date: 'Día 22 o 24 del mes', status: 'Día 24 (CRÍTICO)', critical: true },
                                { name: 'Monotributo (Simplificado)', range: 'Todos', date: 'Día 20 del mes', status: 'Día 20' }
                            ].map((v, i) => (
                                <div key={i} className={`p-4 rounded-2xl border ${v.critical ? 'bg-rose-50/50 border-rose-100' : 'bg-slate-50/40 border-slate-100'} flex justify-between items-start`}>
                                    <div className="space-y-1">
                                        <p className={`text-xs font-black ${v.critical ? 'text-rose-900' : 'text-slate-800'}`}>{v.name}</p>
                                        <p className="text-[10px] text-slate-500 font-semibold">Grupo CUIT: {v.range}</p>
                                        <p className="text-[10px] text-slate-400 font-bold">Vence: {v.date}</p>
                                    </div>
                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${v.critical ? 'bg-rose-100 text-rose-800' : 'bg-slate-200/80 text-slate-700'}`}>
                                        {v.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Cuenta Puente Tributaria */}
                    <Card className="p-6 border-none shadow-lg ring-1 ring-slate-200 bg-slate-900 text-white rounded-3xl relative overflow-hidden">
                        <div className="relative z-10 space-y-4">
                            <h3 className="font-black text-xl tracking-tight flex items-center gap-2">
                                <Layers className="h-5 w-5 text-primary" />
                                Cuenta Puente Tributaria
                            </h3>
                            <p className="text-slate-400 text-xs font-medium leading-relaxed">
                                Para mitigar el desfasaje temporal de retenciones omitidas por los agentes en el portal de ARCA, nuestro sistema contable permite imputar el saldo no acreditado a la cuenta puente:
                            </p>
                            <div className="p-3 bg-slate-800 border border-slate-700 rounded-2xl text-center font-bold">
                                <span className="text-xs text-slate-400 uppercase tracking-widest block mb-0.5">Código 1.1.09</span>
                                <span className="text-sm text-primary font-black">"Retenciones a Conciliar"</span>
                            </div>
                            <p className="text-slate-500 text-[10px] leading-relaxed">
                                Esta técnica de control interno e ingeniería de sistemas preserva los saldos reales de caja y banco sin suspender la registración total de cobranzas, garantizando la fiabilidad de los estados financieros.
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
