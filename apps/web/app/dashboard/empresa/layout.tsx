'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

export default function EmpresaLayout({
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

    const hasAccess = (u: typeof user) =>
        !!u && (u.rol === 'SUPER_ADMIN' || u.rol === 'INSTRUCTOR' || !!u.empresaId);

    useEffect(() => {
        if (mounted && !isLoading) {
            if (!user) {
                router.replace('/auth/login');
                return;
            }
            if (!hasAccess(user)) {
                router.replace('/dashboard');
            }
        }
    }, [user, isLoading, router, mounted]);

    if (!mounted || isLoading || !user || !hasAccess(user)) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm font-semibold text-slate-500">Accediendo al Panel de Empresa...</p>
            </div>
        );
    }

    return <>{children}</>;
}
