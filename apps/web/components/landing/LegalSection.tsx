'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const sections = [
    {
        id: 'datos',
        title: 'Protección de Datos Personales',
        badge: 'Ley 25.326',
        content: [
            {
                subtitle: 'Tratamiento de Datos',
                text: 'VMP-EDTECH S.R.L. (CUIT 30-71936908-8), con domicilio en Juan B. Justo 385, Piso 1, Neuquén (8300), actúa en carácter de responsable del archivo, registro, base o banco de datos personales, conforme lo establece la Ley N.º 25.326 de Protección de los Datos Personales y su Decreto Reglamentario N.º 1558/2001. Los datos personales recabados a través del presente sitio web serán incorporados a una base de datos registrada ante la Agencia de Acceso a la Información Pública (AAIP) y serán tratados con estricta confidencialidad, con la finalidad de proveer los servicios de capacitación solicitados, emitir certificaciones, gestionar la relación contractual y cumplir con obligaciones fiscales y administrativas derivadas de la misma.'
            },
            {
                subtitle: 'Derechos de los Titulares',
                text: 'El titular de los datos personales tiene derecho a ejercer, en forma gratuita, los derechos de acceso, rectificación, actualización y supresión de sus datos, conforme a lo previsto en los artículos 14 a 17 de la Ley 25.326. La solicitud deberá cursarse por escrito al correo electrónico info@vmp-edtech.com, adjuntando acreditación de identidad suficiente. La AAIP, Órgano de Control de la Ley 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos.'
            }
        ]
    },
    {
        id: 'terminos',
        title: 'Términos y Condiciones del Servicio',
        badge: 'CCC Arts. 957–1091',
        content: [
            {
                subtitle: 'Naturaleza Contractual',
                text: 'La utilización del presente sitio web y/o la contratación de cualquier servicio de capacitación ofrecido por VMP-EDTECH implica la aceptación plena e incondicional de los presentes Términos y Condiciones, los cuales revisten el carácter de condiciones generales del contrato en los términos del artículo 984 y siguientes del Código Civil y Comercial de la Nación (Ley N.º 26.994). Las partes convienen que la aceptación de estos términos, efectuada mediante actos inequívocos —incluyendo el envío de una consulta, la inscripción a un curso o el pago de cualquier arancel— perfecciona el vínculo contractual en los términos del artículo 971 y 972 del mismo cuerpo normativo.'
            },
            {
                subtitle: 'Servicios y Obligaciones',
                text: 'VMP-EDTECH se obliga a prestar los servicios de formación y capacitación con la diligencia propia de un buen profesional en los términos del artículo 1724 del Código Civil y Comercial. El cursante queda obligado al pago del arancel acordado, a la asistencia en los módulos previstos y al cumplimiento del reglamento interno del curso. La certificación emitida queda sujeta a la aprobación de las instancias evaluativas establecidas en el programa académico correspondiente. VMP-EDTECH se reserva el derecho de modificar el cronograma de actividades por razones de fuerza mayor o caso fortuito (arts. 1730 y 1731 CCC), notificando a los inscriptos con la antelación razonable.'
            }
        ]
    },
    {
        id: 'responsabilidad',
        title: 'Limitación de Responsabilidad',
        badge: 'Art. 1728 CCC',
        content: [
            {
                subtitle: 'Alcance de la Obligación',
                text: 'La responsabilidad de VMP-EDTECH queda limitada a las consecuencias directas e inmediatas de la ejecución del servicio contratado, en los términos del artículo 1726 del Código Civil y Comercial. En ningún caso serán imputables a VMP-EDTECH los daños indirectos, el lucro cesante, la pérdida de chance o los daños consecuentes derivados del uso, mal uso o imposibilidad de uso de las certificaciones emitidas, salvo dolo o culpa grave acreditados en sede judicial. La responsabilidad máxima de VMP-EDTECH, en cualquier supuesto, no excederá el monto total abonado por el usuario en concepto de aranceles del servicio específico en cuestión.'
            },
            {
                subtitle: 'Contenidos de Terceros y Links Externos',
                text: 'El sitio web puede contener vínculos a recursos externos y a sitios de terceros. VMP-EDTECH no asume responsabilidad alguna respecto del contenido, exactitud, disponibilidad o licitud de dichos sitios, los cuales se rigen por sus propias políticas de privacidad y términos de uso. La mera presencia de un enlace no implica aval, patrocinio ni asociación comercial de ningún tipo.'
            }
        ]
    },
    {
        id: 'propiedad',
        title: 'Propiedad Intelectual',
        badge: 'Ley 11.723',
        content: [
            {
                subtitle: 'Derechos Reservados',
                text: 'La totalidad de los contenidos del presente sitio web —incluyendo, de manera meramente enunciativa y no taxativa, los textos, materiales pedagógicos, programas de capacitación, fotografías, ilustraciones, diseño gráfico, logotipos, marcas, nombres comerciales y software— son de titularidad exclusiva de VMP-EDTECH y se encuentran protegidos por la Ley N.º 11.723 de Propiedad Intelectual y por los Convenios Internacionales sobre Derechos de Autor vigentes en la República Argentina. Queda expresamente prohibida su reproducción total o parcial, transmisión, modificación, distribución, exhibición pública o cualquier forma de explotación no autorizada, en soporte físico o digital, sin consentimiento previo, expreso y por escrito de VMP-EDTECH.'
            },
            {
                subtitle: 'Materiales de Capacitación',
                text: 'Los manuales, presentaciones, evaluaciones, videos y demás materiales didácticos entregados en el marco de los cursos son de uso exclusivo del cursante inscripto. Queda prohibida su cesión, reventa o difusión a terceros, bajo apercibimiento de las acciones civiles y penales que pudieran corresponder conforme los artículos 71 y siguientes de la Ley 11.723 y el artículo 1709 del Código Civil y Comercial.'
            }
        ]
    },
    {
        id: 'jurisdiccion',
        title: 'Jurisdicción y Ley Aplicable',
        badge: 'Fuero Federal – Neuquén',
        content: [
            {
                subtitle: 'Legislación Aplicable',
                text: 'Las presentes condiciones se rigen exclusivamente por las leyes de la República Argentina, con especial aplicación del Código Civil y Comercial de la Nación (Ley 26.994), la Ley de Defensa del Consumidor (Ley N.º 24.240 y sus modificatorias), la Ley de Protección de Datos Personales (Ley N.º 25.326) y la Ley de Propiedad Intelectual (Ley N.º 11.723).'
            },
            {
                subtitle: 'Prórroga de Jurisdicción',
                text: 'Para todos los efectos legales derivados del uso del sitio y/o de la contratación de servicios, las partes se someten a la jurisdicción de los Tribunales Ordinarios de la Ciudad de Neuquén, Provincia del Neuquén, renunciando expresamente a cualquier otro fuero o jurisdicción que pudiera corresponder. En los supuestos en que el usuario revista la calidad de consumidor final, resultarán aplicables las normas de orden público previstas en el artículo 36 y 37 de la Ley 24.240, las cuales primarán sobre cualquier cláusula en contrario.'
            }
        ]
    }
];

