'use client';

import { useEffect, useState } from 'react';
import { Truck, Shield, Mountain, ArrowRight, Clock, Award, Smartphone, BookOpen, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { publicApi } from '@/lib/api/public';
import { Curso } from '@/types/training';

const CATEGORY_MAP: Record<string, { icon: any, label: string, color: string }> = {
    'Transporte': { icon: Truck, label: 'Transporte', color: 'bg-blue-500' },
    'Preventivo': { icon: Shield, label: 'Preventivo', color: 'bg-emerald-500' },
    'Especializado': { icon: Mountain, label: 'Especializado', color: 'bg-amber-500' },
    'Default': { icon: BookOpen, label: 'Capacitación', color: 'bg-primary' }
};

export default function CourseCatalog() {
    const [courses, setCourses] = useState<Curso[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await publicApi.listarCursosPublicos();
                setCourses(data);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const tabs = [
        { id: 'all', label: 'Todos' },
        { id: 'Transporte', label: 'Transporte' },
        { id: 'Preventivo', label: 'Seguridad' },
        { id: 'Especializado', label: 'Técnico' }
    ];

    const filteredCourses = activeTab === 'all'
        ? courses
        : courses.filter(c => {
            // Intentar inferir categoría o usar default
            const cat = c.nombre.toLowerCase().includes('conduccion') ? 'Transporte' :
                c.nombre.toLowerCase().includes('seguridad') ? 'Preventivo' : 'Especializado';
            return cat === activeTab;
        });

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
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-96 bg-white/50 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            key={activeTab}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {filteredCourses.map((course, index) => {
                                // Inferir categoría para estilo
                                const catKey = course.nombre.toLowerCase().includes('conduccion') ? 'Transporte' :
                                    course.nombre.toLowerCase().includes('seguridad') ? 'Preventivo' :
                                        course.nombre.toLowerCase().includes('montaña') ? 'Especializado' : 'Default';
                                const cat = CATEGORY_MAP[catKey];
                                const Icon = cat.icon;

                                // Imagen por defecto o basada en categoría
                                const imageUrl = `/images/courses/${catKey.toLowerCase()}.png`;

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
                                    >
                                        {/* Header with Image */}
                                        <div className="relative h-48 overflow-hidden bg-slate-100">
                                            {/* Usamos un fallback visual si la imagen no existe */}
                                            <div className={`absolute inset-0 ${cat.color} opacity-10`} />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                            <div className="absolute top-4 left-4">
                                                <span className="bg-white/90 backdrop-blur-sm text-primary px-3 py-1 rounded-full text-xs font-bold">
                                                    {course.codigo}
                                                </span>
                                            </div>

                                            <div className="absolute bottom-4 left-6 right-6">
                                                <Icon className="h-10 w-10 text-white mb-2" />
                                                <h3 className="font-heading font-bold text-2xl text-white mb-1 line-clamp-1">
                                                    {course.nombre}
                                                </h3>
                                                <p className="text-white/80 text-sm">
                                                    {cat.label}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6 bg-white min-h-[220px] flex flex-col">
                                            <p className="text-slate-800 mb-6 leading-relaxed line-clamp-3">
                                                {course.descripcion}
                                            </p>

                                            {/* Details */}
                                            <div className="space-y-3 mb-6 mt-auto">
                                                <div className="flex items-center text-sm">
                                                    <Clock className="h-4 w-4 text-primary mr-2" />
                                                    <span className="text-slate-800">
                                                        <strong>Duración:</strong> {course.duracionHoras} horas
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-sm">
                                                    <Award className="h-4 w-4 text-primary mr-2" />
                                                    <span className="text-slate-800">
                                                        <strong>Vigencia:</strong> {course.vigenciaMeses || 12} meses
                                                    </span>
                                                </div>
                                            </div>

                                            {/* CTA */}
                                            <Link
                                                href={`/registro?curso=${course.id}`}
                                                className="block w-full text-center px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                                            >
                                                Inscribirse Ahora
                                            </Link>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            {filteredCourses.length === 0 && !isLoading && (
                                <div className="col-span-full py-20 text-center">
                                    <p className="text-slate-500 text-lg">Próximamente más capacitaciones en esta categoría.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
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
