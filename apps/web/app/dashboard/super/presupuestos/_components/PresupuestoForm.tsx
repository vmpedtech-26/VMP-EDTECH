'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Save, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CuadroTarifario } from './CuadroTarifario';
import { AsistenteIA } from './AsistenteIA';
import { presupuestosHseApi, PresupuestoHSE, ItemTarifario } from '@/lib/api/presupuestos-hse';
import { toast } from 'sonner';

interface Props {
    initialData?: Partial<PresupuestoHSE>;
}

export function PresupuestoForm({ initialData = {} }: Props) {
    const router = useRouter();
    const [formData, setFormData] = useState<Partial<PresupuestoHSE>>({
        estado: 'BORRADOR',
        items: [],
        horario: '09:00 a 18:00 hs',
        ...initialData
    });
    const [showIA, setShowIA] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        cliente: true,
        recurso: true,
        modalidad: true,
        tarifario: true,
        contenido: true
    });
    const [isSaving, setIsSaving] = useState(false);

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleChange = (field: keyof PresupuestoHSE, value: any) => {
        setFormData(prev => {
            const next = { ...prev, [field]: value };
            
            // Auto calculate jornadas if dates change
            if (field === 'fecha_desde' || field === 'fecha_hasta') {
                if (next.fecha_desde && next.fecha_hasta) {
                    const d1 = new Date(next.fecha_desde);
                    const d2 = new Date(next.fecha_hasta);
                    if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
                        const diffTime = Math.abs(d2.getTime() - d1.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both days
                        next.cantidad_jornadas = diffDays;
                    }
                }
            }
            return next;
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (formData.id) {
                await presupuestosHseApi.actualizar(formData.id, formData);
                toast.success('Presupuesto actualizado');
            } else {
                const created = await presupuestosHseApi.crear(formData);
                setFormData(created);
                toast.success('Presupuesto creado con éxito');
                router.replace(`/dashboard/super/presupuestos/${created.id}`);
            }
        } catch (error) {
            toast.error('Error al guardar el presupuesto');
        } finally {
            setIsSaving(false);
        }
    };

    const handleGenerarPDF = async () => {
        if (!formData.id) {
            toast.error('Primero debes guardar el presupuesto para generar el PDF');
            return;
        }
        try {
            toast.loading('Generando PDF...', { id: 'pdf-gen' });
            const blob = await presupuestosHseApi.generarPdf(formData.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Presupuesto-${formData.numero_cotizacion || 'HSE'}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('PDF generado', { id: 'pdf-gen' });
        } catch (error) {
            toast.error('Error al generar PDF', { id: 'pdf-gen' });
        }
    };

    // Callback IA
    const onCompletar = (data: Partial<PresupuestoHSE>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };
    
    const onRedactarAlcance = (data: { alcance_tecnico: string; entregables: string; exclusiones: string; condiciones_comerciales: string }) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const onSugerirTarifas = (data: { items: ItemTarifario[] }) => {
        setFormData(prev => ({ ...prev, items: data.items }));
    };

    const SectionHeader = ({ title, section }: { title: string, section: keyof typeof expandedSections }) => (
        <div 
            className="flex items-center justify-between p-4 cursor-pointer bg-slate-50 border-b border-gray-100 rounded-t-xl hover:bg-slate-100 transition-colors"
            onClick={() => toggleSection(section)}
        >
            <h3 className="font-bold text-gray-800">{title}</h3>
            {expandedSections[section] ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
        </div>
    );

    return (
        <div className="flex h-full relative">
            <div className={`flex-1 space-y-6 pb-24 transition-all ${showIA ? 'pr-80' : ''}`}>
                
                {/* Header Actions */}
                <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10 py-4 px-1 -mx-1 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        {formData.id ? `Editar Presupuesto: ${formData.numero_cotizacion || ''}` : 'Nuevo Presupuesto'}
                    </h2>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            className="bg-white border-[#0D9488] text-[#0D9488] hover:bg-[#0D9488] hover:text-white"
                            onClick={() => setShowIA(!showIA)}
                        >
                            <Sparkles className="h-4 w-4 mr-2" />
                            {showIA ? 'Ocultar IA' : 'Asistente IA'}
                        </Button>
                        <Button 
                            variant="outline" 
                            className="bg-white"
                            onClick={handleGenerarPDF}
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Generar PDF
                        </Button>
                        <Button 
                            className="bg-[#060D1A] hover:bg-[#060D1A]/90 text-white"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {isSaving ? 'Guardando...' : 'Guardar Borrador'}
                        </Button>
                    </div>
                </div>

                {/* Sección 1: Datos del Cliente */}
                <Card className="rounded-xl overflow-hidden border-gray-200">
                    <SectionHeader title="1. Datos del Cliente" section="cliente" />
                    {expandedSections.cliente && (
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Nombre del cliente</label>
                                <input
                                    type="text"
                                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none"
                                    value={formData.cliente_nombre || ''}
                                    onChange={(e) => handleChange('cliente_nombre', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">CUIT del cliente</label>
                                <input
                                    type="text"
                                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none"
                                    value={formData.cliente_cuit || ''}
                                    onChange={(e) => handleChange('cliente_cuit', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700">Estado del presupuesto</label>
                                <select
                                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none"
                                    value={formData.estado || 'BORRADOR'}
                                    onChange={(e) => handleChange('estado', e.target.value)}
                                >
                                    <option value="BORRADOR">Borrador</option>
                                    <option value="ENVIADO">Enviado</option>
                                    <option value="ACEPTADO">Aceptado</option>
                                    <option value="RECHAZADO">Rechazado</option>
                                </select>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Sección 2: Recurso Técnico Asignado */}
                <Card className="rounded-xl overflow-hidden border-gray-200">
                    <SectionHeader title="2. Recurso Técnico Asignado" section="recurso" />
                    {expandedSections.recurso && (
                        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Nombre completo</label>
                                <input
                                    type="text"
                                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none"
                                    value={formData.recurso_nombre || ''}
                                    onChange={(e) => handleChange('recurso_nombre', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Título / Cargo</label>
                                <input
                                    type="text"
                                    placeholder="Técnico en Higiene y Seguridad"
                                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none"
                                    value={formData.recurso_cargo || ''}
                                    onChange={(e) => handleChange('recurso_cargo', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Matrícula profesional</label>
                                <input
                                    type="text"
                                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none"
                                    value={formData.recurso_matricula || ''}
                                    onChange={(e) => handleChange('recurso_matricula', e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </Card>

                {/* Sección 3: Modalidad y Dedicación */}
                <Card className="rounded-xl overflow-hidden border-gray-200">
                    <SectionHeader title="3. Modalidad y Dedicación" section="modalidad" />
                    {expandedSections.modalidad && (
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Fecha desde</label>
                                <input
                                    type="date"
                                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none"
                                    value={formData.fecha_desde ? formData.fecha_desde.slice(0, 10) : ''}
                                    onChange={(e) => handleChange('fecha_desde', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Fecha hasta</label>
                                <input
                                    type="date"
                                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none"
                                    value={formData.fecha_hasta ? formData.fecha_hasta.slice(0, 10) : ''}
                                    onChange={(e) => handleChange('fecha_hasta', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Cantidad de jornadas</label>
                                <input
                                    type="number"
                                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none"
                                    value={formData.cantidad_jornadas || ''}
                                    onChange={(e) => handleChange('cantidad_jornadas', Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Horario</label>
                                <input
                                    type="text"
                                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none"
                                    value={formData.horario || ''}
                                    onChange={(e) => handleChange('horario', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700">Lugar de prestación</label>
                                <input
                                    type="text"
                                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none"
                                    value={formData.lugar_prestacion || ''}
                                    onChange={(e) => handleChange('lugar_prestacion', e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </Card>

                {/* Sección 4: Cuadro Tarifario */}
                <Card className="rounded-xl overflow-hidden border-gray-200">
                    <SectionHeader title="4. Cuadro Tarifario" section="tarifario" />
                    {expandedSections.tarifario && (
                        <div className="p-5">
                            <CuadroTarifario 
                                items={formData.items || []} 
                                onChange={(items) => handleChange('items', items)} 
                            />
                        </div>
                    )}
                </Card>

                {/* Sección 5: Contenido del Documento */}
                <Card className="rounded-xl overflow-hidden border-gray-200">
                    <SectionHeader title="5. Contenido del Documento" section="contenido" />
                    {expandedSections.contenido && (
                        <div className="p-5 space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Alcance Técnico</label>
                                <textarea
                                    className="w-full p-3 h-32 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none resize-none"
                                    value={formData.alcance_tecnico || ''}
                                    onChange={(e) => handleChange('alcance_tecnico', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Entregables</label>
                                <textarea
                                    className="w-full p-3 h-24 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none resize-none"
                                    value={formData.entregables || ''}
                                    onChange={(e) => handleChange('entregables', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Exclusiones</label>
                                <textarea
                                    className="w-full p-3 h-24 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none resize-none"
                                    value={formData.exclusiones || ''}
                                    onChange={(e) => handleChange('exclusiones', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Condiciones Comerciales</label>
                                <textarea
                                    className="w-full p-3 h-24 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] outline-none resize-none"
                                    value={formData.condiciones_comerciales || ''}
                                    onChange={(e) => handleChange('condiciones_comerciales', e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* AI Assistant Sidebar */}
            {showIA && (
                <div className="fixed top-0 right-0 h-full z-50 transition-transform">
                    <AsistenteIA 
                        onClose={() => setShowIA(false)} 
                        onCompletar={onCompletar}
                        onRedactarAlcance={onRedactarAlcance}
                        onSugerirTarifas={onSugerirTarifas}
                    />
                </div>
            )}
        </div>
    );
}
