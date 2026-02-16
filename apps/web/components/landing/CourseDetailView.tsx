'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Award, Monitor, CheckCircle, Users, ArrowRight, BookOpen, Target, FileCheck, Shield, Truck, Mountain } from 'lucide-react';
import type { CourseDetail } from '@/lib/course-data';

const courseIcons: Record<string, any> = {
    'conduccion-preventiva': Shield,
    'flota-liviana-pesada': Truck,
    'doble-traccion': Mountain,
};

interface CourseDetailPageProps {
    course: CourseDetail;
}

export default function CourseDetailView({ course }: CourseDetailPageProps) {
    const Icon = courseIcons[course.slug] || Shield;

    return (
        <>
            {/* Hero */}
            <section className="relative pt-24 pb-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A192F] via-[#0F2444] to-[#162D50]" />
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Text */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <Icon className="h-6 w-6 text-primary" />
                                </div>
                                <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                                    {course.category}
                                </span>
                            </div>

                            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                                {course.title}
                            </h1>

                            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                                {course.longDescription}
                            </p>

                            {/* Quick stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                                {[
                                    { icon: Clock, label: 'Duración', value: course.duration },
                                    { icon: Monitor, label: 'Modalidad', value: course.modality },
                                    { icon: Award, label: 'Vigencia', value: course.validity },
                                    { icon: Target, label: 'Aprobación', value: course.minScore },
                                ].map((stat) => (
                                    <div key={stat.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center">
                                        <stat.icon className="h-5 w-5 text-primary mx-auto mb-1" />
                                        <p className="text-xs text-slate-400">{stat.label}</p>
                                        <p className="text-sm font-bold text-white">{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/#contacto"
                                    className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-primary/25"
                                >
                                    Consultar por este Curso
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                                <Link
                                    href="/cursos"
                                    className="inline-flex items-center justify-center gap-2 border border-white/20 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-xl transition-all"
                                >
                                    Ver todos los cursos
                                </Link>
                            </div>
                        </motion.div>

                        {/* Image */}
                        <motion.div
                            className="hidden lg:block"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                                <Image
                                    src={course.image}
                                    alt={course.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">
                            ¿Por qué elegir este curso?
                        </h2>
                        <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
                            {course.targetAudience}
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {course.benefits.map((benefit, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                className="flex gap-4 p-5 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:shadow-md transition-all"
                            >
                                <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                                <p className="text-slate-700 font-medium">{benefit}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Temario */}
            <section className="py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">
                            Temario del Curso
                        </h2>
                        <p className="text-slate-600">Contenido completo organizado por módulos</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {course.temario.map((module, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="bg-gradient-to-r from-primary to-secondary px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                                            {i + 1}
                                        </div>
                                        <h3 className="font-bold text-white text-sm">
                                            {module.title}
                                        </h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <ul className="space-y-3">
                                        {module.topics.map((topic, j) => (
                                            <li key={j} className="flex items-start gap-3">
                                                <BookOpen className="h-4 w-4 text-primary shrink-0 mt-1" />
                                                <span className="text-slate-700 text-sm">{topic}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Requirements + Certification */}
            <section className="py-16 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Requirements */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-slate-50 rounded-2xl p-8 border border-slate-100"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-amber-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Requisitos</h3>
                            </div>
                            <ul className="space-y-3">
                                {course.requirements.map((req, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                                        <span className="text-slate-700">{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Certification */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 border border-primary/10"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <FileCheck className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Certificación</h3>
                            </div>
                            <p className="text-slate-700 leading-relaxed mb-6">
                                {course.certification}
                            </p>
                            <div className="bg-white rounded-xl p-4 border border-primary/10">
                                <div className="flex items-center gap-3">
                                    <Award className="h-8 w-8 text-primary" />
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">Vigencia: {course.validity}</p>
                                        <p className="text-slate-500 text-xs">Verificable con QR desde cualquier dispositivo</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-gradient-to-br from-[#0A192F] to-[#162D50]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold text-white mb-4">
                            ¿Listo para capacitarte en {course.shortTitle}?
                        </h2>
                        <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                            Contactanos para obtener más información, precios corporativos y fechas de inicio.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link
                                href="/#contacto"
                                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-primary/25"
                            >
                                Consultar por este Curso
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                            <a
                                href="https://wa.me/542995370173?text=Hola%2C%20me%20interesa%20el%20curso%20de%20"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold px-8 py-4 rounded-xl transition-all"
                            >
                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.123 1.526 5.858L.057 23.534a.5.5 0 00.61.61l5.676-1.47A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.918 0-3.752-.5-5.382-1.448l-.386-.23-3.369.872.897-3.279-.252-.4A9.8 9.8 0 012.18 12C2.18 6.58 6.58 2.18 12 2.18S21.82 6.58 21.82 12 17.42 21.82 12 21.82z" />
                                </svg>
                                Consultar por WhatsApp
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
