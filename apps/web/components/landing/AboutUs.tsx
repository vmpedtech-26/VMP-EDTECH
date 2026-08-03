'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export default function AboutUs() {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    return (
        <section id="sobre-nosotros" className="relative py-16 md:py-20 overflow-hidden border-b border-slate-800">
            {/* Background Image: Realistic Corporate Operations & Control Center */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/sobre_la_empresa_bg.jpg"
                    alt="Operaciones de Seguridad e Higiene en Yacimiento Vaca Muerta, Patagonia Argentina"
                    fill
                    sizes="100vw"
                    quality={95}
                    className="object-cover object-center scale-[0.6]"
                    priority
                />
                {/* Organic Dark Overlay for Contrast & Readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/92 via-slate-900/88 to-slate-950/95 backdrop-blur-[2px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12 md:space-y-16">
                
                {/* 1. Sobre la Empresa */}
                <div className="text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={fadeIn.initial}
                        whileInView={fadeIn.whileInView}
                        viewport={fadeIn.viewport}
                        transition={fadeIn.transition}
                        className="inline-flex items-center space-x-2 bg-white border border-primary/20 rounded-full px-4 py-1.5 mb-6 shadow-sm"
                    >
                        <div className="w-6 h-6 rounded-full overflow-hidden relative">
                            <Image src="/images/icons/consulting.png" fill className="object-cover" alt="Empresa" />
                        </div>
                        <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Sobre la Empresa</span>
                    </motion.div>
                    
                    <motion.h2 
                        initial={fadeIn.initial}
                        whileInView={fadeIn.whileInView}
                        viewport={fadeIn.viewport}
                        transition={{ ...fadeIn.transition, delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold font-heading text-white tracking-tight mb-8"
                    >
                        VMP-EDTECH <span className="gradient-text">Educación con Tecnología</span>
                    </motion.h2>

                    {/* Textos descriptivos removidos a pedido del usuario para mayor limpieza */}
                </div>

                {/* 2. Misión y Visión */}
                <div className="grid md:grid-cols-2 gap-6">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-start"
                    >
                        <div className="w-12 h-12 rounded-2xl overflow-hidden mb-5 shadow-md relative">
                            <Image src="/images/icons/compliance.png" fill className="object-cover" alt="Misión" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">Misión</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Colaborar de manera efectiva con las organizaciones en la mejora continua de sus procesos productivos, promoviendo una cultura sólida de calidad, ambiente, seguridad y salud ocupacional, orientada a la protección de las personas, los bienes y el entorno donde se desarrollan las actividades.
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-900/20 border border-slate-800 flex flex-col items-start text-white relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 blur-[80px] rounded-full" />
                        <div className="w-12 h-12 rounded-2xl overflow-hidden mb-5 relative z-10 shadow-md">
                            <Image src="/images/icons/reports.png" fill className="object-cover" alt="Visión" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Visión</h3>
                        <p className="text-slate-300 text-sm leading-relaxed relative z-10">
                            Consolidarnos como una organización referente en la prestación de servicios técnicos de seguridad industrial, ambiente y formación operativa, alcanzando estándares de excelencia reconocidos por nuestros clientes.
                        </p>
                    </motion.div>
                </div>

                {/* 3. Propuesta de Valor */}
                <motion.div 
                    initial={fadeIn.initial}
                    whileInView={fadeIn.whileInView}
                    viewport={fadeIn.viewport}
                    transition={fadeIn.transition}
                    className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
                >
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex-1 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary font-semibold text-xs mb-1">
                                <div className="w-3.5 h-3.5 rounded-full overflow-hidden relative">
                                    <Image src="/images/icons/productivity.png" fill className="object-cover" alt="Valor" />
                                </div>
                                Propuesta de Valor
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-slate-900">Transformamos la seguridad en una herramienta estratégica</h3>
                            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                                Las organizaciones industriales no contratan servicios de seguridad e higiene únicamente por cumplimiento normativo. Lo que realmente buscan es reducir riesgos operativos, evitar interrupciones productivas y asegurar la continuidad de sus operaciones.
                            </p>
                            <p className="text-slate-600 text-sm font-medium italic">
                                Nuestro enfoque combina experiencia técnica, presencia en campo y formación aplicada.
                            </p>
                        </div>
                        <div className="flex-1 w-full bg-slate-50 p-5 md:p-6 rounded-2xl border border-slate-100">
                            <h4 className="font-bold text-slate-900 mb-4 text-base">VMP-EDTECH orienta sus servicios a proporcionar:</h4>
                            <ul className="space-y-3">
                                {[
                                    "Reducción del riesgo operativo",
                                    "Protección empresarial",
                                    "Optimización de procesos productivos",
                                    "Fortalecimiento de la cultura de seguridad en campo",
                                    "Información técnica para la toma de decisiones operativas"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2.5">
                                        <div className="w-5.5 h-5.5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                                        </div>
                                        <span className="text-slate-700 text-sm font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>

                {/* Banner Panorámico Separador de Operaciones en Vaca Muerta */}
                <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-cyan-500/10 rounded-[3rem] blur-2xl opacity-75 pointer-events-none" />
                    
                    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-[2.5rem] overflow-hidden border border-slate-700/80 shadow-[0_25px_60px_rgba(0,0,0,0.5)] bg-slate-950">
                        <Image
                            src="/images/sobre_la_empresa_bg.jpg"
                            alt="Operaciones de Seguridad Vial e Industrial en Yacimiento Vaca Muerta, Patagonia Argentina"
                            fill
                            quality={95}
                            sizes="100vw"
                            className="object-cover object-[50%_35%] transition-transform duration-700 group-hover:scale-105"
                            priority
                        />
                        {/* Gradient Overlay for Crisp Depth */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                        {/* Floating glass badge Top Left */}
                        <div className="absolute top-6 left-6 md:top-8 md:left-8 backdrop-blur-md bg-slate-900/90 border border-emerald-400/40 px-4.5 py-2 rounded-2xl shadow-2xl flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs font-black text-white tracking-wider uppercase">Operaciones Vaca Muerta & Patagonia</span>
                        </div>

                        {/* Floating glass badge Bottom Right */}
                        <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 backdrop-blur-md bg-slate-900/90 border border-slate-700/80 px-5 py-3 rounded-2xl shadow-2xl hidden sm:flex items-center gap-4">
                            <div>
                                <p className="text-[10px] font-black text-emerald-400 tracking-widest uppercase">PRESENCIA EN CAMPO REAL</p>
                                <p className="text-sm font-bold text-white leading-none mt-0.5">Neuquén • CABA • Santa Cruz</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 9 & 10. Fortalezas y Sectores */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* 9. Fortalezas (2 cols width on lg) */}
                    <motion.div 
                        initial={fadeIn.initial} whileInView={fadeIn.whileInView} viewport={fadeIn.viewport} transition={{ ...fadeIn.transition, delay: 0.1 }}
                        className="lg:col-span-2 bg-white border border-secondary/20 rounded-3xl p-6 md:p-8 shadow-xl shadow-secondary/5"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-7 h-7 rounded-lg overflow-hidden shadow-sm relative">
                                <Image src="/images/icons/compliance.png" fill className="object-cover" alt="Fortalezas" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Fortalezas Organizacionales</h3>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                "Más de dos décadas de experiencia en seguridad industrial y gestión de calidad.",
                                "Conocimiento profundo de la industria del petróleo y gas.",
                                "Equipo técnico multidisciplinario con habilitación profesional.",
                                "Capacidad de adaptación a distintos sectores productivos.",
                                "Presencia técnica en campo y enfoque práctico en las soluciones.",
                                "Estrategias de optimización de costos sin comprometer la seguridad."
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl">
                                    <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 mt-0.5 shadow-sm relative">
                                        <Image src="/images/icons/compliance.png" fill className="object-cover" alt="Check" />
                                    </div>
                                    <p className="text-slate-700 text-xs leading-relaxed">{item}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* 10. Sectores (1 col width on lg) */}
                    <motion.div 
                        initial={fadeIn.initial} whileInView={fadeIn.whileInView} viewport={fadeIn.viewport} transition={{ ...fadeIn.transition, delay: 0.3 }}
                        className="bg-primary/5 rounded-3xl p-6 md:p-8 border border-primary/10 flex flex-col"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-7 h-7 rounded-lg overflow-hidden shadow-sm relative">
                                <Image src="/images/icons/scalability.png" fill className="object-cover" alt="Sectores" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Sectores Atendidos</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[
                                "Industria del petróleo y gas",
                                "Minería",
                                "Energía",
                                "Agroindustria",
                                "Petroquímica",
                                "Servicios industriales",
                                "Pymes en crecimiento"
                            ].map((sector, i) => (
                                <span key={i} className="inline-block bg-white border border-primary/20 text-slate-700 text-xs px-3 py-1.5 rounded-xl shadow-sm font-medium hover:border-primary/50 transition-colors">
                                    {sector}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}
