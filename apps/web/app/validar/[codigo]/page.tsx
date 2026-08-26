'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Building2, User, Calendar, Award, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { api } from '@/lib/api-client';

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
    status: 'valid' | 'expired' | 'invalid' | 'not_found';
    message?: string;
    credential?: CredentialData;
    signatureValid?: boolean | null;
    signatureStatus?: 'verified' | 'invalid' | 'not_signed';
}

export default function ValidarCredencialPage({ params }: { params: { codigo: string } }) {
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        validateCredential();
    }, [params.codigo]);

    const validateCredential = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const raw = decodeURIComponent(params.codigo).trim().toUpperCase();
            const num = raw.replace('BLT-RT/', '').replace('BLT-RT-', '').replace('VMP-2026-', '').replace('BLT-RT', '');
            const targetCode = raw.includes('VMP-') ? raw : `VMP-2026-${num}`;

            const data = await api.get(`/public/validar/${targetCode}`);
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-brand-legacy animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Validando credencial...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={validateCredential}
                        className="w-full bg-brand-legacy text-white py-3 rounded-lg font-semibold hover:bg-brand-legacy-dark transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    if (!result) return null;

    return (
        <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center justify-center space-x-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-brand-legacy to-brand-legacy-light rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">V</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">VMP - EDTECH</span>
                    </Link>
                    <p className="text-gray-600 mt-2">Validación de Credencial</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header con estado */}
                    <div className={`p-6 ${result.status === 'valid' ? 'bg-green-50 border-b-4 border-green-500' :
                        result.status === 'expired' ? 'bg-yellow-50 border-b-4 border-yellow-500' :
                            result.status === 'invalid' ? 'bg-red-50 border-b-4 border-red-500' :
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
                            {result.status === 'invalid' && (
                                <>
                                    <XCircle className="w-8 h-8 text-red-600" />
                                    <div>
                                        <h2 className="text-2xl font-bold text-red-900">Credencial Inválida</h2>
                                        <p className="text-sm text-red-700">
                                            La firma de esta credencial no coincide con los datos registrados. No la
                                            consideres válida.
                                        </p>
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
                        </div>
                    </div>

                    {/* Contenido */}
                    {result.credential && (
                        <div className="p-8 space-y-6">
                            {/* Número de Credencial */}
                            <div className="text-center pb-6 border-b border-gray-200">
                                <p className="text-sm text-gray-500 uppercase font-semibold mb-2">Número de Credencial</p>
                                <p className="text-3xl font-bold text-brand-legacy">{result.credential.numero}</p>
                            </div>

                            {/* Información del Alumno */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <User className="w-5 h-5 text-brand-legacy" />
                                    <h3 className="font-bold text-gray-900">Información del Titular</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Nombre Completo</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {result.credential.alumno.nombre} {result.credential.alumno.apellido}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">DNI</p>
                                        <p className="text-lg font-semibold text-gray-900">{result.credential.alumno.dni}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Información del Curso */}
                            <div className="bg-brand-legacy/5 rounded-lg p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Award className="w-5 h-5 text-brand-legacy" />
                                    <h3 className="font-bold text-gray-900">Curso Completado</h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Nombre del Curso</p>
                                        <p className="text-lg font-semibold text-gray-900">{result.credential.curso.nombre}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Código</p>
                                        <p className="text-sm text-gray-700">{result.credential.curso.codigo}</p>
                                    </div>
                                    {result.credential.curso.descripcion && (
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Descripción</p>
                                            <p className="text-sm text-gray-700">{result.credential.curso.descripcion}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Información de la Empresa */}
                            {result.credential.empresa && (
                                <div className="bg-blue-50 rounded-lg p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Building2 className="w-5 h-5 text-blue-500" />
                                        <h3 className="font-bold text-gray-900">Empresa</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Razón Social</p>
                                            <p className="text-lg font-semibold text-gray-900">{result.credential.empresa.nombre}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">CUIT</p>
                                            <p className="text-lg font-semibold text-gray-900">{result.credential.empresa.cuit}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Fechas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Fecha de Emisión</p>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {new Date(result.credential.fechaEmision).toLocaleDateString('es-AR', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                            timeZone: 'UTC'
                                        })}
                                    </p>
                                </div>
                                {result.credential.fechaVencimiento && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Fecha de Vencimiento</p>
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {new Date(result.credential.fechaVencimiento).toLocaleDateString('es-AR', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric',
                                                timeZone: 'UTC'
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer de verificación */}
                            <div className="bg-gradient-to-r from-brand-legacy to-brand-legacy-light rounded-lg p-6 text-white text-center">
                                <p className="text-sm font-semibold mb-2">✓ Credencial Verificada por VMP - EDTECH</p>
                                <p className="text-xs opacity-90">
                                    Esta validación fue realizada el {new Date().toLocaleDateString('es-AR')} a las {new Date().toLocaleTimeString('es-AR')}
                                </p>
                                {result.signatureStatus === 'verified' && (
                                    <p className="text-xs opacity-90 mt-2">🔒 Firma criptográfica verificada</p>
                                )}
                                {result.signatureStatus === 'invalid' && (
                                    <p className="text-xs font-semibold mt-2">⚠️ Firma criptográfica no coincide</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-sm text-gray-600 mb-4">
                        ¿Necesitas más información?
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-white text-brand-legacy px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-md"
                    >
                        Volver al Inicio
                    </Link>
                </div>

                {/* Info adicional */}
                <div className="mt-6 text-center text-xs text-gray-500">
                    <p>VMP - EDTECH - Capacitación Profesional</p>
                    <p className="mt-1">
                        Contacto:{' '}
                        <a href="mailto:administracion@vmp-edtech.com" className="text-brand-legacy hover:underline">
                            administracion@vmp-edtech.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
