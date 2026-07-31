'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { BookOpen } from 'lucide-react';

export default function ContabilidadLayout({
    children
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isLoading && (!user || (user.rol !== 'SUPER_ADMIN' && user.rol !== 'CONTADOR'))) {
            router.replace('/dashboard');
        }
    }, [user, isLoading, router, mounted]);

    // Garantizar coherencia del lado del servidor y del cliente durante la hidratación inicial
    if (!mounted || isLoading) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
                <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-primary animate-spin"></div>
                <p className="text-sm font-semibold text-slate-500">Verificando credenciales...</p>
            </div>
        );
    }

    if (!user || (user.rol !== 'SUPER_ADMIN' && user.rol !== 'CONTADOR')) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6 p-8 text-center bg-white rounded-3xl border border-slate-100 max-w-xl mx-auto mt-20 shadow-sm animate-fade-in">
                <div className="h-16 w-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                    <BookOpen className="h-8 w-8" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Acceso Restringido</h2>
                    <p className="text-slate-600 font-medium text-sm">
                        No tienes los privilegios necesarios para visualizar el Centro Contable de VMP.
                        Si eres contador de la institución, solicita el alta del rol correspondiente.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
