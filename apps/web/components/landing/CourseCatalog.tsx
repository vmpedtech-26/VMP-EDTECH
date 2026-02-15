'use client';

import { useState } from 'react';
import { Truck, Shield, Mountain, ArrowRight, Clock, Award, Smartphone } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface Course {
    id: string;
    icon: any;
    title: string;
    category: string;
    duration: string;
    modality: string;
    validity: string;
    minScore: string;
    priceFrom: number;
    description: string;
    isPopular?: boolean;
}

export default function CourseCatalog() {
    const [activeTab, setActiveTab] = useState('all');

    const courses: Course[] = [
        {
            id: 'carga-pesada',
            icon: Truck,
            title: 'Carga Pesada',
            category: 'Transporte',
            duration: '12 horas',
            modality: 'Online/Presencial',
            validity: '24 meses',
            minScore: '75%',
            priceFrom: 45000,
            description: 'Capacitación especializada para conductores de vehículos de carga pesada según normativas vigentes.',
            isPopular: true
        },
        {
            id: 'preventivo',
            icon: Shield,
            title: 'Conducción Preventiva',
            category: 'Preventivo',
            duration: '8 horas',
            modality: '100% Online',
            validity: '12 meses',
            minScore: '70%',
            priceFrom: 32000,
            description: 'Técnicas de conducción preventiva y manejo de situaciones de riesgo en ruta.'
        },
        {
            id: '2-traccion',
            icon: Mountain,
            title: 'Conducción 2 Tracción',
            category: 'Especializado',
            duration: '16 horas',
            modality: 'Presencial',
            validity: '36 meses',
            minScore: '80%',
            priceFrom: 68000,
            description: 'Manejo avanzado en terrenos difíciles, técnicas de tracción y recuperación de vehículos.'
        }
    ];

    const tabs = [
        { id: 'all', label: 'Todos' },
        { id: 'preventivo', label: 'Conducción Preventiva' },
        { id: 'carga', label: 'Carga Pesada' },
        { id: '2-traccion', label: 'Conducción 2 Tracción' }
    ];

    const filteredCourses = activeTab === 'all'
        ? courses
        : courses.filter(c => c.id.includes(activeTab));

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    return (
        <section id="cursos" className="py-20 bg-gradient-to-br from-slate-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="font-heading font-bold text-4xl md:text-5xl text-slate-900 mb-4">
                        Nuestros Cursos de Capacitación
                    </h2>
                    <p className="text-xl text-slate-800 max-w-3xl mx-auto">
                        Programas diseñados con los más altos estándares de calidad
                    </p>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    className="flex flex-wrap justify-center gap-3 mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {tabs.map(tab => (
                        <motion.button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                                : 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-200'
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {tab.label}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Course Cards */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {filteredCourses.map((course, index) => {
                            const Icon = course.icon;
                            return (
                                <motion.div
                                    key={course.id}
                                    variants={cardVariants}
                                    className="relative glass-card rounded-2xl overflow-hidden group"
                                    whileHover={{
                                        y: -8,
                                        boxShadow: '0 25px 50px -12px rgba(79, 70, 229, 0.25)',
                                        transition: { duration: 0.3 }
                                    }}
                                    style={{
                                        transformStyle: 'preserve-3d',
                                        perspective: 1000
                                    }}
                                >
                                    {/* Most Popular Badge */}
                                    {course.isPopular && (
                                        <motion.div
                                            className="absolute -top-2 -right-2 z-10"
                                            initial={{ scale: 0, rotate: -45 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 260,
                                                damping: 20,
                                                delay: 0.5 + index * 0.15
                                            }}
                                        >
                                            <Image
                                                src="/images/most-popular-badge.png"
                                                alt="Más Popular"
                                                width={80}
                                                height={80}
                                                className="drop-shadow-lg"
                                            />
                                        </motion.div>
                                    )}

                                    {/* Header with Icon */}
                                    <div className="bg-gradient-to-br from-primary to-secondary p-6 relative">
                                        <div className="absolute top-4 right-4">
                                            <span className="bg-white/90 backdrop-blur-sm text-primary px-3 py-1 rounded-full text-xs font-bold">
                                                VMP
                                            </span>
                                        </div>
                                        <motion.div
                                            whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <Icon className="h-16 w-16 text-white mb-4" />
                                        </motion.div>
                                        <h3 className="font-heading font-bold text-2xl text-white mb-2">
                                            {course.title}
                                        </h3>
                                        <p className="text-white/80 text-sm">
                                            {course.category}
                                        </p>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 bg-white">
                                        <p className="text-slate-800 mb-6 leading-relaxed">
                                            {course.description}
                                        </p>

                                        {/* Details */}
                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center text-sm">
                                                <Clock className="h-4 w-4 text-primary mr-2" />
                                                <span className="text-slate-800">
                                                    <strong>Duración:</strong> {course.duration}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <Smartphone className="h-4 w-4 text-primary mr-2" />
                                                <span className="text-slate-800">
                                                    <strong>Modalidad:</strong> {course.modality}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <Award className="h-4 w-4 text-primary mr-2" />
                                                <span className="text-slate-800">
                                                    <strong>Vigencia:</strong> {course.validity}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="mb-6">
                                            <p className="text-sm text-slate-800 mb-1">Desde</p>
                                            <p className="font-heading font-bold text-3xl gradient-text">
                                                ${course.priceFrom.toLocaleString('es-AR')}
                                            </p>
                                        </div>

                                        {/* CTA */}
                                        <Link
                                            href={`/cursos/${course.id}`}
                                            className="block w-full text-center px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                                        >
                                            Ver Detalles
                                        </Link>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>

                {/* Bottom CTA */}
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <Link
                        href="/#contacto"
                        className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center group"
                    >
                        Consultar por tu Empresa
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
