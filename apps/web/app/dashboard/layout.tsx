'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { NotificationBell } from '@/components/layout/NotificationBell';
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
            router.replace('/login');
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
                <div className="sticky top-0 z-40 flex items-center justify-end px-6 lg:px-8 py-3 bg-white/80 backdrop-blur-md border-b border-gray-100">
                    <NotificationBell />
                </div>
                <div className="p-6 lg:p-8">{children}</div>
            </main>
        </div>
    );
}
