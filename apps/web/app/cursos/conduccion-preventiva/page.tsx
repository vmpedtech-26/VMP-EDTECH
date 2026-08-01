import { Metadata } from 'next';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import CourseDetailView from '@/components/landing/CourseDetailView';
import { courseData } from '@/lib/course-data';

const course = courseData['conduccion-preventiva'];

export const metadata: Metadata = {
    title: `${course.title} | Certificación ANSV VMP-EDTECH Argentina`,
    description: `${course.description} Homologado bajo Disposición ANSV 54/2025 para operarios de flotas en Vaca Muerta, Patagonia y Argentina. Credencial digital QR instantánea.`,
    keywords: [
        'curso conducción preventiva',
        'manejo defensivo argentina',
        'certificación ansv neuquen',
        'capacitación choferes vaca muerta',
        'vmp edtech conducción'
    ],
    openGraph: {
        title: `${course.title} | VMP-EDTECH Argentina`,
        description: course.description,
        images: [course.image],
        type: 'website',
    },
};

const jsonLdCourse = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.longDescription,
    provider: {
        '@type': 'EducationalOrganization',
        name: 'VMP-EDTECH',
        url: 'https://www.vmp-edtech.com',
    },
    educationalCredentialAwarded: {
        '@type': 'EducationalOccupationalCredential',
        name: 'Credencial de Competencia Profesional en Conducción Defensiva ANSV',
        credentialCategory: 'Certificación Profesional Vial',
        validFor: 'P2Y', // 24 meses
        recognizedBy: {
            '@type': 'GovernmentOrganization',
            name: 'Agencia Nacional de Seguridad Vial (ANSV Argentina)',
        },
    },
    hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: ['Online', 'OnSite', 'Blended'],
        instructor: {
            '@type': 'Person',
            name: 'Instructores Certificados VMP',
        },
        location: {
            '@type': 'Place',
            name: 'Plataforma Digital VMP / Presencial In-Company en Argentina',
        },
    },
};

export default function ConduccionPreventivaPage() {
    return (
        <main className="min-h-screen">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCourse) }}
            />
            <Header />
            <CourseDetailView course={course} />
            <Footer />
        </main>
    );
}
