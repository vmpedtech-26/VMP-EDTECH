import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
    metadataBase: new URL('https://www.vmp-edtech.com'),
    title: 'VMP-EDTECH | Capacitación Vial y Seguridad Industrial Homologada Argentina',
    description:
        'Plataforma líder en Argentina de formación vial defensiva y seguridad industrial para flotas operativas de minería, petróleo y energía en Vaca Muerta y Patagonia. Credenciales digitales con verificación QR instantánea ANSV.',
    keywords: [
        'capacitación vial argentina',
        'conducción defensiva vaca meurta',
        'certificación ansv neuquen',
        'conducción alta montaña patagonia',
        'manejo defensivo 4x4 mineria',
        'credencial competencia profesional vial',
        'seguridad e higiene industrial neuquen',
        'disposición ansv 54 2025',
        'vmp servicios edtech'
    ],
    authors: [{ name: 'VMP Servicios EDTECH' }],
    creator: 'VMP Servicios',
    publisher: 'VMP EDTECH',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        title: 'VMP-EDTECH | Capacitación Vial Defensiva y Seguridad Industrial',
        description:
            'Formación profesional homologada ANSV para operarios y flotas de transporte en Vaca Muerta, Patagonia y Argentina. Certificación QR en tiempo real.',
        url: 'https://www.vmp-edtech.com',
        siteName: 'VMP-EDTECH',
        images: [
            {
                url: '/images/og-image.png',
                width: 1200,
                height: 630,
                alt: 'VMP-EDTECH Capacitación Vial Homologada Argentina',
            },
        ],
        locale: 'es_AR',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'VMP-EDTECH | Capacitación Vial y Seguridad Industrial',
        description: 'Capacitación profesional para flotas operativas con certificación ANSV oficial y QR instantáneo.',
        images: ['/images/og-image.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

const jsonLdOrg = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': 'https://www.vmp-edtech.com/#organization',
    name: 'VMP-EDTECH | VMP Servicios',
    url: 'https://www.vmp-edtech.com',
    logo: 'https://www.vmp-edtech.com/images/vmp-logotipo.jpg',
    image: 'https://www.vmp-edtech.com/images/og-image.png',
    description:
        'Institución especializada en capacitación vial, conducción defensiva y seguridad industrial homologada en Argentina (ANSV Disposiciones 380/555/54). Servimos a flotas en Vaca Muerta, Patagonia y toda Latinoamérica.',
    address: {
        '@type': 'PostalAddress',
        addressLocality: 'Neuquén',
        addressRegion: 'Neuquén',
        addressCountry: 'AR',
    },
    areaServed: [
        'Argentina',
        'Neuquén',
        'Río Negro',
        'Santa Cruz',
        'Chubut',
        'Mendoza',
        'Salta',
        'Jujuy',
        'Catamarca',
        'Latinoamérica'
    ],
    contactPoint: {
        '@type': 'ContactPoint',
        email: 'administracion@vmp-edtech.com',
        contactType: 'customer service',
        areaServed: 'AR',
        availableLanguage: ['Spanish']
    },
    sameAs: [
        'https://www.linkedin.com',
        'https://www.instagram.com'
    ]
};

const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: '¿Las certificaciones de VMP-EDTECH tienen validez oficial en Argentina?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Sí, todas nuestras capacitaciones viales y de seguridad cumplen rigurosamente con las disposiciones vigentes de la Agencia Nacional de Seguridad Vial (ANSV) Disposiciones 380/555 y Disposición 54/2025, otorgando credenciales verificables mediante código QR en todo el territorio argentino.'
            }
        },
        {
            '@type': 'Question',
            name: '¿Cómo se verifica la autenticidad de un certificado de VMP?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Cada alumno y chofer capacitado recibe una credencial física/digital con un código QR único. Al escanear el QR o ingresar el código en https://www.vmp-edtech.com/validar, auditores de HSEQ y autoridades verifican en tiempo real la vigencia, nombre del titular y curso aprobado.'
            }
        },
        {
            '@type': 'Question',
            name: '¿Qué modalidades de capacitación ofrece VMP-EDTECH?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Ofrecemos modalidad 100% Online en nuestra plataforma LMS, modalidad Presencial In-Company con simuladores e instructores certificados en campo (Vaca Muerta, yacimientos petroleros y mineros), y modalidad Mixta (Híbrida).'
            }
        },
        {
            '@type': 'Question',
            name: '¿Cuál es la vigencia de las credenciales viales?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Según la normativa ANSV, las credenciales de Conducción Defensiva y Preventiva tienen una vigencia máxima de 24 meses (2 años), requiriendo un curso de renovación periódica obligatoria.'
            }
        }
    ]
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
                />
            </head>
            <body>
                <AuthProvider>
                    {children}
                    <Toaster position="top-right" richColors />
                </AuthProvider>
            </body>
        </html>
    );
}
