import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import CourseCatalog from '@/components/landing/CourseCatalog';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata = {
    title: 'Catálogo de Cursos | VMP Servicios',
    description: 'Explora nuestra amplia oferta de cursos de capacitación vial profesional con validez nacional.',
};

export default function CursosPage() {
    return (
        <main className="min-h-screen">
            <Header />

            <div className="pt-24 pb-12 bg-background-light">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeader
                        title="Catálogo de Cursos"
                        subtitle="Capacitación profesional para conductores y empresas del sector industrial y vial."
                        centered
                    />
                </div>
            </div>

            <CourseCatalog />

            <section className="py-16 bg-white border-t">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">¿Buscás capacitación corporativa?</h2>
                    <p className="text-xl text-slate-800 mb-8 max-w-2xl mx-auto">
                        Ofrecemos planes especiales para empresas, con seguimiento detallado de alumnos y facturación corporativa.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href="/#contacto" className="btn-primary">
                            Consultar para mi Empresa
                        </a>
                        <a href="/#contacto" className="btn-secondary">
                            Contactar a Ventas
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
