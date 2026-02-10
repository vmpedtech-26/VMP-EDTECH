import HeroSection from '@/components/landing/HeroSection';
import ValueProposition from '@/components/landing/ValueProposition';
import { Benefits } from '@/components/landing/Benefits';
import CourseCatalog from '@/components/landing/CourseCatalog';
import { CredentialSection } from '@/components/landing/CredentialSection';
import Quoter from '@/components/landing/Quoter';
import { Testimonials } from '@/components/landing/Testimonials';
import FAQ from '@/components/landing/FAQ';
import FinalCTA from '@/components/landing/FinalCTA';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

export default function RootPage() {
    return (
        <main className="min-h-screen">
            <Header />
            <HeroSection />
            <ValueProposition />
            <Benefits />
            <CourseCatalog />
            <CredentialSection />
            <Quoter />
            <Testimonials />
            <FAQ />
            <FinalCTA />
            <Footer />
        </main>
    );
}
