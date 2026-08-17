'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

export default function InstructorLayout({
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
        if (mounted && !isLoading) {
            // Solo INSTRUCTOR y SUPER_ADMIN pueden acceder al área de capacitación del instructor.
            if (!user || (user.rol !== 'INSTRUCTOR' && user.rol !== 'SUPER_ADMIN')) {
                router.replace(user ? '/dashboard' : '/login');
            }
        }
    }, [user, isLoading, router, mounted]);

    if (!mounted || isLoading || !user || (user.rol !== 'INSTRUCTOR' && user.rol !== 'SUPER_ADMIN')) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm font-semibold text-slate-500">Accediendo al Panel de Instructor...</p>
            </div>
        );
    }

    return <>{children}</>;
}