export default function LegalSection() {
    const [openSection, setOpenSection] = useState<string | null>(null);

    const toggle = (id: string) => {
        setOpenSection(prev => (prev === id ? null : id));
    };

    return (
        <section id="aviso-legal" className="py-24 bg-slate-900 relative overflow-hidden">
            {/* Subtle background texture */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-6">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-sm font-semibold text-slate-300 tracking-wider uppercase">Aviso Legal</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">
                        Marco Legal e Información Jurídica
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Información legal obligatoria conforme a la legislación vigente de la República Argentina. Le recomendamos leer atentamente antes de utilizar nuestros servicios.
                    </p>
                </motion.div>

                {/* Accordion Sections */}
                <div className="space-y-3">
                    {sections.map((section, index) => {
                        const isOpen = openSection === section.id;
                        return (
                            <motion.div
                                key={section.id}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.08 }}
                                className={`rounded-2xl border transition-all duration-300 ${
                                    isOpen
                                        ? 'bg-white/10 border-primary/40 shadow-lg shadow-primary/5'
                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                }`}
                            >
                                {/* Accordion Trigger */}
                                <button
                                    onClick={() => toggle(section.id)}
                                    className="w-full flex items-center justify-between px-6 py-5 text-left"
                                    aria-expanded={isOpen}
                                    id={`legal-btn-${section.id}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-bold text-primary bg-primary/15 px-3 py-1 rounded-full border border-primary/30 whitespace-nowrap tracking-wide">
                                            {section.badge}
                                        </span>
                                        <span className="text-base font-semibold text-white">
                                            {section.title}
                                        </span>
                                    </div>
                                    <div className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ml-4 transition-all duration-300 ${
                                        isOpen ? 'bg-primary border-primary rotate-45' : 'border-white/20'
                                    }`}>
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                </button>

                                {/* Accordion Content */}
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            key="content"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.35, ease: 'easeInOut' }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-6 border-t border-white/10 pt-5 space-y-5">
                                                {section.content.map((block, i) => (
                                                    <div key={i}>
                                                        <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">
                                                            {block.subtitle}
                                                        </h4>
                                                        <p className="text-slate-300 text-sm leading-relaxed text-justify">
                                                            {block.text}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Footer Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="mt-10 border-t border-white/10 pt-8 text-center"
                >
                    <p className="text-slate-500 text-xs leading-relaxed max-w-2xl mx-auto">
                        La presente información legal fue elaborada conforme al ordenamiento jurídico vigente de la República Argentina, con referencia al <strong className="text-slate-400">Código Civil y Comercial de la Nación (Ley 26.994)</strong>, la <strong className="text-slate-400">Ley 25.326</strong> de Protección de Datos Personales, la <strong className="text-slate-400">Ley 24.240</strong> de Defensa del Consumidor y la <strong className="text-slate-400">Ley 11.723</strong> de Propiedad Intelectual. Última actualización: Abril de 2026. Para consultas jurídicas, contáctenos en{' '}
                        <a href="mailto:info@vmp-edtech.com" className="text-primary hover:underline">info@vmp-edtech.com</a>.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
