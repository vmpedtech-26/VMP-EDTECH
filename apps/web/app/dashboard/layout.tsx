'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && user && pathname) {
            // Si el rol es CONTADOR, blindar el panel de capacitación y redirigir
            if (user.rol === 'CONTADOR') {
                const isContabilidad = pathname.startsWith('/dashboard/super/contabilidad');
                const isPerfil = pathname.startsWith('/dashboard/perfil');
                
                if (!isContabilidad && !isPerfil) {
                    router.replace('/dashboard/super/contabilidad');
                }
            }
        }
    }, [user, isLoading, pathname, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    // Evitar parpadeos de rutas restringidas para el contador
    if (user?.rol === 'CONTADOR') {
        const isContabilidad = pathname ? pathname.startsWith('/dashboard/super/contabilidad') : false;
        const isPerfil = pathname ? pathname.startsWith('/dashboard/perfil') : false;
        if (!isContabilidad && !isPerfil) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
            );
        }
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50">
            <Sidebar userRole={(user?.rol || 'ALUMNO') as any} />
            <main className="flex-1 lg:ml-0 overflow-y-auto">
                <div className="p-6 lg:p-8">{children}</div>
            </main>
        </div>
    );
}
