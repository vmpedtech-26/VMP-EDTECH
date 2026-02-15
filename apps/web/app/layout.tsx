import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = 'https://www.vmp-edtech.com';

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: 'VMP - EDTECH | Capacitación Profesional para Conductores',
        template: '%s | VMP - EDTECH',
    },
    description:
        'Plataforma de capacitación profesional con credenciales verificables con código QR. Cursos de Conducción Preventiva, Flota Liviana / Pesada y Doble Tracción.',
    keywords: [
        'capacitación profesional',
        'conducción preventiva',
        'flota liviana',
        'carga pesada',
        'doble tracción',
        'certificación',
        'cursos conductores',
        'seguridad vial',
        'Argentina',
    ],
    authors: [{ name: 'VMP - EDTECH' }],
    openGraph: {
        title: 'VMP - EDTECH | Capacitación Profesional para Conductores',
        description:
            'Cursos certificados de conducción profesional. Credenciales digitales verificables con QR. Modalidad online y presencial.',
        type: 'website',
        url: SITE_URL,
        siteName: 'VMP - EDTECH',
        locale: 'es_AR',
        images: [
            {
                url: '/images/og-image.png',
                width: 1200,
                height: 630,
                alt: 'VMP - EDTECH — Capacitación Profesional para Conductores',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'VMP - EDTECH | Capacitación Profesional',
        description:
            'Cursos certificados de conducción profesional con credenciales verificables.',
        images: ['/images/og-image.png'],
    },
    robots: {
        index: true,
        follow: true,
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
