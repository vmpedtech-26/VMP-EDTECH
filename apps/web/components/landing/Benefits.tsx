'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';

const benefits = [
    {
        image: '/images/icons/productivity.png',
        title: 'Aumenta la Productividad',
        description: 'Personal capacitado rinde más y comete menos errores',
    },
    {
        image: '/images/icons/time.png',
        title: 'Ahorra Tiempo',
        description: 'Automatiza la gestión de capacitaciones y certificaciones',
    },
    {
        image: '/images/icons/compliance.png',
        title: 'Cumplimiento Normativo',
        description: 'Credenciales oficiales que cumplen normativas vigentes',
    },
    {
        image: '/images/icons/reports.png',
        title: 'Reportes en Tiempo Real',
        description: 'Métricas y estadísticas de progreso de tus equipos',
    },
    {
        image: '/images/icons/verification.png',
        title: 'Verificación Instantánea',
        description: 'Valida credenciales escaneando el código QR',
    },
    {
        image: '/images/icons/scalability.png',
        title: 'Escalable',
        description: 'Capacita desde 10 hasta 1000+ empleados sin límites',
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
        <section id="beneficios" className="py-20 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div 
                    initial={fadeIn.initial}
                    whileInView={fadeIn.whileInView}
                    viewport={fadeIn.viewport}
                    transition={fadeIn.transition}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                        Beneficios para tu Empresa
                    </h2>
                    <p className="text-xl text-slate-800">
                        Digitaliza la capacitación de tu equipo y obtén resultados medibles
                    </p>
                </motion.div>

                {/* Grid de beneficios */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {benefits.map((benefit, index) => {
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <Card className="flex flex-col h-full items-start hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 border-slate-100 bg-white">
                                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl overflow-hidden mb-6 ring-2 ring-primary/5 shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                                        <img 
                                            src={benefit.image} 
                                            alt={benefit.title} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed text-sm md:text-base">{benefit.description}</p>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
