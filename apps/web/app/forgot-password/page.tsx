'use client';

import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Error al procesar la solicitud');
            }

            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Error de conexión. Intenta nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-orange-500 mb-2">
                        🎓 VMP - EDTECH
                    </h1>
                    <p className="text-slate-800">Capacitación Profesional</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {!isSuccess ? (
                        <>
                            {/* Header */}
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                                    <Mail className="w-8 h-8 text-orange-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                    ¿Olvidaste tu contraseña?
                                </h2>
                                <p className="text-slate-800 text-sm">
                                    No te preocupes. Ingresa tu email y te enviaremos un link para restablecer tu contraseña.
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="tu@email.com"
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-sm text-red-800">{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Enviando...
                                        </span>
                                    ) : (
                                        'Enviar Link de Recuperación'
                                    )}
                                </button>
                            </form>

                            {/* Back to Login */}
                            <div className="mt-6 text-center">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 text-sm text-slate-800 hover:text-orange-500 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Volver al inicio de sesión
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Success State */}
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                    ¡Email Enviado!
                                </h2>
                                <p className="text-slate-800 mb-6">
                                    Si el email <strong>{email}</strong> está registrado en nuestro sistema, recibirás un link de recuperación en los próximos minutos.
                                </p>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-blue-800">
                                        <strong>📧 Revisa tu bandeja de entrada</strong>
                                    </p>
                                    <p className="text-sm text-blue-700 mt-2">
                                        Si no recibes el email en 5 minutos, revisa tu carpeta de spam o intenta nuevamente.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            setIsSuccess(false);
                                            setEmail('');
                                        }}
                                        className="w-full bg-slate-100 text-slate-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                                    >
                                        Enviar a otro email
                                    </button>

                                    <Link
                                        href="/login"
                                        className="block w-full text-center py-3 text-orange-500 hover:text-orange-600 font-semibold transition-colors"
                                    >
                                        Volver al inicio de sesión
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-slate-700 mt-6">
                    ¿Necesitas ayuda? Contacta a{' '}
                    <a href="mailto:soporte@vmpservicios.com" className="text-orange-500 hover:underline">
                        soporte@vmpservicios.com
                    </a>
                </p>
            </div>
        </div>
    );
}
