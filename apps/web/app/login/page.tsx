'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api-client';

export default function LoginPage() {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [checkingSSO, setCheckingSSO] = useState(false);
    const [ssoDetails, setSsoDetails] = useState<{
        sso_active: boolean;
        domain?: string;
        provider?: string;
        empresa_nombre?: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const checkEmailSSO = async (email: string) => {
        if (!email || !email.includes('@')) return;
        setCheckingSSO(true);
        try {
            const check = await api.post('/auth/sso/check', { email });
            if (check.sso_active) {
                setSsoDetails(check);
            } else {
                setSsoDetails(null);
            }
        } catch (err) {
            console.error('Error checking SSO:', err);
            setSsoDetails(null);
        } finally {
            setCheckingSSO(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (ssoDetails?.sso_active) {
            // Flujo SSO: Redirección al proveedor de identidad
            // Para probar localmente de forma fluida, redirigimos a la ruta callback
            // simulando la autenticación del proveedor
            const callbackUrl = `/sso-callback?code=mock_${formData.email}&provider=${ssoDetails.provider}&domain=${ssoDetails.domain}`;
            window.location.href = callbackUrl;
            return;
        }

        try {
            const response = await api.post('/auth/login', formData);

            // Set cookie for Next.js middleware
            document.cookie = `vmp_token=${response.access_token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days

            // Also save to localStorage for the auth context
            login(response.access_token, response.user);
        } catch (error: any) {
            console.error('Login error:', error);
            setError(error.message || 'Error al iniciar sesión. Verifique sus credenciales.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">V</span>
                    </div>
                    <span className="text-2xl font-bold text-slate-900">VMP - EDTECH</span>
                </Link>

                {/* Login Card */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        Iniciar Sesión
                    </h1>
                    <p className="text-slate-800 mb-6">
                        Accede a tu plataforma de capacitación
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            type="email"
                            label="Email"
                            placeholder="tu@email.com"
                            required
                            value={formData.email}
                            onBlur={() => checkEmailSSO(formData.email)}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                        />

                        {checkingSSO && (
                            <p className="text-xs text-primary animate-pulse">
                                Verificando métodos de acceso...
                            </p>
                        )}

                        {ssoDetails?.sso_active ? (
                            <div className="p-4 bg-primary-light/10 border border-primary-light/20 text-slate-900 rounded-lg space-y-2">
                                <p className="text-sm font-semibold">
                                    ¡SSO Activo con {ssoDetails.empresa_nombre}!
                                </p>
                                <p className="text-xs text-slate-700">
                                    Esta cuenta utiliza el inicio de sesión corporativo ({ssoDetails.provider}). No es necesaria contraseña de VMP.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setSsoDetails(null)}
                                    className="text-xs text-primary underline hover:text-primary-dark block"
                                >
                                    Ingresar con contraseña local en su lugar
                                </button>
                            </div>
                        ) : (
                            <Input
                                type="password"
                                label="Contraseña"
                                placeholder="••••••••"
                                required={!ssoDetails?.sso_active}
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                            />
                        )}

                        {!ssoDetails?.sso_active && (
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" className="rounded" />
                                    <span className="text-slate-700">Recordarme</span>
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-primary hover:underline"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                        )}

                        <Button type="submit" size="lg" className="w-full" disabled={isLoading || checkingSSO}>
                            {isLoading
                                ? 'Procesando...'
                                : ssoDetails?.sso_active
                                ? `Iniciar Sesión con ${ssoDetails.provider}`
                                : 'Iniciar Sesión'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-800">
                        ¿No tenés cuenta?{' '}
                        <Link href="/registro" className="text-primary font-semibold hover:underline">
                            Registrate aquí
                        </Link>
                    </div>
                </div>

                <p className="text-center mt-8 text-sm text-slate-800">
                    ¿Sos una empresa?{' '}
                    <Link href="/#contacto" className="text-primary font-semibold hover:underline">
                        Solicitá una demo
                    </Link>
                </p>
            </div>
        </div>
    );
}
