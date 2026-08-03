'use client';

import { Card } from '@/components/ui/Card';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
    {
        name: 'Valeria Rodríguez',
        role: 'Gerente de RRHH',
        company: 'Vialera del Neuquén',
        image: '/images/avatar-valeria.png',
        quote:
            'VMP - EDTECH transformó nuestra forma de capacitar. Las credenciales digitales son profesionales y nuestros clientes confían más en nuestro personal certificado en toda la Patagonia.',
        rating: 5,
    },
    {
        name: 'Juan Pérez',
        role: 'Director de Operaciones',
        company: 'Transportes Patagónicos',
        image: '/images/avatar-juan.png',
        quote:
            'El sistema es intuitivo y los reportes nos permiten tomar decisiones basadas en datos reales. Vimos una reducción del 35% en incidentes en rutas de ripio.',
        rating: 5,
    },
    {
        name: 'Ana Martínez',
        role: 'CEO',
        company: 'Servicios Integrales SA',
        image: null,
        quote:
            'La inversión se recuperó en 6 meses. El retorno en productividad y cumplimiento no tiene precio para una empresa de servicios petroleros.',
        rating: 5,
    },
];

export function Testimonials() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 500 : -500,
            opacity: 0,
            scale: 0.9
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 500 : -500,
            opacity: 0,
            scale: 0.9
        })
    };

    const paginate = (newDirection: number) => {
        setDirection(newDirection);
        setCurrentIndex((prevIndex) => (prevIndex + newDirection + testimonials.length) % testimonials.length);
    };

    return (
        <section id="testimonios" className="py-24 bg-slate-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 mb-6">
                        Confían en <span className="gradient-text">VMP - EDTECH</span>
                    </h2>
                    <p className="text-xl text-slate-600">
                        Empresas líderes que transformaron su cultura de seguridad
                    </p>
                </motion.div>

                {/* Carrusel Container */}
                <div className="max-w-4xl mx-auto relative px-4">
                    <div className="absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 z-20">
                        <button 
                            onClick={() => paginate(-1)}
                            className="p-3 rounded-full bg-white shadow-lg border border-slate-100 text-slate-400 hover:text-primary transition-colors group"
                        >
                            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                    
                    <div className="absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 z-20">
                        <button 
                            onClick={() => paginate(1)}
                            className="p-3 rounded-full bg-white shadow-lg border border-slate-100 text-slate-400 hover:text-primary transition-colors group"
                        >
                            <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>

                    <div className="relative h-[450px] md:h-[350px]">
                        <AnimatePresence initial={false} custom={direction}>
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 }
                                }}
                                className="absolute w-full"
                            >
                                <Card className="p-8 sm:p-12 border-slate-100 shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
                                    <Quote className="h-14 w-14 text-primary/10 mb-8" />

                                    <p className="text-xl md:text-2xl text-slate-700 leading-relaxed mb-10 italic font-medium">
                                        "{testimonials[currentIndex].quote}"
                                    </p>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                        <div className="flex items-center space-x-5">
                                            {testimonials[currentIndex].image ? (
                                                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary/10 shadow-md">
                                                    <Image
                                                        src={testimonials[currentIndex].image}
                                                        alt={testimonials[currentIndex].name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                                    {testimonials[currentIndex].name.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-bold text-lg text-slate-900 leading-none mb-1">
                                                    {testimonials[currentIndex].name}
                                                </div>
                                                <div className="text-sm text-slate-500 font-medium">
                                                    {testimonials[currentIndex].role} <span className="text-primary mx-1">•</span> {testimonials[currentIndex].company}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex space-x-1 bg-warning/5 px-3 py-1.5 rounded-full border border-warning/10">
                                            {Array.from({ length: testimonials[currentIndex].rating }).map(
                                                (_, i) => (
                                                    <Star
                                                        key={i}
                                                        className="h-4 w-4 fill-warning text-warning"
                                                    />
                                                )
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navegación Dots */}
                    <div className="flex justify-center space-x-3 mt-12">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setDirection(index > currentIndex ? 1 : -1);
                                    setCurrentIndex(index);
                                }}
                                className={`h-2.5 rounded-full transition-all duration-500 ${index === currentIndex
                                    ? 'w-10 bg-primary shadow-lg shadow-primary/20'
                                    : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                                    }`}
                                aria-label={`Go to testimonial ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
