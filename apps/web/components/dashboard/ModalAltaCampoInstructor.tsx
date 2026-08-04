'use client';

import React, { useState } from 'react';
import {
    X,
    UserPlus,
    CheckCircle2,
    Building2,
    ShieldCheck,
    Loader2,
    GraduationCap,
    Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { usersApi } from '@/lib/api/users';

interface ModalAltaCampoInstructorProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const EMPRESAS_OPCIONES = [
    { id: 'oldelval', nombre: 'Oleoductos del Valle (Oldelval)' },
    { id: 'tgs', nombre: 'Transportadora de Gas del Sur (TGS)' },
    { id: 'coivalsa', nombre: 'Coivalsa S.A.' },
    { id: 'yaccos', nombre: 'Transporte Yaccos' },
    { id: 'particular', nombre: 'Particular / Contratista Independiente' },
];

const CURSOS_OPCIONES = [
    'Conducción Preventiva',
    'Conducción Invernal (Patagonia / Vaca Muerta)',
    'Operación 4x4 Doble Tracción',
    'Gestión de Flota Liviana y Pesada',
    'Conducción Segura y Renovaciones',
    'Trabajo en Altura',
];

export function ModalAltaCampoInstructor({
    isOpen,
    onClose,
    onSuccess
}: ModalAltaCampoInstructorProps) {
    const [formData, setFormData] = useState({
        dni: '',
        nombre: '',
        apellido: '',
        empresaId: 'oldelval',
        cursoNombre: 'Conducción Preventiva',
        telefono: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusMessage(null);

        const dniLimpio = formData.dni.replace(/\D/g, '');
        const emailAuto = `${dniLimpio}@vmp-edtech.com`;

        try {
            await usersApi.crearUsuario({
                dni: dniLimpio,
                nombre: formData.nombre.trim(),
                apellido: formData.apellido.trim(),
                email: emailAuto,
                telefono: formData.telefono.trim(),
                empresaId: formData.empresaId,
                rol: 'ALUMNO',
            });

            setStatusMessage(`¡Alumno ${formData.nombre} ${formData.apellido} (DNI ${dniLimpio}) dado de alta correctamente!`);
            
            setTimeout(() => {
                onSuccess();
                onClose();
                setFormData({
                    dni: '',
                    nombre: '',
                    apellido: '',
                    empresaId: 'oldelval',
                    cursoNombre: 'Conducción Preventiva',
                    telefono: '',
                });
                setStatusMessage(null);
            }, 1200);
        } catch (error: any) {
            console.error('Error al crear alumno en campo:', error);
            setStatusMessage(error.message || 'Error al registrar alumno en el sistema.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col">
                
                {/* Header */}
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-primary/20 rounded-xl text-primary-light">
                            <Smartphone className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Alta Rápida de Campo (Instructor)</h2>
                            <p className="text-xs text-gray-300">Registra un conductor al instante durante capacitaciones presenciales.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-xl flex items-center space-x-3">
                        <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                        <p className="text-xs text-blue-800 font-medium">
                            Solo requiere <strong>DNI, Nombre y Apellido</strong>. La cuenta y credencial se habilitan al instante.
                        </p>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-700">DNI / Documento (*)</label>
                        <input
                            type="text"
                            required
                            placeholder="Ej: 38123456"
                            value={formData.dni}
                            onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-gray-700">Nombre (*)</label>
                            <input
                                type="text"
                                required
                                placeholder="Juan"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-gray-700">Apellido (*)</label>
                            <input
                                type="text"
                                required
                                placeholder="Pérez"
                                value={formData.apellido}
                                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-gray-700">Empresa Contratante</label>
                            <select
                                value={formData.empresaId}
                                onChange={(e) => setFormData({ ...formData, empresaId: e.target.value })}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            >
                                {EMPRESAS_OPCIONES.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-gray-700">Curso en Campo</label>
                            <select
                                value={formData.cursoNombre}
                                onChange={(e) => setFormData({ ...formData, cursoNombre: e.target.value })}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            >
                                {CURSOS_OPCIONES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {statusMessage && (
                        <div className="p-3 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>{statusMessage}</span>
                        </div>
                    )}

                    {/* Submit Actions */}
                    <div className="pt-3 flex space-x-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 bg-white border-gray-200 text-gray-700"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Registrando...
                                </>
                            ) : (
                                'Registrar e Inscribir'
                            )}
                        </Button>
                    </div>
                </form>

            </div>
        </div>
    );
}
