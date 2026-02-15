import { Building2, Smartphone, GraduationCap } from 'lucide-react';

export default function ValueProposition() {
    const values = [
        {
            icon: Building2,
            title: "Certificación Profesional Oficial",
            description: "Cumplimos con las normativas vigentes, garantizando que tu certificación tenga validez legal y reconocimiento empresarial en todo el territorio argentino.",
            details: "Validez Nacional"
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
            description: "Equipo de profesionales con más de 15 años de experiencia en capacitación vial y certificación profesional vigente.",
            details: "+15 años experiencia"
        }
    ];

    return (
        <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="font-heading font-bold text-4xl md:text-5xl text-slate-900 mb-4">
                        ¿Por qué elegir VMP - EDTECH?
                    </h2>
                    <p className="text-xl text-slate-800 max-w-3xl mx-auto">
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
                                className="glass-card rounded-2xl p-8 hover:shadow-xl border border-white/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2"
                            >
                                {/* Icon */}
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6">
                                    <Icon className="h-8 w-8 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="font-heading font-bold text-2xl text-slate-900 mb-3">
                                    {value.title}
                                </h3>
                                <p className="text-slate-800 leading-relaxed mb-4">
                                    {value.description}
                                </p>
                                <div className="inline-block px-4 py-2 bg-primary/10 rounded-lg">
                                    <span className="text-sm font-semibold text-primary">
                                        {value.details}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-12">
                    <p className="text-lg text-slate-800 italic">
                        "Cumplimos con los más altos estándares de calidad, garantizando que tu certificación tenga validez legal y reconocimiento profesional en todo el territorio argentino."
                    </p>
                </div>
            </div>
        </section>
    );
}
