'use client';

import { Card } from '@/components/ui/Card';
import { Star, Quote } from 'lucide-react';
import { useState } from 'react';

const testimonials = [
    {
        name: 'María González',
        role: 'Gerente de RRHH',
        company: 'Constructora del Sur',
        image: null,
        quote:
            'VMP transformó nuestra forma de capacitar. Las credenciales digitales son profesionales y nuestros clientes confían más en nuestro personal certificado.',
        rating: 5,
    },
    {
        name: 'Carlos Rodríguez',
        role: 'Director de Operaciones',
        company: 'Transportes Rápidos',
        image: null,
        quote:
            'El sistema es intuitivo y los reportes nos permiten tomar decisiones basadas en datos reales. Vimos reducción del 35% en incidentes.',
        rating: 5,
    },
    {
        name: 'Ana Martínez',
        role: 'CEO',
        company: 'Servicios Integrales SA',
        image: null,
        quote:
            'La inversión se recuperó en 6 meses. El retorno en productividad y cumplimiento legal no tiene precio.',
        rating: 5,
    },
];

export function Testimonials() {
    const [currentIndex, setCurrentIndex] = useState(0);

    return (
        <section id="testimonios" className="py-20 bg-background-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                        Lo que Dicen Nuestros Clientes
                    </h2>
                    <p className="text-xl text-slate-800">
                        Empresas que confiaron en VMP y transformaron su capacitación
                    </p>
                </div>

                {/* Carrusel */}
                <div className="max-w-4xl mx-auto">
                    <Card className="p-8 sm:p-12">
                        <Quote className="h-12 w-12 text-primary/20 mb-6" />

                        <p className="text-xl text-slate-700 leading-relaxed mb-8 italic">
                            "{testimonials[currentIndex].quote}"
                        </p>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-xl">
                                    {testimonials[currentIndex].name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">
                                        {testimonials[currentIndex].name}
                                    </div>
                                    <div className="text-sm text-slate-800">
                                        {testimonials[currentIndex].role} •{' '}
                                        {testimonials[currentIndex].company}
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-1">
                                {Array.from({ length: testimonials[currentIndex].rating }).map(
                                    (_, i) => (
                                        <Star
                                            key={i}
                                            className="h-5 w-5 fill-warning text-warning"
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Navegación */}
                    <div className="flex justify-center space-x-2 mt-8">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`h-2 rounded-full transition-all ${index === currentIndex
                                    ? 'w-8 bg-primary'
                                    : 'w-2 bg-gray-300'
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
