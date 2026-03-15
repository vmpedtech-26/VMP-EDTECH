'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShieldCheck, Target, Award, Users } from 'lucide-react';
import { useRef } from 'react';

export default function AboutUs() {
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 50]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    const stats = [
        { icon: Users, label: 'Alumnos Egresados', value: '+15k', delay: 0 },
        { icon: Award, label: 'Años de Trayectoria', value: '15+', delay: 0.1 },
        { icon: ShieldCheck, label: 'Empresas Confían', value: '500+', delay: 0.2 },
        { icon: Target, label: 'Tasa de Aprobación', value: '98%', delay: 0.3 },
    ];

    return (
        <section 
            id="quienes-somos" 
            ref={sectionRef}
            className="relative py-24 md:py-32 overflow-hidden bg-white"
        >
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16 md:mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-full px-5 py-2.5 mb-6 backdrop-blur-sm"
                    >
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Nuestra Esencia</span>
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-slate-900 tracking-tight"
                    >
                        Transformando la <span className="gradient-text">Cultura Vial</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    {/* Visual Section */}
                    <div className="relative">
                        <motion.div 
                            style={{ y: y1 }}
                            className="relative z-20 rounded-3xl overflow-hidden shadow-2xl border border-white/20 aspect-[4/5] md:aspect-[3/4]"
                        >
                            <Image
                                src="/images/hero-training.png" // Reusing hero for now or use another image
                                alt="Equipo de instructores VMP impartiendo clases"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-80" />
                            <div className="absolute bottom-0 left-0 p-8">
                                <p className="text-white font-medium text-lg leading-snug">
                                    "La seguridad vial no es solo un objetivo, es <strong>nuestra responsabilidad</strong> compartida."
                                </p>
                            </div>
                        </motion.div>

                        <motion.div 
                            style={{ y: y2 }}
                            className="absolute -top-10 -right-10 z-10 w-48 h-48 lg:w-64 lg:h-64 rounded-full border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-3xl"
                        />
                        <div className="absolute -bottom-10 -left-10 z-30 w-32 h-32 rounded-3xl bg-gradient-to-tr from-secondary/80 to-primary/80 rotate-12 opacity-50 blur-2xl animate-pulse" />
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-col justify-center">
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="space-y-8"
                        >
                            <div className="prose prose-lg prose-slate">
                                <p className="text-xl text-slate-700 font-medium leading-relaxed">
                                    En <span className="font-bold text-primary">VMP EdTech</span>, acumulamos más de 15 años de experiencia revolucionando la capacitación vial en Argentina. Nacimos con una misión clara: salvar vidas a través de la educación.
                                </p>
                                <p className="text-slate-600 leading-relaxed">
                                    No nos limitamos a enseñar normas de tránsito; capacitamos a conductores profesionales para que desarrollen un <strong>criterio preventivo excepcional</strong>. Integramos tecnología educativa de vanguardia con metodologías prácticas de alto impacto.
                                </p>
                                <p className="text-slate-600 leading-relaxed">
                                    Nuestras certificaciones cuentan con el aval de las principales operadoras de rubros exigentes, garantizando que cada egresado esté preparado para enfrentar los desafíos de la conducción moderna con total seguridad y destreza.
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-100">
                                {stats.map((stat, idx) => {
                                    const Icon = stat.icon;
                                    return (
                                        <motion.div 
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, delay: stat.delay }}
                                            className="group"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
                                                    <Icon className="w-6 h-6 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors duration-300">
                                                        {stat.value}
                                                    </div>
                                                    <div className="text-sm text-slate-500 font-medium">
                                                        {stat.label}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
