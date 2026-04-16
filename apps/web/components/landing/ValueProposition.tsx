

'use client';

import { motion } from 'framer-motion';

export default function ValueProposition() {
    const values = [
        {
            image: "/images/certification.png",
            title: "Certificación Profesional Oficial",
            description: "Cumplimos con las normativas vigentes, garantizando que tu certificación tenga validez y reconocimiento empresarial en todo el territorio argentino.",
            details: "Validez Nacional"
        },
        {
            image: "/images/platform.png",
            title: "Plataforma Digital Moderna",
            description: "Tecnología educativa de última generación con modalidad 100% online, presencial o mixta. Validación QR instantánea de certificados.",
            details: "Online/Offline + QR"
        },
        {
            image: "/images/instructor.png",
            title: "Instructores Certificados",
            description: "Equipo de profesionales con más de 15 años de experiencia en capacitación vial y certificación profesional vigente.",
            details: "+15 años experiencia"
        }
    ];

    const fadeIn = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    return (
        <section className="py-24 bg-gradient-to-br from-slate-50 to-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div 
                    initial={fadeIn.initial}
                    whileInView={fadeIn.whileInView}
                    viewport={fadeIn.viewport}
                    transition={fadeIn.transition}
                    className="text-center mb-16"
                >
                    <h2 className="font-heading font-bold text-4xl md:text-5xl text-slate-900 mb-4">
                        ¿Por qué elegir <span className="gradient-text">VMP - EDTECH</span>?
                    </h2>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                        La plataforma líder en capacitación vial profesional
                    </p>
                </motion.div>

                {/* Value Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {values.map((value, index) => {
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: index * 0.15 }}
                                className="glass-card rounded-2xl p-8 hover:shadow-2xl border border-white/50 hover:border-primary/30 transition-all duration-500 group hover:-translate-y-2 bg-white/70 backdrop-blur-sm"
                            >
                                {/* Image instead of Icon */}
                                <div className="w-20 h-20 rounded-2xl overflow-hidden mb-6 ring-4 ring-primary/5 shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                                    <img 
                                        src={value.image} 
                                        alt={value.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Content */}
                                <h3 className="font-heading font-bold text-2xl text-slate-900 mb-4 group-hover:text-primary transition-colors">
                                    {value.title}
                                </h3>
                                <p className="text-slate-600 leading-relaxed mb-6">
                                    {value.description}
                                </p>
                                <div className="inline-block px-4 py-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                                    <span className="text-sm font-bold text-primary italic">
                                        {value.details}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-16"
                >
                    <p className="text-lg text-slate-500 italic max-w-2xl mx-auto border-t border-slate-100 pt-8">
                        "Cumplimos con los más altos estándares de calidad, garantizando que tu certificación tenga validez y reconocimiento profesional en todo el territorio argentino."
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
