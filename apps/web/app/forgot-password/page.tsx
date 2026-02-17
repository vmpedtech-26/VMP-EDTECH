'use client';

import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api-client';
import Link from 'next/link';



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
            await api.post('/auth/forgot-password', { email });
            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Error al procesar la solicitud');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary mb-2">
                        VMP - EDTECH
                    </h1>
                    <p className="text-slate-800 font-medium">Capacitación Profesional</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                    {!isSuccess ? (
                        <>
                            {/* Header */}
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                                    <Mail className="w-8 h-8 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                    ¿Olvidaste tu contraseña?
                                </h2>
                                <p className="text-slate-600 text-sm">
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
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="tu@email.com"
                                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-900"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                                        <p className="text-sm text-red-600 font-medium text-center">{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-[0.98]"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Volver al inicio de sesión
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Success State */}
                            <div className="text-center animate-in zoom-in duration-300">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-success" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                    ¡Email Enviado!
                                </h2>
                                <p className="text-slate-600 mb-6">
                                    Si el email <strong className="text-slate-900">{email}</strong> está registrado, recibirás un link de recuperación pronto.
                                </p>

                                <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-primary font-bold">
                                        📧 Revisa tu bandeja de entrada
                                    </p>
                                    <p className="text-xs text-slate-600 mt-2">
                                        Si no lo encuentras, revisa tu carpeta de spam o intenta nuevamente en unos minutos.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            setIsSuccess(false);
                                            setEmail('');
                                        }}
                                        className="w-full bg-slate-50 text-slate-600 py-3 rounded-lg font-bold hover:bg-slate-100 transition-colors border border-slate-200"
                                    >
                                        Enviar a otro email
                                    </button>

                                    <Link
                                        href="/login"
                                        className="block w-full text-center py-2 text-primary hover:text-primary-dark font-bold transition-colors"
                                    >
                                        Volver al inicio de sesión
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-slate-500 mt-6">
                    ¿Necesitas ayuda? Contacta a{' '}
                    <a href="mailto:soporte@vmp-edtech.com.ar" className="text-primary hover:underline font-semibold">
                        soporte@vmp-edtech.com.ar
                    </a>
                </p>
            </div>
        </div>
    );
}
