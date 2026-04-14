import HeroSection from '@/components/landing/HeroSection';
import ValueProposition from '@/components/landing/ValueProposition';
import { Benefits } from '@/components/landing/Benefits';
import { Alianzas } from '@/components/landing/Alianzas';
import CourseCatalog from '@/components/landing/CourseCatalog';
import { CredentialSection } from '@/components/landing/CredentialSection';
import ContactSection from '@/components/landing/ContactSection';
import { Testimonials } from '@/components/landing/Testimonials';
import FAQ from '@/components/landing/FAQ';
import FinalCTA from '@/components/landing/FinalCTA';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import LegalSection from '@/components/landing/LegalSection';
import { ProfessionalServices } from '@/components/landing/ProfessionalServices';
import AboutUs from '@/components/landing/AboutUs';

export default function LandingPage() {
    return (
        <main className="min-h-screen">
            <Header />
            <HeroSection />
            <CourseCatalog />
            <ProfessionalServices />
            <ValueProposition />
            <AboutUs />
            <Benefits />
            <Alianzas />
            <ContactSection />
            <Testimonials />
            <FAQ />
            <FinalCTA />
            <LegalSection />
            <Footer />
        </main>
    );
}
