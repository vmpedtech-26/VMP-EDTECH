import React from 'react';

interface JsonLdProps {
    type?: 'Organization' | 'Course' | 'BreadcrumbList';
    courseData?: {
        name: string;
        description: string;
        code: string;
        durationHours: number;
        provider?: string;
        url?: string;
    };
    breadcrumbs?: Array<{ name: string; url: string }>;
}

export default function JsonLd({ type = 'Organization', courseData, breadcrumbs }: JsonLdProps) {
    const siteUrl = 'https://www.vmp-edtech.com';

    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': ['Organization', 'EducationalOrganization', 'ProfessionalService'],
        '@id': `${siteUrl}/#organization`,
        name: 'VMP - EDTECH',
        alternateName: 'VMP - EDTECH Capacitación Vial y Seguridad Industrial',
        url: siteUrl,
        logo: `${siteUrl}/images/vmp_official.png`,
        image: `${siteUrl}/images/og-image.png`,
        description: 'Plataforma líder en Argentina y Latinoamérica de capacitación vial profesional y consultoría técnica en Seguridad e Higiene con credenciales verificables mediante código QR.',
        telephone: '+5492994123456',
        email: 'contacto@vmp-edtech.com',
        sameAs: [
            'https://www.instagram.com/vmpedtech',
            'https://www.linkedin.com/company/vmp-edtech'
        ],
        address: [
            {
                '@type': 'PostalAddress',
                streetAddress: 'Parque Industrial Neuquén / Vaca Muerta',
                addressLocality: 'Neuquén',
                addressRegion: 'Neuquén',
                postalCode: '8300',
                addressCountry: 'AR'
            },
            {
                '@type': 'PostalAddress',
                streetAddress: 'Av. Corrientes 1234',
                addressLocality: 'Ciudad Autónoma de Buenos Aires',
                addressRegion: 'CABA',
                postalCode: 'C1043',
                addressCountry: 'AR'
            },
            {
                '@type': 'PostalAddress',
                streetAddress: 'Río Gallegos / Zona Operativa',
                addressLocality: 'Río Gallegos',
                addressRegion: 'Santa Cruz',
                postalCode: '9400',
                addressCountry: 'AR'
            }
        ],
        geo: {
            '@type': 'GeoCoordinates',
            latitude: -38.9516,
            longitude: -68.0591
        },
        areaServed: [
            { '@type': 'Country', name: 'Argentina' },
            { '@type': 'Country', name: 'Chile' },
            { '@type': 'Country', name: 'Perú' },
            { '@type': 'Country', name: 'Colombia' }
        ],
        knowsAbout: [
            'Conducción Defensiva y Preventiva',
            'Seguridad e Higiene Industrial',
            'Transporte de Cargas Pesadas y Peligrosas',
            'Normativa Vial Argentina y Latinoamericana',
            'Validación Digital Criptográfica de Credenciales'
        ]
    };

    let schemaToRender: any = organizationSchema;

    if (type === 'Course' && courseData) {
        schemaToRender = {
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: courseData.name,
            description: courseData.description,
            courseCode: courseData.code,
            provider: {
                '@type': 'Organization',
                name: courseData.provider || 'VMP - EDTECH',
                sameAs: siteUrl
            },
            hasCourseInstance: {
                '@type': 'CourseInstance',
                courseMode: ['online', 'onsite', 'blended'],
                duration: `PT${courseData.durationHours}H`,
                courseWorkload: `PT${courseData.durationHours}H`,
                instructor: {
                    '@type': 'Organization',
                    name: 'Cuerpo de Instructores Certificados VMP'
                }
            }
        };
    } else if (type === 'BreadcrumbList' && breadcrumbs) {
        schemaToRender = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`
            }))
        };
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaToRender) }}
        />
    );
}
