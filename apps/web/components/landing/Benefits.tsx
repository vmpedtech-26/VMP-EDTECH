'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { TrendingUp, Clock, FileCheck, BarChart3, QrCode, Layers } from 'lucide-react';

const benefits = [
    {
        icon: <TrendingUp className="h-5 w-5 text-primary" />,
        title: 'Aumenta la Productividad',
        description: 'Personal capacitado rinde más y comete menos errores en campo.',
    },
    {
        icon: <Clock className="h-5 w-5 text-primary" />,
        title: 'Ahorra Tiempo',
        description: 'Automatiza la gestión de capacitaciones y vencimiento de credenciales.',
    },
    {
        icon: <FileCheck className="h-5 w-5 text-primary" />,
        title: 'Cumplimiento Normativo',
        description: 'Credenciales oficiales homologadas bajo reglamentación vigente.',
    },
    {
        icon: <BarChart3 className="h-5 w-5 text-primary" />,
        title: 'Reportes en Tiempo Real',
        description: 'Visualiza métricas, estados de cursos y avance técnico de tus equipos.',
    },
    {
        icon: <QrCode className="h-5 w-5 text-primary" />,
        title: 'Verificación Instantánea',
        description: 'Valida la autenticidad de cualquier credencial de operador escaneando su código QR.',
    },
    {
        icon: <Layers className="h-5 w-5 text-primary" />,
        title: 'Escalabilidad Absoluta',
        description: 'Capacita desde pequeños equipos de campo hasta corporaciones completas sin límites.',
    },
];

export function Benefits() {
    const fadeIn = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    return (
        <section id="beneficios" className="py-24 relative overflow-hidden border-b border-slate-800">
            {/* Background Image: Realistic Industrial Transport Scene */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/ventaja_competitiva_bg.png"
                    alt="Transporte Pesado y Operaciones VMP en Terreno"
                    fill
                    className="object-cover object-center scale-105"
                    priority
                />
                {/* Organic Dark Overlay for Contrast & Readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/92 via-slate-900/88 to-slate-950/95 backdrop-blur-[2px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                    
                    {/* Left Column: Title and Benefit Grid */}
                    <div className="lg:col-span-7 flex flex-col justify-center">
                        <motion.div 
                            initial={fadeIn.initial}
                            whileInView={fadeIn.whileInView}
                            viewport={fadeIn.viewport}
                            transition={fadeIn.transition}
                            className="mb-10 text-left"
                        >
                            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-4 shadow-sm backdrop-blur-md">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">Ventaja Competitiva</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-heading font-black text-white mb-4 tracking-tight leading-tight">
                                Beneficios de nuestra <span className="text-teal-400 italic relative inline-block">
                                    Solución Corporativa
                                    <span className="absolute bottom-1 left-0 w-full h-2.5 bg-teal-500/25 -z-10 rounded-sm" />
                                </span>
                            </h2>
                            <p className="text-base text-slate-200 font-medium max-w-2xl leading-relaxed">
                                Digitaliza la formación obligatoria de tu equipo, reduce costes operacionales y obtén visibilidad técnica en tiempo real.
                            </p>
                        </motion.div>

                        {/* Grid of benefits */}
                        <div className="grid sm:grid-cols-2 gap-5">
                            {benefits.map((benefit, index) => {
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.08 }}
                                        className="group bg-slate-900/70 backdrop-blur-md rounded-2xl p-5 border border-slate-700/60 hover:border-emerald-400/40 hover:bg-slate-900/90 transition-all duration-300 flex flex-col shadow-md"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 group-hover:border-emerald-400/30 transition-colors duration-300">
                                            {benefit.icon}
                                        </div>
                                        <h3 className="text-base font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                                            {benefit.title}
                                        </h3>
                                        <p className="text-slate-300 text-xs font-medium leading-relaxed">
                                            {benefit.description}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: Visual Operations Showcase */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="lg:col-span-5 relative"
                    >
                        {/* Glow Effect */}
                        <div className="absolute -inset-4 bg-gradient-to-tr from-primary/15 to-emerald-500/10 rounded-[3rem] blur-2xl opacity-75 pointer-events-none" />

                        <div className="relative aspect-[4/3] sm:aspect-video lg:aspect-[3/4] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.08)] border border-slate-200/80 bg-slate-100 group">
                            <Image 
                                src="/images/vmp_hero_winter.png" 
                                alt="Operación en climas extremos de la Patagonia - VMP"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                priority
                            />
                            {/* Accent Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />

                            {/* Floating glass badge top-right */}
                            <div className="absolute top-6 right-6 backdrop-blur-md bg-slate-900/80 border border-slate-700/50 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 transform transition-all duration-500 hover:scale-105">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] font-black text-white tracking-wider uppercase">Operaciones Patagónicas</span>
                            </div>

                            {/* Floating glass card bottom-left */}
                            <div className="absolute bottom-6 left-6 right-6 backdrop-blur-md bg-slate-900/90 border border-slate-700/80 p-5 rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-[9px] font-black text-emerald-400 tracking-widest uppercase">MÉTRICA OPERACIONAL AUDITADA</p>
                                    <span className="text-[9px] text-slate-400 font-semibold bg-slate-800 px-2 py-0.5 rounded-md">Período 2023 - 2025</span>
                                </div>
                                <p className="text-2xl font-heading font-black text-white mb-1 leading-none">-98% Incidentes</p>
                                <p className="text-[11px] font-medium text-slate-300 leading-relaxed mb-1.5">
                                    Reducción comprobada de siniestros viales a través de capacitación preventiva intensiva.
                                </p>
                                <p className="text-[9px] text-slate-400 italic border-t border-slate-800 pt-1.5">
                                    *Fuente: Auditoría técnica interna en flotas operativas livianas y pesadas de la industria minera y energética.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
