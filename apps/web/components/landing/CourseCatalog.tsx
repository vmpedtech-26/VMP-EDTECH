'use client';

import { useState } from 'react';
import { Truck, Shield, Mountain, ArrowRight, Clock, Award, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_MAP: Record<string, { icon: any, label: string, color: string }> = {
    'Transporte': { icon: Truck, label: 'Transporte', color: 'bg-blue-500' },
    'Preventivo': { icon: Shield, label: 'Preventivo', color: 'bg-emerald-500' },
    'Especializado': { icon: Mountain, label: 'Especializado', color: 'bg-amber-500' },
    'Default': { icon: BookOpen, label: 'Capacitación', color: 'bg-primary' }
};

const DISPLAY_COURSES = [
    {
        id: 'carga-pesada',
        nombre: 'Conducción Flota Liviana y Pesada',
        descripcion: 'Capacitación teórico-práctica para el dominio seguro de unidades livianas y pesadas. Incluye normativas de transporte, manejo de cargas, ergonomía al volante y prevención de fatiga en trayectos largos. Diseñado para maximizar la seguridad vial y la eficiencia operativa de tu flota.',
        duracionHoras: 16,
        vigenciaMeses: 12,
        imageUrl: '/images/courses/carga-pesada.png',
        categoria: 'Transporte'
    },
    {
        id: 'conduccion-preventiva',
        nombre: 'Conducción Preventiva y Defensiva',
        descripcion: 'Aprende a anticipar riesgos, interpretar el entorno vial y reaccionar de forma segura ante situaciones de emergencia. Este programa enseña técnicas avanzadas para reducir accidentes, optimizar el uso del vehículo y proteger la vida del conductor y de terceros en todo tipo de rutas.',
        duracionHoras: 8,
        vigenciaMeses: 12,
        imageUrl: '/images/courses/conduccion-preventiva.png',
        categoria: 'Preventivo'
    },
    {
        id: 'doble-traccion',
        nombre: 'Conducción Especializada 4x4',
        descripcion: 'Desarrolla habilidades críticas para la conducción de vehículos de tracción integral en terrenos complejos, lodo, nieve y ripio. Incluye técnicas de auto-rescate, uso correcto de la doble tracción, evaluación del terreno y preservación del vehículo en condiciones off-road extremas.',
        duracionHoras: 24,
        vigenciaMeses: 24,
        imageUrl: '/images/courses/conduccion-2-traccion.png',
        categoria: 'Especializado'
    }
];

export default function CourseCatalog() {
    const [activeTab, setActiveTab] = useState('all');

    const tabs = [
        { id: 'all', label: 'Todos' },
        { id: 'Transporte', label: 'Transporte' },
        { id: 'Preventivo', label: 'Seguridad' },
        { id: 'Especializado', label: 'Técnico' }
    ];

    const filteredCourses = activeTab === 'all'
        ? DISPLAY_COURSES
        : DISPLAY_COURSES.filter(c => c.categoria === activeTab);

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
                        {filteredCourses.map((course) => {
                            const cat = CATEGORY_MAP[course.categoria] || CATEGORY_MAP['Default'];
                            const Icon = cat.icon;

                            return (
                                <motion.div
                                    key={course.id}
                                    variants={cardVariants}
                                    className="relative bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 group flex flex-col"
                                    whileHover={{
                                        y: -8,
                                        boxShadow: '0 25px 50px -12px rgba(79, 70, 229, 0.25)',
                                        transition: { duration: 0.3 }
                                    }}
                                >
                                    {/* Header with Real Image */}
                                    <div className="relative h-56 overflow-hidden w-full flex-shrink-0">
                                        <Image
                                            src={course.imageUrl}
                                            alt={course.nombre}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                                        {/* Icon Badge Container (Matches Screenshot overlay) */}
                                        <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-lg">
                                            <Icon className="h-5 w-5 text-white" />
                                        </div>

                                        <div className="absolute bottom-4 left-6 right-6 z-10">
                                            <h3 className="font-heading font-bold text-2xl text-white leading-tight mb-1">
                                                {course.nombre}
                                            </h3>
                                            <p className="text-white/80 text-sm font-medium">
                                                {cat.label}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex flex-col flex-grow">
                                        <p className="text-slate-700 mb-6 leading-relaxed text-sm flex-grow">
                                            {course.descripcion}
                                        </p>

                                        {/* Details */}
                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center text-sm">
                                                <Clock className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                                                <span className="text-slate-800">
                                                    <strong>Duración:</strong> {course.duracionHoras} horas
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <Award className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                                                <span className="text-slate-800">
                                                    <strong>Vigencia:</strong> {course.vigenciaMeses} meses
                                                </span>
                                            </div>
                                        </div>

                                        {/* CTA */}
                                        <Link
                                            href={`/registro?curso=${course.id}`}
                                            className="block w-full text-center px-6 py-3 bg-[#111827] text-white rounded-xl font-medium hover:bg-[#1f2937] hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                                        >
                                            Inscribirse Ahora
                                        </Link>
                                    </div>
                                </motion.div>
                            );
                        })}
                        {filteredCourses.length === 0 && (
                            <div className="col-span-full py-20 text-center">
                                <p className="text-slate-500 text-lg">Próximamente más capacitaciones en esta categoría.</p>
                            </div>
                        )}
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
        </section >
    );
}
