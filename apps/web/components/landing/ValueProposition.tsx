import { Building2, Smartphone, GraduationCap } from 'lucide-react';

export default function ValueProposition() {
    const values = [
        {
            icon: Building2,
            title: "Certificación ANSV Oficial",
            description: "Cumplimos rigurosamente con todas las normativas ANSV, garantizando que tu certificación tenga validez legal en todo el territorio argentino.",
            details: "Disposiciones 380/555/54"
        },
        {
            icon: Smartphone,
            title: "Plataforma Digital Moderna",
            description: "Tecnología educativa de última generación con modalidad 100% online, presencial o mixta. Validación QR instantánea de certificados.",
            details: "Online/Offline + QR"
        },
        {
            icon: GraduationCap,
            title: "Instructores Certificados",
            description: "Equipo de profesionales con más de 15 años de experiencia en capacitación vial y certificación ANSV vigente.",
            details: "+15 años experiencia"
        }
    ];

    return (
        <section className="py-20 bg-[#F7FAFC]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="font-heading font-bold text-4xl md:text-5xl text-[#0A192F] mb-4">
                        ¿Por qué elegir VMP?
                    </h2>
                    <p className="text-xl text-[#4A5568] max-w-3xl mx-auto">
                        La plataforma líder en capacitación vial profesional
                    </p>
                </div>

                {/* Value Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {values.map((value, index) => {
                        const Icon = value.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl border border-gray-200 hover:border-[#FFD700] transition-all duration-300 hover:-translate-y-2"
                            >
                                {/* Icon */}
                                <div className="w-16 h-16 rounded-full bg-[#0A192F]/10 flex items-center justify-center mb-6">
                                    <Icon className="h-8 w-8 text-[#FFD700]" />
                                </div>

                                {/* Content */}
                                <h3 className="font-heading font-bold text-2xl text-[#0A192F] mb-3">
                                    {value.title}
                                </h3>
                                <p className="text-[#4A5568] leading-relaxed mb-4">
                                    {value.description}
                                </p>
                                <div className="inline-block px-4 py-2 bg-[#FFD700]/10 rounded-lg">
                                    <span className="text-sm font-semibold text-[#0A192F]">
                                        {value.details}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-12">
                    <p className="text-lg text-[#2D3748] italic">
                        "Cumplimos rigurosamente con todas las normativas ANSV, garantizando que tu certificación tenga validez legal en todo el territorio argentino."
                    </p>
                </div>
            </div>
        </section>
    );
}
