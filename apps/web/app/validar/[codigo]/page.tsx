'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Building2, User, Calendar, Award, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { API_URL } from '@/lib/api-client';

interface CredentialData {
    numero: string;
    fechaEmision: string;
    fechaVencimiento: string | null;
    alumno: {
        nombre: string;
        apellido: string;
        dni: string;
    };
    curso: {
        nombre: string;
        codigo: string;
        descripcion: string;
    };
    empresa: {
        nombre: string;
        cuit: string;
    } | null;
}

interface ValidationResult {
    valid: boolean;
    status: 'valid' | 'expired' | 'not_found' | 'invalid_signature';
    signatureValid?: boolean;
    signatureStatus?: 'verified' | 'missing' | 'invalid';
    message?: string;
    credential?: CredentialData;
}

export default function ValidarCredencialPage({ params }: { params: Promise<{ codigo: string }> }) {
    const resolvedParams = React.use(params);
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        validateCredential();
    }, [resolvedParams.codigo]);

    const validateCredential = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/api/public/validar/${resolvedParams.codigo}`);

            if (!response.ok) {
                throw new Error('Error al validar la credencial');
            }

            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-slate-800">Validando credencial...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Error</h2>
                    <p className="text-slate-800 mb-6">{error}</p>
                    <button
                        onClick={validateCredential}
                        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    if (!result) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary mb-2">
                        🎓 VMP - EDTECH
                    </h1>
                    <p className="text-slate-800">Validación de Credencial</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header con estado */}
                    <div className={`p-6 ${result.status === 'valid' ? 'bg-green-50 border-b-4 border-green-500' :
                        result.status === 'expired' ? 'bg-yellow-50 border-b-4 border-yellow-500' :
                            'bg-red-50 border-b-4 border-red-500'
                        }`}>
                        <div className="flex items-center justify-center gap-3">
                            {result.status === 'valid' && (
                                <>
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                    <div>
                                        <h2 className="text-2xl font-bold text-green-900">Credencial Válida</h2>
                                        <p className="text-sm text-green-700">Esta credencial está activa y verificada</p>
                                    </div>
                                </>
                            )}
                            {result.status === 'expired' && (
                                <>
                                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                                    <div>
                                        <h2 className="text-2xl font-bold text-yellow-900">Credencial Expirada</h2>
                                        <p className="text-sm text-yellow-700">Esta credencial ha vencido</p>
                                    </div>
                                </>
                            )}
                            {result.status === 'not_found' && (
                                <>
                                    <XCircle className="w-8 h-8 text-red-600" />
                                    <div>
                                        <h2 className="text-2xl font-bold text-red-900">Credencial No Encontrada</h2>
                                        <p className="text-sm text-red-700">{result.message}</p>
                                    </div>
                                </>
                            )}
                            {result.status === 'invalid_signature' && (
                                <>
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                    <div>
                                        <h2 className="text-2xl font-bold text-red-950">Firma Criptográfica Inválida</h2>
                                        <p className="text-sm text-red-700 font-semibold">Este certificado ha sido alterado o manipulado de forma fraudulenta.</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Contenido */}
                    {result.credential && (
                        <div className="p-8 space-y-6">
                            {/* Número de Credencial */}
                            <div className="text-center pb-6 border-b border-slate-200">
                                <p className="text-sm text-slate-700 uppercase font-semibold mb-2">Número de Credencial</p>
                                <p className="text-3xl font-bold text-primary">{result.credential.numero}</p>
                            </div>

                            {/* Información del Alumno */}
                            <div className="bg-slate-50 rounded-lg p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <User className="w-5 h-5 text-primary" />
                                    <h3 className="font-bold text-slate-900">Información del Titular</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-700 uppercase font-semibold">Nombre Completo</p>
                                        <p className="text-lg font-semibold text-slate-900">
                                            {result.credential.alumno.nombre} {result.credential.alumno.apellido}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-700 uppercase font-semibold">DNI</p>
                                        <p className="text-lg font-semibold text-slate-900">{result.credential.alumno.dni}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Información del Curso */}
                            <div className="bg-primary/5 rounded-lg p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Award className="w-5 h-5 text-primary" />
                                    <h3 className="font-bold text-slate-900">Curso Completado</h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-slate-700 uppercase font-semibold">Nombre del Curso</p>
                                        <p className="text-lg font-semibold text-slate-900">{result.credential.curso.nombre}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-700 uppercase font-semibold">Código</p>
                                        <p className="text-sm text-slate-700">{result.credential.curso.codigo}</p>
                                    </div>
                                    {result.credential.curso.descripcion && (
                                        <div>
                                            <p className="text-xs text-slate-700 uppercase font-semibold">Descripción</p>
                                            <p className="text-sm text-slate-700">{result.credential.curso.descripcion}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Información de la Empresa */}
                            {result.credential.empresa && (
                                <div className="bg-blue-50 rounded-lg p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Building2 className="w-5 h-5 text-blue-500" />
                                        <h3 className="font-bold text-slate-900">Empresa</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-slate-700 uppercase font-semibold">Razón Social</p>
                                            <p className="text-lg font-semibold text-slate-900">{result.credential.empresa.nombre}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-700 uppercase font-semibold">CUIT</p>
                                            <p className="text-lg font-semibold text-slate-900">{result.credential.empresa.cuit}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Fechas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4 text-slate-700" />
                                        <p className="text-xs text-slate-700 uppercase font-semibold">Fecha de Emisión</p>
                                    </div>
                                    <p className="text-lg font-semibold text-slate-900">
                                        {new Date(result.credential.fechaEmision).toLocaleDateString('es-AR', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                {result.credential.fechaVencimiento && (
                                    <div className="bg-slate-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4 text-slate-700" />
                                            <p className="text-xs text-slate-700 uppercase font-semibold">Fecha de Vencimiento</p>
                                        </div>
                                        <p className="text-lg font-semibold text-slate-900">
                                            {new Date(result.credential.fechaVencimiento).toLocaleDateString('es-AR', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>

                             {/* Footer de verificación y firma criptográfica */}
                             {result.signatureStatus === 'verified' && (
                                 <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white rounded-2xl p-6 shadow-lg border border-emerald-500/20 text-center relative overflow-hidden animate-pulse-slow">
                                     <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full transform translate-x-8 -translate-y-8 pointer-events-none" />
                                     <p className="text-base font-bold mb-1 tracking-wider flex items-center justify-center gap-1.5">
                                         🛡️ FIRMA CRIPTOGRÁFICA VERIFICADA
                                     </p>
                                     <p className="text-xs opacity-90 max-w-md mx-auto">
                                         Integridad de registro auditada exitosamente mediante firma inmutable del servidor. El certificado coincide al 100% con los registros de VMP - EDTECH.
                                     </p>
                                     <p className="text-[10px] opacity-75 mt-3">
                                         Validado el {new Date().toLocaleDateString('es-AR')} a las {new Date().toLocaleTimeString('es-AR')}
                                     </p>
                                 </div>
                             )}
                             
                             {result.signatureStatus === 'missing' && (
                                 <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl p-6 text-white text-center">
                                     <p className="text-sm font-semibold mb-2">✓ Credencial Verificada por VMP - EDTECH</p>
                                     <p className="text-xs opacity-95">
                                         Esta validación fue realizada el {new Date().toLocaleDateString('es-AR')} a las {new Date().toLocaleTimeString('es-AR')}
                                     </p>
                                 </div>
                             )}

                             {result.signatureStatus === 'invalid' && (
                                 <div className="bg-gradient-to-br from-red-900 to-red-950 text-white rounded-2xl p-6 shadow-lg border border-red-500/30 text-center">
                                     <p className="text-base font-bold mb-1 tracking-wider">
                                         ⚠️ ERROR DE INTEGRIDAD - ALERTA
                                     </p>
                                     <p className="text-xs opacity-90 max-w-md mx-auto">
                                         La firma criptográfica calculada no coincide con el registro original. Esta credencial puede haber sido alterada externamente o deshabilitada.
                                     </p>
                                     <p className="text-[10px] opacity-75 mt-3">
                                         Fecha de auditoría: {new Date().toLocaleDateString('es-AR')}
                                     </p>
                                 </div>
                             )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-sm text-slate-800 mb-4">
                        ¿Necesitas más información?
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors shadow-md"
                    >
                        Volver al Inicio
                    </Link>
                </div>

                {/* Info adicional */}
                <div className="mt-6 text-center text-xs text-slate-700">
                    <p>VMP - EDTECH - Capacitación Profesional</p>
                    <p className="mt-1">
                        Contacto:{' '}
                        <a href="mailto:soporte@vmp-edtech.com.ar" className="text-primary hover:underline">
                            soporte@vmp-edtech.com.ar
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
