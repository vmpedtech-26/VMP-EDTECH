'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/auth/login');
        }
    }, [isLoading, user, router]);

    if (isLoading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-background-light">
            <Sidebar userRole={user.rol as any} />
            <main className="flex-1 lg:ml-0 overflow-y-auto">
                <div className="p-6 lg:p-8">{children}</div>
            </main>
        </div>
    );
}
