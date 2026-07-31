import { Metadata } from 'next';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import CourseDetailView from '@/components/landing/CourseDetailView';
import { courseData } from '@/lib/course-data';

const course = courseData['flota-liviana-pesada'];

export const metadata: Metadata = {
    title: course.title,
    description: course.longDescription,
    openGraph: {
        title: `${course.title} | VMP - EDTECH`,
        description: course.description,
        images: [course.image],
    },
};

export default function FlotaLivianaPesadaPage() {
    return (
        <main className="min-h-screen">
            <Header />
            <CourseDetailView course={course} />
            <Footer />
        </main>
    );
}
