'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
}

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs: FAQItem[] = [
        {
            question: "¿Los certificados tienen validez en Argentina?",
            answer: "Sí, todos nuestros certificados tienen validez en todo el territorio argentino. Nuestros instructores están certificados profesionalmente y la plataforma cumple con todos los requisitos normativos vigentes."
        },
        {
            question: "¿Cuánto dura la vigencia de la certificación?",
            answer: "La vigencia depende del curso: Conducción Preventiva tiene 12 meses de vigencia, Conducción Flota Liviana / Pesada 24 meses, y Conducción Doble Tracción 36 meses. Es obligatoria la renovación al vencimiento para mantener la certificación activa."
        },
        {
            question: "¿Puedo hacer el curso completamente online?",
            answer: "Sí, ofrecemos modalidad 100% online para Conducción Preventiva y Conducción Flota Liviana / Pesada. El curso de Conducción Doble Tracción requiere práctica presencial obligatoria. También disponemos de modalidad mixta que combina teoría online con práctica presencial."
        },
        {
            question: "¿Ofrecen capacitación in-company?",
            answer: "Sí, ofrecemos programas de capacitación in-company con descuentos especiales para empresas. Podemos adaptar los horarios y contenidos a las necesidades específicas de tu flota. Contáctanos para un presupuesto personalizado."
        },
        {
            question: "¿Qué pasa si un conductor no aprueba el examen?",
            answer: "El conductor puede realizar un examen de recuperación sin costo adicional dentro de los 30 días. Si no aprueba en el segundo intento, deberá volver a cursar el módulo teórico antes de rendir nuevamente."
        },
        {
            question: "¿Cómo verifico la autenticidad de un certificado?",
            answer: "Todos nuestros certificados incluyen un código QR único que permite verificación instantánea. También puedes ingresar el código de 8 dígitos en nuestro validador online en la sección 'Validar Certificación' de esta página."
        },
        {
            question: "¿Tienen descuentos para empresas con flotas grandes?",
            answer: "Sí, ofrecemos descuentos escalonados: 15% para 11-50 conductores, 30% para 51-200 conductores, y 50% para más de 200 conductores. Además, el paquete completo de cursos tiene un 15% de descuento adicional."
        },
        {
            question: "¿Qué requisitos previos necesito?",
            answer: "Para Conducción Preventiva solo necesitas licencia de conducir vigente. Para Conducción Flota Liviana / Pesada se requiere licencia profesional. Para Conducción Doble Tracción se recomienda experiencia previa en conducción off-road, aunque no es obligatorio."
        },
        {
            question: "¿Cuánto tiempo tarda la emisión del certificado?",
            answer: "Una vez aprobado el examen, el certificado digital se emite en 24 horas hábiles. El certificado físico (opcional) se envía por correo y demora 5-7 días hábiles en llegar."
        },
        {
            question: "¿Ofrecen soporte post-capacitación?",
            answer: "Sí, todos nuestros alumnos tienen acceso a soporte técnico por email y WhatsApp durante 6 meses post-certificación. También enviamos actualizaciones sobre cambios normativos relevantes."
        }
    ];

    return (
        <section id="faq" className="py-24 bg-slate-50 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
                        <HelpCircle className="w-3.5 h-3.5 text-primary" />
                        Centro de Ayuda
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold font-heading text-[#0A192F] mb-6">
                        Preguntas Frecuentes
                    </h2>
                    <p className="text-lg text-slate-600">
                        Resolvé tus dudas sobre nuestros cursos y certificaciones
                    </p>
                </motion.div>

                {/* FAQ List */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left group transition-colors"
                            >
                                <span className={`text-lg font-bold transition-colors pr-4 ${openIndex === index ? 'text-primary' : 'text-[#0A192F] group-hover:text-primary'}`}>
                                    {faq.question}
                                </span>
                                <div className={`shrink-0 w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center transition-all duration-300 ${openIndex === index ? 'bg-primary text-white rotate-180 border-primary' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                                    <ChevronDown className="w-5 h-5" />
                                </div>
                            </button>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    >
                                        <div className="px-6 pb-6 text-[#4A5568] leading-relaxed border-t border-slate-50 pt-4">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Support Callout */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-16 p-8 rounded-3xl bg-[#0A192F] text-white text-center relative overflow-hidden group border border-white/5"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-slate-300 mb-4 relative z-10">¿Todavía tenés dudas?</p>
                    <h3 className="text-2xl font-bold mb-6 relative z-10">Nuestro equipo está listo para asesorarte</h3>
                    <a
                        href="/#contacto"
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-[#0A192F] font-bold hover:bg-primary hover:text-white transition-all duration-300 shadow-lg relative z-10"
                    >
                        Contactar Soporte Técnico
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
