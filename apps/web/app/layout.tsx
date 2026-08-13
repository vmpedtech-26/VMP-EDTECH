import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    metadataBase: new URL('https://vmp-edtech.com'),
    title: 'VMP EdTech - Capacitación Profesional Certificada',
    description:
        'Plataforma de capacitación profesional con credenciales verificables con código QR. Cursos teórico-prácticos con validez industrial.',
    keywords: [
        'capacitación',
        'certificación',
        'profesional',
        'industrial',
        'empresas',
        'cursos',
    ],
    openGraph: {
        title: 'VMP EdTech - Capacitación Profesional',
        description:
            'Capacitación profesional con credenciales digitales verificables.',
        type: 'website',
        url: 'https://vmp-edtech.com',
    },
};

import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'sonner';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body>
                <AuthProvider>
                    {children}
                    <Toaster position="top-right" richColors />
                </AuthProvider>
            </body>
        </html>
    );
}
