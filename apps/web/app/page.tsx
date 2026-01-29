import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/landing/Hero';
import { Services } from '@/components/landing/Services';
import { Benefits } from '@/components/landing/Benefits';
import { Testimonials } from '@/components/landing/Testimonials';
import { ContactForm } from '@/components/landing/ContactForm';

export default function HomePage() {
    return (
        <main className="min-h-screen">
            <Header />
            <Hero />
            <Services />
            <Benefits />
            <Testimonials />
            <ContactForm />
            <Footer />
        </main>
    );
}
