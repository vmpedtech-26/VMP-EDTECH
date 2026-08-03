'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Award, Laptop, Users } from 'lucide-react';

export default function ValueProposition() {
    const values = [
        {
            icon: <Award className="h-6 w-6 text-primary" />,
            title: "Certificación Profesional Oficial",
            description: "Cumplimos con las normativas vigentes, garantizando que tu certificación tenga validez y reconocimiento empresarial en todo el territorio argentino.",
            details: "Validez Nacional"
        },
        {
            icon: <Laptop className="h-6 w-6 text-primary" />,
            title: "Plataforma Digital Moderna",
            description: "Tecnología educativa de última generación con modalidad 100% online, presencial o mixta. Validación QR instantánea de certificados.",
            details: "Online/Offline + QR"
        },
        {
            icon: <Users className="h-6 w-6 text-primary" />,
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
        <section className="py-16 md:py-20 relative overflow-hidden border-b border-slate-800">
            {/* Background Image: Full Section Cover */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/porque_elegir_vmp_bg.jpg"
                    alt="Capacitación Vial Práctica de Flotas en Rutas y Terreno de Argentina"
                    fill
                    sizes="100vw"
                    quality={95}
                    className="object-cover object-center"
                    priority
                />
                {/* Organic Dark Overlay for Contrast & Readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/85 to-slate-950/95" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                    
                    {/* Left Column: Image Showcase with Glass Badges */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="lg:col-span-6 relative"
                    >
                        {/* Glow Behind Image */}
                        <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-cyan-500/10 rounded-[3.5rem] blur-3xl opacity-80 pointer-events-none" />
                        
                        <div className="relative aspect-[4/3] sm:aspect-video lg:aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.5)] border border-slate-700/80 bg-slate-900 group">
                            <Image 
                                src="/images/porque_elegir_vmp_bg.jpg" 
                                alt="Capacitación Vial Práctica de Flotas en Rutas de Argentina"
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                quality={95}
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                priority
                            />
                            {/* Ambient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                            
                            {/* Floating glass badge Top Left */}
                            <div className="absolute top-6 left-6 backdrop-blur-md bg-slate-900/90 border border-emerald-400/40 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 transform transition-all duration-500 hover:scale-105">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] font-black text-emerald-300 tracking-wider uppercase">100% Homologado en Argentina</span>
                            </div>

                            {/* Floating glass badge Bottom Right */}
                            <div className="absolute bottom-6 right-6 max-w-[280px] backdrop-blur-md bg-slate-900/95 border border-slate-700/80 p-4.5 rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105 text-white">
                                <span className="text-[9px] font-black text-emerald-400 tracking-widest uppercase mb-1 block">ENTRENAMIENTO EN CAMPO REAL</span>
                                <p className="text-[11px] font-medium text-slate-200 leading-relaxed">
                                    Simulaciones prácticas en rutas nacionales para garantizar la respuesta idónea de operarios de flota.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Content and List */}
                    <div className="lg:col-span-6 flex flex-col justify-center">
                        <motion.div 
                            initial={fadeIn.initial}
                            whileInView={fadeIn.whileInView}
                            viewport={fadeIn.viewport}
                            transition={fadeIn.transition}
                            className="mb-8"
                        >
                            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-4 shadow-sm backdrop-blur-md">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">¿Por qué elegir VMP?</span>
                            </div>
                            <h2 className="font-heading font-black text-4xl md:text-5xl text-white mb-4 tracking-tight leading-tight">
                                La Plataforma Líder en <span className="text-teal-400 italic relative inline-block">
                                    Capacitación Vial
                                    <span className="absolute bottom-1 left-0 w-full h-2.5 bg-teal-500/25 -z-10 rounded-sm" />
                                </span>
                            </h2>
                            <p className="text-base text-slate-200 leading-relaxed font-medium">
                                Proveemos programas oficiales y herramientas tecnológicas diseñadas para elevar la seguridad y eficiencia de las flotas operativas.
                            </p>
                        </motion.div>

                        {/* Values List */}
                        <div className="space-y-4">
                            {values.map((value, index) => {
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        className="flex gap-5 p-5 rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-md hover:border-emerald-400/40 hover:bg-slate-900/90 transition-all duration-300 group shadow-md"
                                    >
                                        {/* Icon Container */}
                                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center shadow-sm group-hover:bg-emerald-500/20 group-hover:border-emerald-400/30 transition-all duration-300">
                                            {value.icon}
                                        </div>

                                        {/* Texts */}
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                                                <h3 className="font-bold text-lg text-white group-hover:text-emerald-300 transition-colors">
                                                    {value.title}
                                                </h3>
                                                <span className="text-[10px] font-black tracking-wider text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-md uppercase italic">
                                                    {value.details}
                                                </span>
                                            </div>
                                            <p className="text-slate-300 text-sm leading-relaxed font-medium">
                                                {value.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Bottom Quote */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="text-center mt-16 border-t border-slate-800 pt-8"
                >
                    <p className="text-sm text-slate-300 italic max-w-2xl mx-auto font-medium leading-relaxed">
                        "Nuestras capacitaciones están diseñadas bajo los estándares normativos nacionales e internacionales más exigentes, garantizando certificaciones con validez técnica real."
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
