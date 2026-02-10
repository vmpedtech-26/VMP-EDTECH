'use client';

import React, { useState } from 'react';
import {
    Building2,
    Mail,
    Phone,
    MapPin,
    Fingerprint,
    Save,
    Loader2,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface EmpresaFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
    title?: string;
}

export function EmpresaForm({ initialData, onSubmit, onCancel, isLoading, title }: EmpresaFormProps) {
    const [formData, setFormData] = useState({
        nombre: initialData?.nombre || '',
        cuit: initialData?.cuit || '',
        email: initialData?.email || '',
        telefono: initialData?.telefono || '',
        direccion: initialData?.direccion || '',
        activa: initialData?.activa !== undefined ? initialData.activa : true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <Card className="max-w-2xl mx-auto p-0 overflow-hidden border-none shadow-2xl">
            <div className="bg-primary p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Building2 className="h-6 w-6" />
                    <h2 className="text-xl font-bold">{title || 'Datos de la Empresa'}</h2>
                </div>
                {onCancel && (
                    <Button variant="ghost" size="sm" onClick={onCancel} className="text-white hover:bg-white/10">
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            <Building2 className="h-3 w-3" /> Nombre de la Empresa
                        </label>
                        <input
                            required
                            type="text"
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="Ej: Servicios Industriales S.A."
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        />
                    </div>

                    {/* CUIT */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            <Fingerprint className="h-3 w-3" /> CUIT (Solo números)
                        </label>
                        <input
                            required
                            type="text"
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                            placeholder="30-XXXXXXXX-X"
                            value={formData.cuit}
                            onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            <Mail className="h-3 w-3" /> Email de Contacto
                        </label>
                        <input
                            required
                            type="email"
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="administracion@empresa.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    {/* Teléfono */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            <Phone className="h-3 w-3" /> Teléfono
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="+54 11 XXXX-XXXX"
                            value={formData.telefono}
                            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        />
                    </div>
                </div>

                {/* Dirección */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="h-3 w-3" /> Dirección
                    </label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Calle, Número, Localidad, Provincia"
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    />
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="activa"
                            className="h-4 w-4 text-primary rounded border-gray-300 outline-none focus:ring-2 focus:ring-primary/20"
                            checked={formData.activa}
                            onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                        />
                        <label htmlFor="activa" className="text-sm font-medium text-slate-700">Empresa Activa</label>
                    </div>

                    <div className="flex items-center gap-3">
                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                                Cancelar
                            </Button>
                        )}
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                <>
                                    <Save className="h-5 w-5 mr-2" />
                                    {initialData ? 'Actualizar Empresa' : 'Registrar Empresa'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </Card>
    );
}
