'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, XCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ssoApi } from '@/lib/api/sso';

function SsoCallbackContent() {
    const params = useSearchParams();
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [attempted, setAttempted] = useState(false);

    useEffect(() => {
        if (attempted) return;
        setAttempted(true);

        const providerError = params.get('error_description') || params.get('error');
        const code = params.get('code');
        const state = params.get('state');

        if (providerError) {
            setError(providerError);
            return;
        }

        if (!code || !state) {
            setError('Falta el código de autorización devuelto por el proveedor de identidad.');
            return;
        }

        (async () => {
            try {
                const response = await ssoApi.completeCallback(code, state);
                document.cookie = `vmp_token=${response.access_token}; path=/; max-age=${60 * 60 * 24 * 7}`;
                login(response.access_token, response.user);
            } catch (err: any) {
                setError(err.message || 'No se pudo completar el inicio de sesión con SSO.');
            }
        })();
    }, [params, attempted, login]);

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
                <XCircle className="h-12 w-12 text-red-500" />
                <p className="text-slate-700 font-semibold max-w-md">{error}</p>
                <a href="/login" className="text-primary hover:underline text-sm">
                    Volver a iniciar sesión
                </a>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-slate-500 text-sm font-semibold">Completando inicio de sesión...</p>
        </div>
    );
}

export default function SsoCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
            }
        >
            <SsoCallbackContent />
        </Suspense>
    );
}
