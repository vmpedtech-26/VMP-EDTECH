'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

function SSOCallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const [status, setStatus] = useState<'loading' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const provider = searchParams.get('provider');
            const domain = searchParams.get('domain');

            if (!code || !provider || !domain) {
                setStatus('error');
                setErrorMessage('Parámetros de autenticación SSO faltantes o inválidos.');
                return;
            }

            try {
                // Intercambiar código por el JWT de VMP
                const response = await api.post('/auth/sso/callback', {
                    code,
                    provider,
                    domain
                });

                // Set cookie for middleware
                document.cookie = `vmp_token=${response.access_token}; path=/; max-age=${60 * 60 * 24 * 7}`;

                // Iniciar sesión en el contexto global
                login(response.access_token, response.user);
            } catch (err: any) {
                console.error('SSO Callback error:', err);
                setStatus('error');
                setErrorMessage(err.message || 'Error al validar las credenciales con el proveedor de identidad.');
            }
        };

        handleCallback();
    }, [searchParams, login, router]);

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Error de Autenticación SSO</h1>
                    <p className="text-slate-600 mb-6 text-sm">{errorMessage}</p>
                    <button 
                        onClick={() => router.push('/login')} 
                        className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                    >
                        Volver al inicio de sesión
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                {/* Spinner animado */}
                <div className="w-16 h-16 border-4 border-primary border-t-transparent border-solid rounded-full animate-spin mx-auto mb-6"></div>
                <h1 className="text-xl font-semibold text-slate-800">Iniciando sesión de forma segura...</h1>
                <p className="text-slate-500 mt-2 text-sm">Conectando con el proveedor de identidad corporativo.</p>
            </div>
        </div>
    );
}

import { Suspense } from 'react';

export default function SSOCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent border-solid rounded-full animate-spin mx-auto mb-6"></div>
                    <h1 className="text-xl font-semibold text-slate-800">Cargando...</h1>
                </div>
            </div>
        }>
            <SSOCallbackHandler />
        </Suspense>
    );
}
