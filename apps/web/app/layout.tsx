import type { Metadata } from 'next';
import { Inter, Roboto_Condensed, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const robotoCondensed = Roboto_Condensed({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-roboto-condensed',
    display: 'swap',
});

const outfit = Outfit({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-outfit',
    display: 'swap',
});

export const metadata: Metadata = {
    metadataBase: new URL('https://vmp-edtech.com'),
    title: 'VMP - EDTECH - Capacitación Profesional Certificada',
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
        title: 'VMP - EDTECH - Capacitación Profesional',
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
        <html lang="es" className={`${inter.variable} ${robotoCondensed.variable} ${outfit.variable}`}>
            <body>
                <AuthProvider>
                    {children}
                    <Toaster position="top-right" richColors />
                </AuthProvider>
            </body>
        </html>
    );
}
