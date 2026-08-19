'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api-client';
import { ssoApi, SsoCheckResponse } from '@/lib/api/sso';

const PROVIDER_LABELS: Record<string, string> = {
    AZURE_AD: 'Microsoft',
    GOOGLE: 'Google',
    OKTA: 'Okta',
};

type Step = 'email' | 'password' | 'sso';

export default function LoginPage() {
    const { login } = useAuth();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [ssoInfo, setSsoInfo] = useState<SsoCheckResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleContinue = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const check = await ssoApi.check(email);
            if (check.sso_active) {
                setSsoInfo(check);
                setStep('sso');
            } else {
                setStep('password');
            }
        } catch {
            // Si falla el chequeo de SSO, no bloqueamos el login normal.
            setStep('password');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post('/auth/login', { email, password });
            document.cookie = `vmp_token=${response.access_token}; path=/; max-age=${60 * 60 * 24 * 7}`;
            login(response.access_token, response.user);
        } catch (error: any) {
            console.error('Login error:', error);
            setError(error.message || 'Error al iniciar sesión. Verifique sus credenciales.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSsoRedirect = () => {
        if (!ssoInfo?.domain) return;
        window.location.href = ssoApi.loginUrl(ssoInfo.domain);
    };

    const resetToEmail = () => {
        setStep('email');
        setPassword('');
        setSsoInfo(null);
        setError(null);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">V</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">VMP - EDTECH</span>
                </Link>

                {/* Login Card */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Iniciar Sesión
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Accede a tu plataforma de capacitación
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    {step === 'email' && (
                        <form onSubmit={handleContinue} className="space-y-6">
                            <Input
                                type="email"
                                label="Email"
                                placeholder="tu@email.com"
                                required
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Verificando...' : 'Continuar'}
                            </Button>
                        </form>
                    )}

                    {step === 'sso' && ssoInfo && (
                        <div className="space-y-6">
                            <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-700">
                                <p>
                                    <strong>{ssoInfo.empresa_nombre}</strong> usa inicio de sesión corporativo.
                                    Vas a continuar con {PROVIDER_LABELS[ssoInfo.provider || ''] || ssoInfo.provider}.
                                </p>
                            </div>
                            <Button type="button" size="lg" className="w-full" onClick={handleSsoRedirect}>
                                Continuar con {PROVIDER_LABELS[ssoInfo.provider || ''] || ssoInfo.provider}
                            </Button>
                            <button
                                type="button"
                                onClick={resetToEmail}
                                className="w-full text-center text-sm text-gray-600 hover:underline"
                            >
                                Usar otro email
                            </button>
                        </div>
                    )}

                    {step === 'password' && (
                        <form onSubmit={handlePasswordLogin} className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{email}</span>
                                <button
                                    type="button"
                                    onClick={resetToEmail}
                                    className="text-xs text-primary hover:underline"
                                >
                                    Cambiar
                                </button>
                            </div>

                            <Input
                                type="password"
                                label="Contraseña"
                                placeholder="••••••••"
                                required
                                autoFocus
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" className="rounded" />
                                    <span className="text-gray-700">Recordarme</span>
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-primary hover:underline"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>

                            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                            </Button>
                        </form>
                    )}

                    <div className="mt-6 text-center text-sm text-gray-600">
                        ¿No tenés cuenta?{' '}
                        <Link href="/registro" className="text-primary font-semibold hover:underline">
                            Registrate aquí
                        </Link>
                    </div>
                </div>

                <p className="text-center mt-8 text-sm text-gray-600">
                    ¿Sos una empresa?{' '}
                    <Link href="/#contacto" className="text-primary font-semibold hover:underline">
                        Solicitá una demo
                    </Link>
                </p>
            </div>
        </div>
    );
}
