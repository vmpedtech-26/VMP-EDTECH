import HeroSection from '@/components/landing/HeroSection';
import ValueProposition from '@/components/landing/ValueProposition';
import { Benefits } from '@/components/landing/Benefits';
import CourseCatalog from '@/components/landing/CourseCatalog';
import { CredentialSection } from '@/components/landing/CredentialSection';
import ContactSection from '@/components/landing/ContactSection';
import { Testimonials } from '@/components/landing/Testimonials';
import FAQ from '@/components/landing/FAQ';
import FinalCTA from '@/components/landing/FinalCTA';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';


export default function LandingPage() {
    return (
        <main className="min-h-screen">
            <Header />
            <HeroSection />
            <ValueProposition />
            <Benefits />
            <CourseCatalog />
            <CredentialSection />
            <ContactSection />
            <Testimonials />
            <FAQ />
            <FinalCTA />
            <Footer />
        </main>
    );
}
