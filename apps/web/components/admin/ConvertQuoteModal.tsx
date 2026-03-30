'use client';

import { useState } from 'react';
import { X, Building2, Users, BookOpen, CheckCircle2, Copy, Mail } from 'lucide-react';
import { convertCotizacionToClient, type ConvertCotizacionRequest, type ConvertCotizacionResponse, type CotizacionResponse } from '@/lib/api';

interface ConvertQuoteModalProps {
    cotizacion: CotizacionResponse;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ConvertQuoteModal({
    cotizacion,
    isOpen,
    onClose,
    onSuccess,
}: ConvertQuoteModalProps) {
    const [step, setStep] = useState<'form' | 'loading' | 'success'>('form');
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ConvertCotizacionResponse | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState<ConvertCotizacionRequest>({
        empresaNombre: cotizacion.empresa,
        empresaCuit: '',
        empresaDireccion: '',
        empresaTelefono: cotizacion.telefono,
        cantidadAlumnos: cotizacion.quantity,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setStep('loading');

        try {
            const response = await convertCotizacionToClient(cotizacion.id, formData);
            setResult(response);
            setStep('success');
        } catch (err: any) {
            setError(err.message || 'Error al convertir la cotización');
            setStep('form');
        }
    };

    const handleCopyCredentials = (index: number, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleClose = () => {
        if (step === 'success') {
            onSuccess();
        }
        setStep('form');
        setError(null);
        setResult(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-slate-900">
                        {step === 'success' ? '✅ Conversión Exitosa' : '🔄 Convertir en Cliente'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === 'form' && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Info Box */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-900 mb-2">
                                    📋 Información de la Cotización
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-blue-700 font-medium">Empresa:</span>
                                        <p className="text-blue-900">{cotizacion.empresa}</p>
                                    </div>
                                    <div>
                                        <span className="text-blue-700 font-medium">Contacto:</span>
                                        <p className="text-blue-900">{cotizacion.nombre}</p>
                                    </div>
                                    <div>
                                        <span className="text-blue-700 font-medium">Email:</span>
                                        <p className="text-blue-900">{cotizacion.email}</p>
                                    </div>
                                    <div>
                                        <span className="text-blue-700 font-medium">Teléfono:</span>
                                        <p className="text-blue-900">{cotizacion.telefono}</p>
                                    </div>
                                    <div>
                                        <span className="text-blue-700 font-medium">Curso:</span>
                                        <p className="text-blue-900">{cotizacion.course}</p>
                                    </div>
                                    <div>
                                        <span className="text-blue-700 font-medium">Modalidad:</span>
                                        <p className="text-blue-900">{cotizacion.modality}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Building2 className="w-4 h-4 inline mr-2" />
                                        Nombre de la Empresa *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.empresaNombre}
                                        onChange={(e) => setFormData({ ...formData, empresaNombre: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            CUIT *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="XX-XXXXXXXX-X"
                                            value={formData.empresaCuit}
                                            onChange={(e) => setFormData({ ...formData, empresaCuit: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Teléfono
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.empresaTelefono}
                                            onChange={(e) => setFormData({ ...formData, empresaTelefono: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Dirección
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.empresaDireccion}
                                        onChange={(e) => setFormData({ ...formData, empresaDireccion: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Users className="w-4 h-4 inline mr-2" />
                                        Cantidad de Alumnos *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="500"
                                        value={formData.cantidadAlumnos}
                                        onChange={(e) => setFormData({ ...formData, cantidadAlumnos: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    <p className="text-sm text-slate-700 mt-1">
                                        Se crearán {formData.cantidadAlumnos} alumnos con credenciales temporales
                                    </p>
                                </div>
                            </div>

                            {/* Warning */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-sm text-yellow-800">
                                    <strong>⚠️ Importante:</strong> Esta acción creará:
                                </p>
                                <ul className="list-disc list-inside text-sm text-yellow-800 mt-2 space-y-1">
                                    <li>Una empresa en el sistema</li>
                                    <li>{formData.cantidadAlumnos} alumnos con credenciales temporales</li>
                                    <li>Inscripciones al curso seleccionado</li>
                                    <li>Se enviará un email con las credenciales a {cotizacion.email}</li>
                                </ul>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                                >
                                    Convertir en Cliente
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 'loading' && (
                        <div className="py-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                            <p className="text-slate-800">Creando empresa y alumnos...</p>
                        </div>
                    )}

                    {step === 'success' && result && (
                        <div className="space-y-6">
                            {/* Success Message */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-green-900 mb-2">
                                    ¡Conversión Exitosa!
                                </h3>
                                <p className="text-green-700">{result.message}</p>
                            </div>

                            {/* Company Info */}
                            <div className="bg-slate-50 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 mb-3">
                                    <Building2 className="w-5 h-5 inline mr-2" />
                                    Empresa Creada
                                </h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-slate-800">Nombre:</span>
                                        <p className="font-medium">{result.empresa.nombre}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-800">CUIT:</span>
                                        <p className="font-medium">{result.empresa.cuit}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-slate-800">Email:</span>
                                        <p className="font-medium">{result.empresa.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Credentials */}
                            <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-4">
                                <h4 className="font-semibold text-primary/90 mb-2 flex items-center gap-2">
                                    <Mail className="w-5 h-5" />
                                    Credenciales de Acceso
                                </h4>
                                <p className="text-sm text-primary/80 mb-4">
                                    {result.credenciales.nota}
                                </p>

                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {result.credenciales.alumnos.map((cred, index) => (
                                        <div key={index} className="bg-white rounded-lg p-4 border border-primary/10">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-slate-900">
                                                    Alumno {index + 1}
                                                </span>
                                                <button
                                                    onClick={() => handleCopyCredentials(
                                                        index,
                                                        `Email: ${cred.email}\nContraseña: ${cred.password}`
                                                    )}
                                                    className="text-primary hover:text-primary-dark text-sm flex items-center gap-1"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                    {copiedIndex === index ? 'Copiado!' : 'Copiar'}
                                                </button>
                                            </div>
                                            <div className="space-y-1 text-sm">
                                                <div>
                                                    <span className="text-slate-800">Email:</span>
                                                    <code className="ml-2 bg-slate-100 px-2 py-1 rounded text-xs">
                                                        {cred.email}
                                                    </code>
                                                </div>
                                                <div>
                                                    <span className="text-slate-800">Contraseña:</span>
                                                    <code className="ml-2 bg-slate-100 px-2 py-1 rounded text-xs">
                                                        {cred.password}
                                                    </code>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Email Sent Notice */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    ✉️ Se ha enviado un email a <strong>{result.empresa.email}</strong> con todas las credenciales y las instrucciones de acceso.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={handleClose}
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
