'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

export default function SuperLayout({
    children
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading, switchRole } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isLoading) {
            // Si el usuario no tiene rol SUPER_ADMIN ni CONTADOR (por ejemplo si tenía guardado ALUMNO en localStorage),
            // conmutamos automáticamente al modo SUPER_ADMIN para permitir acceso inmediato al sistema completo.
            if (!user || (user.rol !== 'SUPER_ADMIN' && user.rol !== 'CONTADOR')) {
                switchRole('SUPER_ADMIN');
                return;
            }

            // Si es CONTADOR, solo puede acceder a la subruta de contabilidad
            if (user.rol === 'CONTADOR') {
                const isContabilidadRoute = pathname ? pathname.startsWith('/dashboard/super/contabilidad') : false;
                if (!isContabilidadRoute) {
                    router.replace('/dashboard/super/contabilidad');
                }
            }
        }
    }, [user, isLoading, pathname, router, mounted, switchRole]);

    // Garantizar coherencia del lado del servidor y del cliente durante la hidratación inicial
    if (!mounted || isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm font-semibold text-slate-500">Accediendo a la Plataforma SuperAdmin & Contabilidad...</p>
            </div>
        );
    }

    if (user.rol === 'CONTADOR' && (!pathname || !pathname.startsWith('/dashboard/super/contabilidad'))) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm font-semibold text-slate-500">Redirigiendo a tu panel contable...</p>
            </div>
        );
    }

    return <>{children}</>;
}
