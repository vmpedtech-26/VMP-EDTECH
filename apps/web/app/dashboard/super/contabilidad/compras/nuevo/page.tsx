'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
    ArrowLeft, 
    Plus, 
    Trash2, 
    Save, 
    Truck, 
    FileText,
    UploadCloud,
    Sparkles,
    CheckCircle,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { accountingApi } from '@/lib/api/accounting';

export default function NuevaCompraPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [isAutofilled, setIsAutofilled] = useState(false);
    const [isDragActive, setIsDragActive] = useState(false);
    
    const [formData, setFormData] = useState({
        proveedor: '',
        cuit: '',
        numero: '',
        fecha: new Date().toISOString().split('T')[0],
        metodoPago: 'EFECTIVO',
        categoria: 'OTROS',
        tipoFactura: 'A', // A, A_RETENCION, A_CBU, B, C
        cbuProveedor: '',
        esImportacionServicio: false
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
    const iva = (formData.categoria === 'SERVICIOS' && formData.tipoFactura !== 'A_RETENCION') ? 0 : subtotalGral * 0.21;
    const total = subtotalGral + iva;

    // Retenciones 2026 para Factura A Especial
    const retencionIva = formData.tipoFactura === 'A_RETENCION' ? iva : 0;
    const retencionGanancias = formData.tipoFactura === 'A_RETENCION' ? subtotalGral * 0.06 : 0;
    const netoAPagar = total - retencionIva - retencionGanancias;

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await handleFileUpload(e.target.files[0]);
        }
    };

    const handleFileUpload = async (file: File) => {
        if (file.type !== "application/pdf") {
            alert("Por favor, sube un archivo PDF válido (Factura AFIP).");
            return;
        }

        setIsParsing(true);
        setIsAutofilled(false);
        
        try {
            const res = await accountingApi.uploadPdf(file);
            // Handle Axios wrapper vs direct fetch data wrapper
            const data = res.data || res;
            
            if (data) {
                setFormData({
                    proveedor: data.proveedor || '',
                    cuit: data.cuit || '',
                    numero: data.numero || '',
                    fecha: data.fecha || new Date().toISOString().split('T')[0],
                    metodoPago: data.metodoPago || 'EFECTIVO',
                    categoria: data.categoria || 'OTROS',
                });
                
                if (data.items && data.items.length > 0) {
                    setItems(data.items.map((item: any) => ({
                        descripcion: item.descripcion,
                        cantidad: item.cantidad || 1,
                        precioUnit: item.precioUnit || 0,
                        subtotal: item.subtotal || 0
                    })));
                } else {
                    setItems([{
                        descripcion: data.categoria === 'SERVICIOS' ? 'Servicios profesionales / honorarios' : 'Otros egresos',
                        cantidad: 1,
                        precioUnit: data.subtotal || 0,
                        subtotal: data.subtotal || 0
                    }]);
                }
                
                setIsAutofilled(true);
                // Keep the visual helper active for 6 seconds
                setTimeout(() => setIsAutofilled(false), 6000);
            }
        } catch (error) {
            console.error(error);
            alert(`Fallo en la lectura inteligente: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsParsing(false);
        }
    };

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
        <div className="space-y-8 pb-20 max-w-5xl mx-auto relative">
            {/* Elegant overlay while parsing */}
            {isParsing && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex flex-col justify-center items-center text-white transition-all duration-300">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm text-center space-y-4 ring-1 ring-white/10">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                            <Loader2 className="h-12 w-12 text-primary animate-spin relative" />
                        </div>
                        <h3 className="text-lg font-black tracking-tight flex items-center gap-2 justify-center">
                            <Sparkles className="h-5 w-5 text-yellow-400 animate-bounce" />
                            Asistente Inteligente VMP
                        </h3>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                            Analizando el PDF de tu factura, extrayendo montos, CUIT, proveedor e ítems detallados...
                        </p>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="rounded-full h-10 w-10 p-0 border border-slate-200 hover:bg-slate-100" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            Registrar Nueva Compra
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">Carga un comprobante de gasto o pago a proveedor manualmente o usando el asistente.</p>
                    </div>
                </div>
                {isAutofilled && (
                    <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-black shadow-sm animate-bounce">
                        <Sparkles className="h-4 w-4 text-emerald-600" />
                        ¡Formulario completado por el Asistente VMP!
                    </div>
                )}
            </div>

            {/* Asistente Drag & Drop Area */}
            <div 
                className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer relative overflow-hidden group ${
                    isDragActive 
                    ? "border-primary bg-primary/5 ring-4 ring-primary/10" 
                    : "border-slate-300 hover:border-primary hover:bg-slate-50/50 bg-white shadow-sm"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="application/pdf"
                    className="hidden" 
                    onChange={handleFileChange}
                />
                <div className="space-y-4 max-w-lg mx-auto relative z-10">
                    <div className="mx-auto w-16 h-16 bg-slate-100 group-hover:bg-primary/10 rounded-2xl flex items-center justify-center transition-colors">
                        <UploadCloud className="h-8 w-8 text-slate-500 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Asistente de Carga Rápida (Sube tu Factura PDF)</h3>
                        <p className="text-slate-500 text-sm font-semibold mt-1">
                            Arrastra y suelta tu factura PDF de la AFIP aquí, o haz clic para buscarla en tu equipo.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-slate-100 group-hover:bg-primary/5 px-3 py-1 rounded-full text-slate-600 group-hover:text-primary transition-all text-xs font-bold">
                        <Sparkles className="h-3 w-3 text-yellow-500" />
                        Extrae automáticamente Proveedor, CUIT, Número, Ítems e Importes.
                    </div>
                </div>
                {/* Beautiful background decorations */}
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-slate-100/50 rounded-full blur-3xl -z-10 group-hover:bg-primary/5 transition-colors"></div>
                <div className="absolute left-0 top-0 w-32 h-32 bg-slate-100/50 rounded-full blur-3xl -z-10 group-hover:bg-primary/5 transition-colors"></div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 border-none shadow-sm ring-1 ring-slate-200 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Proveedor */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Proveedor</label>
                                    {isAutofilled && formData.proveedor && (
                                        <span className="text-[10px] text-emerald-600 font-black flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" /> Auto-completado
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Ej: Librería Central"
                                        required
                                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl ring-1 outline-none transition-all text-sm font-bold ${
                                            isAutofilled && formData.proveedor
                                            ? "ring-2 ring-emerald-500/50 bg-emerald-50/20"
                                            : "ring-slate-200 focus:ring-2 focus:ring-primary/20"
                                        }`}
                                        value={formData.proveedor}
                                        onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* CUIT */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">CUIT</label>
                                    {isAutofilled && formData.cuit && (
                                        <span className="text-[10px] text-emerald-600 font-black flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" /> Auto-completado
                                        </span>
                                    )}
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="20-XXXXXXXX-X"
                                    className={`w-full px-4 py-3 bg-slate-50 border-none rounded-xl ring-1 outline-none transition-all text-sm font-bold ${
                                        isAutofilled && formData.cuit
                                        ? "ring-2 ring-emerald-500/50 bg-emerald-50/20"
                                        : "ring-slate-200 focus:ring-2 focus:ring-primary/20"
                                    }`}
                                    value={formData.cuit}
                                    onChange={(e) => setFormData({...formData, cuit: e.target.value})}
                                />
                            </div>

                            {/* Número Comprobante */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Número Comprobante</label>
                                    {isAutofilled && formData.numero && (
                                        <span className="text-[10px] text-emerald-600 font-black flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" /> Auto-completado
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Ej: 0001-00001234"
                                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl ring-1 outline-none transition-all text-sm font-bold ${
                                            isAutofilled && formData.numero
                                            ? "ring-2 ring-emerald-500/50 bg-emerald-50/20"
                                            : "ring-slate-200 focus:ring-2 focus:ring-primary/20"
                                        }`}
                                        value={formData.numero}
                                        onChange={(e) => setFormData({...formData, numero: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Fecha */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fecha</label>
                                    {isAutofilled && formData.fecha && (
                                        <span className="text-[10px] text-emerald-600 font-black flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" /> Auto-completado
                                        </span>
                                    )}
                                </div>
                                <input 
                                    type="date" 
                                    required
                                    className={`w-full px-4 py-3 bg-slate-50 border-none rounded-xl ring-1 outline-none transition-all text-sm font-bold ${
                                        isAutofilled && formData.fecha
                                        ? "ring-2 ring-emerald-500/50 bg-emerald-50/20"
                                        : "ring-slate-200 focus:ring-2 focus:ring-primary/20"
                                    }`}
                                    value={formData.fecha}
                                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                                />
                            </div>

                            {/* Categoria */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Categoría del Gasto</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold appearance-none cursor-pointer"
                                    value={formData.categoria}
                                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                                >
                                    <option value="OTROS">OTROS GASTOS</option>
                                    <option value="SERVICIOS">SERVICIOS PROFESIONALES / SERVICIOS</option>
                                    <option value="IMPUESTOS">IMPUESTOS Y TASAS</option>
                                    <option value="SUELDOS">SUELDOS Y JORNALES</option>
                                </select>
                            </div>

                            {/* Metodo Pago */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Método de Pago</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold appearance-none cursor-pointer"
                                    value={formData.metodoPago}
                                    onChange={(e) => setFormData({...formData, metodoPago: e.target.value})}
                                >
                                    <option value="EFECTIVO">EFECTIVO (CAJA)</option>
                                    <option value="TRANSFERENCIA">TRANSFERENCIA (BANCO)</option>
                                    <option value="TARJETA">TARJETA DE CRÉDITO / DÉBITO</option>
                                </select>
                            </div>

                            {/* Tipo Factura / Comprobante */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Clase de Factura / Comprobante</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold appearance-none cursor-pointer"
                                    value={formData.tipoFactura}
                                    onChange={(e) => setFormData({...formData, tipoFactura: e.target.value})}
                                >
                                    <option value="A">Factura A (Estándar)</option>
                                    <option value="A_RETENCION">Factura A con Retención Obligatoria (IVA 100% / Gan 6%)</option>
                                    <option value="A_CBU">Factura A con Pago en CBU Informada</option>
                                    <option value="B">Factura B (Consumidor Final)</option>
                                    <option value="C">Factura C (Monotributo)</option>
                                </select>
                            </div>

                            {/* CBU del Proveedor (Conditional) */}
                            {formData.tipoFactura === 'A_CBU' && (
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">CBU del Proveedor (22 dígitos)</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ingresa los 22 dígitos del CBU"
                                        maxLength={22}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold"
                                        value={formData.cbuProveedor}
                                        onChange={(e) => setFormData({...formData, cbuProveedor: e.target.value.replace(/\D/g, '')})}
                                    />
                                    <span className="text-[10px] font-bold text-emerald-600">
                                        {/^\d{22}$/.test(formData.cbuProveedor) ? '✓ CBU válido' : '* CBU incompleto (debe ser numérico de 22 dígitos)'}
                                    </span>
                                </div>
                            )}

                            {/* Checkbox Importación de Servicios */}
                            <div className="flex items-center space-x-3 py-2 md:col-span-2">
                                <input 
                                    type="checkbox"
                                    id="esImportacionServicio"
                                    className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                                    checked={formData.esImportacionServicio}
                                    onChange={(e) => setFormData({...formData, esImportacionServicio: e.target.checked})}
                                />
                                <label htmlFor="esImportacionServicio" className="text-xs font-bold text-slate-700 cursor-pointer">
                                    ¿Es Importación de Servicios? <span className="text-slate-400 font-semibold">(Tratamiento impositivo especial F. 2051)</span>
                                </label>
                            </div>

                        </div>
                    </Card>

                    <Card className="p-6 border-none shadow-sm ring-1 ring-slate-200 bg-white">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-slate-900 tracking-tight text-lg">Detalle de la Compra</h3>
                            <Button type="button" variant="outline" size="sm" className="rounded-xl border border-slate-200" onClick={handleAddItem}>
                                <Plus className="h-4 w-4 mr-2" />
                                Añadir Item
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 relative group">
                                    <div className="flex-1 space-y-1">
                                        <input 
                                            type="text" 
                                            placeholder="Descripción del item / concepto"
                                            required
                                            className="w-full px-4 py-2 bg-white border-none rounded-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-semibold"
                                            value={item.descripcion}
                                            onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-full md:w-24 space-y-1">
                                        <input 
                                            type="number" 
                                            placeholder="Cant."
                                            required
                                            min="1"
                                            className="w-full px-4 py-2 bg-white border-none rounded-xl ring-1 ring-slate-200 text-sm font-bold text-center"
                                            value={item.cantidad}
                                            onChange={(e) => handleItemChange(index, 'cantidad', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="w-full md:w-32 space-y-1">
                                        <input 
                                            type="number" 
                                            placeholder="Precio Unit."
                                            required
                                            min="0"
                                            step="0.01"
                                            className="w-full px-4 py-2 bg-white border-none rounded-xl ring-1 ring-slate-200 text-sm font-bold"
                                            value={item.precioUnit}
                                            onChange={(e) => handleItemChange(index, 'precioUnit', parseFloat(e.target.value))}
                                        />
                                    </div>
                                    {items.length > 1 && (
                                        <button 
                                            type="button"
                                            className="text-slate-300 hover:text-rose-500 transition-colors flex items-center justify-center p-2"
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

                <div className="space-y-6">
                    <Card className="p-6 border-none shadow-lg ring-1 ring-slate-200 bg-slate-900 text-white rounded-3xl relative overflow-hidden">
                        <h3 className="font-black text-xl mb-6 tracking-tight">Resumen Contable</h3>
                        <div className="space-y-3 font-medium">
                            <div className="flex justify-between text-slate-400 text-sm">
                                <span>Subtotal (Neto)</span>
                                <span>${subtotalGral.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            </div>
                            <div className="flex justify-between text-slate-400 text-sm">
                                <span>IVA (CF)</span>
                                <span>${iva.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            </div>
                            <div className="pt-4 border-t border-slate-800 flex justify-between items-baseline">
                                <span className="text-lg font-black">TOTAL</span>
                                <span className="text-3xl font-black text-primary">${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            </div>
                        </div>
                        <Button 
                            className="w-full mt-8 h-12 rounded-xl font-black bg-primary text-slate-900 hover:bg-primary/90 flex justify-center items-center"
                            disabled={isLoading || !formData.proveedor}
                        >
                            {isLoading ? 'Guardando...' : 'Confirmar & Guardar'}
                            <Save className="ml-2 h-4 w-4" />
                        </Button>
                    </Card>
                </div>
            </form>
        </div>
    );
}
