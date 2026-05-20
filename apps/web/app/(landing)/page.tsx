import dynamic from 'next/dynamic';
import { CredentialSection } from '@/components/landing/CredentialSection';
import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import CourseCatalog from '@/components/landing/CourseCatalog';
import Footer from '@/components/landing/Footer';
const ProfessionalServices = dynamic(() => import('@/components/landing/ProfessionalServices').then(mod => mod.ProfessionalServices));
const ValueProposition = dynamic(() => import('@/components/landing/ValueProposition'));
const AboutUs = dynamic(() => import('@/components/landing/AboutUs'));
const Benefits = dynamic(() => import('@/components/landing/Benefits').then(mod => mod.Benefits));
const Alianzas = dynamic(() => import('@/components/landing/Alianzas').then(mod => mod.Alianzas));
const ContactSection = dynamic(() => import('@/components/landing/ContactSection'));
const Testimonials = dynamic(() => import('@/components/landing/Testimonials').then(mod => mod.Testimonials));
const FAQ = dynamic(() => import('@/components/landing/FAQ'));
const FinalCTA = dynamic(() => import('@/components/landing/FinalCTA'));
const LegalSection = dynamic(() => import('@/components/landing/LegalSection'));

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
            {/* <CredentialSection /> */}
            <ContactSection />
            <Testimonials />
            <FAQ />
            <FinalCTA />
            <LegalSection />
            <Footer />
        </main>
    );
}
