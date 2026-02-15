'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
}

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs: FAQItem[] = [
        {
            question: "¿Los certificados tienen validez legal en Argentina?",
            answer: "Sí, todos nuestros certificados tienen validez legal en todo el territorio argentino. Nuestros instructores están certificados profesionalmente y la plataforma cumple con todos los requisitos normativos vigentes."
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
        <section id="faq" className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="font-heading font-bold text-4xl md:text-5xl text-[#0A192F] mb-4">
                        Preguntas Frecuentes
                    </h2>
                    <p className="text-xl text-[#4A5568]">
                        Resolvé tus dudas sobre nuestros cursos y certificaciones
                    </p>
                </div>

                {/* Accordion */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="border-b border-slate-200 pb-4"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-start justify-between text-left py-4 hover:text-[#FFD700] transition-colors group"
                            >
                                <span className="font-heading font-semibold text-lg text-[#0A192F] group-hover:text-[#1E3A5F] pr-8">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`h-6 w-6 text-[#FFD700] flex-shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>
                            {openIndex === index && (
                                <div className="pt-2 pb-4 text-[#4A5568] leading-relaxed animate-fadeIn">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
