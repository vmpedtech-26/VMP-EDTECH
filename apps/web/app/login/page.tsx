'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

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
                <Link href="/" className="flex items-center justify-center space-x-3 mb-8">
                    <Image
                        src="/images/vmp-isotipo.png"
                        alt="VMP"
                        width={48}
                        height={48}
                        className="rounded-lg"
                    />
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
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                        />

                        <Input
                            type="password"
                            label="Contraseña"
                            placeholder="••••••••"
                            required
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                        />

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

                        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
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
