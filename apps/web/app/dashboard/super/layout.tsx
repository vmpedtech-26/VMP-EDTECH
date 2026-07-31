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
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isLoading) {
            // Si no está autenticado o su rol no es SUPER_ADMIN ni CONTADOR, redirigir al dashboard general
            if (!user || (user.rol !== 'SUPER_ADMIN' && user.rol !== 'CONTADOR')) {
                router.replace('/dashboard');
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
    }, [user, isLoading, pathname, router, mounted]);

    // Garantizar coherencia del lado del servidor y del cliente durante la hidratación inicial
    if (!mounted || isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm font-semibold text-slate-500">Verificando nivel de acceso administrativo...</p>
            </div>
        );
    }

    // Doble verificación para evitar flashes de contenido no autorizado
    if (!user || (user.rol !== 'SUPER_ADMIN' && user.rol !== 'CONTADOR')) {
        return null;
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
