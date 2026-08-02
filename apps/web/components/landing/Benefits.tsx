'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import {
    TrendingUp,
    Clock,
    Shield,
    BarChart3,
    CheckCircle,
    Users,
} from 'lucide-react';

const benefits = [
    {
        icon: TrendingUp,
        title: 'Aumenta la Productividad',
        description: 'Personal capacitado rinde más y comete menos errores',
    },
    {
        icon: Clock,
        title: 'Ahorra Tiempo',
        description: 'Automatiza la gestión de capacitaciones y certificaciones',
    },
    {
        icon: Shield,
        title: 'Cumplimiento Legal',
        description: 'Credenciales oficiales que cumplen normativas vigentes',
    },
    {
        icon: BarChart3,
        title: 'Reportes en Tiempo Real',
        description: 'Métricas y estadísticas de progreso de tus equipos',
    },
    {
        icon: CheckCircle,
        title: 'Verificación Instantánea',
        description: 'Valida credenciales escaneando el código QR',
    },
    {
        icon: Users,
        title: 'Escalable',
        description: 'Capacita desde 10 hasta 1000+ empleados sin límites',
    },
];

export function Benefits() {
    return (
        <section id="beneficios" className="py-24 relative overflow-hidden bg-[#0A192F] border-b border-slate-800">
            {/* Background 4K Real Image: Corporate Transport Fleet */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/soluciones_vmp_4k_real.jpg"
                    alt="Beneficios Corporativos de Capacitación Vial VMP"
                    fill
                    sizes="100vw"
                    quality={95}
                    className="object-cover object-center"
                    priority
                />
                {/* Organic Dark Overlay for High Legibility */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0A192F]/94 via-[#0A192F]/88 to-[#0A192F]/95 backdrop-blur-[2px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Beneficios para tu <span className="gradient-text">Empresa</span>
                    </h2>
                    <p className="text-xl text-gray-300">
                        Digitaliza la capacitación de tu equipo y obtén resultados medibles
                    </p>
                </div>

                {/* Grid de beneficios */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {benefits.map((benefit, index) => {
                        const Icon = benefit.icon;
                        return (
                            <Card key={index} className="flex flex-col items-start">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-success/10 mb-4">
                                    <Icon className="h-6 w-6 text-success" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    {benefit.title}
                                </h3>
                                <p className="text-gray-600">{benefit.description}</p>
                            </Card>
                        );
                    })}
                </div>

                {/* Estadísticas */}
                <div className="mt-16 bg-gradient-to-r from-primary to-primary-light rounded-2xl p-8 sm:p-12 text-white">
                    <div className="grid sm:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-4xl sm:text-5xl font-bold mb-2">95%</div>
                            <div className="text-primary-light opacity-90">
                                Satisfacción de Empresas
                            </div>
                        </div>
                        <div>
                            <div className="text-4xl sm:text-5xl font-bold mb-2">-40%</div>
                            <div className="text-primary-light opacity-90">
                                Reducción de Incidentes
                            </div>
                        </div>
                        <div>
                            <div className="text-4xl sm:text-5xl font-bold mb-2">24/7</div>
                            <div className="text-primary-light opacity-90">
                                Acceso a Plataforma
                            </div>
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
                        <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-cyan-500/10 rounded-[3.5rem] blur-3xl opacity-80 pointer-events-none" />

                        <div className="relative aspect-[4/3] sm:aspect-video lg:aspect-[3/4] rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.5)] border border-slate-700/80 bg-slate-900 group">
                            <Image 
                                src="/images/ventaja_competitiva_bg.jpg" 
                                alt="Conducción Preventiva en Climas Extremos y Rutas de la Patagonia Argentina"
                                fill
                                quality={95}
                                sizes="(max-width: 1024px) 100vw, 40vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                priority
                            />
                            {/* Accent Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                            {/* Floating glass badge top-right */}
                            <div className="absolute top-6 right-6 backdrop-blur-md bg-slate-900/90 border border-emerald-400/40 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 transform transition-all duration-500 hover:scale-105">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] font-black text-emerald-300 tracking-wider uppercase">Operaciones Patagónicas</span>
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
