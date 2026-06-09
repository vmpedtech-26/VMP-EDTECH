'use client';

import { useState, useEffect, useCallback } from 'react';
import { Truck, Shield, Mountain, Snowflake, Clock, Monitor, CalendarCheck, CheckCircle, ArrowRight, ChevronLeft, ChevronRight, RefreshCw, X, FileText, Target, Users, BookOpen, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { courseData, type CourseDetail } from '@/lib/course-data';

const courseStyles: Record<string, { accentColor: string; glowColor: string; icon: any }> = {
    'conduccion-preventiva': {
        accentColor: 'from-teal-500 to-cyan-400',
        glowColor: 'rgba(20, 184, 166, 0.25)',
        icon: Shield,
    },
    'conduccion-renovacion': {
        accentColor: 'from-violet-500 to-indigo-400',
        glowColor: 'rgba(139, 92, 246, 0.25)',
        icon: RefreshCw,
    },
    'conduccion-invernal': {
        accentColor: 'from-sky-400 to-blue-300',
        glowColor: 'rgba(56, 189, 248, 0.25)',
        icon: Snowflake,
    },
    'conduccion-segura': {
        accentColor: 'from-amber-500 to-yellow-400',
        glowColor: 'rgba(245, 158, 11, 0.25)',
        icon: Shield,
    },
    'flota-liviana-pesada': {
        accentColor: 'from-blue-500 to-indigo-400',
        glowColor: 'rgba(99, 102, 241, 0.25)',
        icon: Truck,
    },
    'doble-traccion': {
        accentColor: 'from-orange-500 to-amber-400',
        glowColor: 'rgba(249, 115, 22, 0.25)',
        icon: Mountain,
    },
    'trabajo-en-altura': {
        accentColor: 'from-red-500 to-rose-400',
        glowColor: 'rgba(239, 68, 68, 0.25)',
        icon: Mountain,
    },
};

const courses = Object.keys(courseData).map((key) => {
    const data = courseData[key];
    const style = courseStyles[key] || {
        accentColor: 'from-teal-500 to-cyan-400',
        glowColor: 'rgba(20, 184, 166, 0.25)',
        icon: Shield,
    };
    return {
        ...data,
        id: key,
        ...style,
    };
});

const AUTOPLAY_INTERVAL = 6000;

export default function CourseCatalog() {
    const [active, setActive] = useState(0);
    const [direction, setDirection] = useState(1);
    const [isPaused, setIsPaused] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<typeof courses[0] | null>(null);
    const [activeTab, setActiveTab] = useState<'resumen' | 'temario' | 'evaluaciones'>('resumen');

    const goTo = useCallback((index: number, dir?: number) => {
        setDirection(dir ?? (index > active ? 1 : -1));
        setActive(index);
    }, [active]);

    const next = useCallback(() => {
        const nextIdx = (active + 1) % courses.length;
        goTo(nextIdx, 1);
    }, [active, goTo]);

    const prev = useCallback(() => {
        const prevIdx = (active - 1 + courses.length) % courses.length;
        goTo(prevIdx, -1);
    }, [active, goTo]);

    useEffect(() => {
        if (isPaused || selectedCourse) return;
        const timer = setInterval(next, AUTOPLAY_INTERVAL);
        return () => clearInterval(timer);
    }, [next, isPaused, selectedCourse]);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (selectedCourse) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedCourse]);

    const course = courses[active];
    const Icon = course.icon;

    const variants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 60 : -60,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
            transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        },
        exit: (dir: number) => ({
            x: dir > 0 ? -60 : 60,
            opacity: 0,
            transition: { duration: 0.35 },
        }),
    };

    const imgVariants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 80 : -80,
            opacity: 0,
            scale: 0.96,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
        exit: (dir: number) => ({
            x: dir > 0 ? -80 : 80,
            opacity: 0,
            scale: 0.96,
            transition: { duration: 0.35 },
        }),
    };

    return (
        <section
            id="cursos"
            className="relative py-0 overflow-hidden bg-[#0a1628]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Background Image & Grid Overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[#0a1628]" />
                <Image
                    src="/images/vmp_hero_winter.png"
                    alt="Background Winter Road"
                    fill
                    className="object-cover opacity-[0.35]"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/70 via-[#0a1628]/50 to-[#0a1628]/90" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.06)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            {/* Ambient glow that changes with course */}
            <motion.div
                key={`glow-${active}`}
                className="absolute inset-0 pointer-events-none z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <div
                    className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px]"
                    style={{ background: course.glowColor }}
                />
            </motion.div>

            {/* Section header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6 relative z-20">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-teal-400 text-sm font-bold uppercase tracking-[0.2em] mb-2">Catálogo de Formación</p>
                        <h2 className="text-3xl md:text-4xl font-bold font-heading text-white">
                            Programas de Capacitación
                        </h2>
                    </div>
                    {/* Dot indicators */}
                    <div className="hidden md:flex items-center gap-2">
                        {courses.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                className={`transition-all duration-300 rounded-full ${i === active ? 'w-8 h-2 bg-teal-400' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`}
                                aria-label={`Curso ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Main slider */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-20">
                <div className="relative min-h-[490px] flex items-center">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={active}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
                        >
                            {/* Left: Content */}
                            <div className="flex flex-col justify-center space-y-5 py-8">
                                {/* Category badge */}
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${course.accentColor} flex items-center justify-center`}>
                                        <Icon className="w-4 h-4 text-white" />
                                    </div>
                                    <span className={`text-xs font-bold tracking-[0.2em] bg-gradient-to-r ${course.accentColor} bg-clip-text text-transparent`}>
                                        {course.category}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-white leading-tight">
                                    {course.title}
                                </h3>

                                {/* Description */}
                                <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl">
                                    {course.description}
                                </p>

                                {/* Stats row */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { icon: Clock, label: 'Duración', value: course.duration },
                                        { icon: Monitor, label: 'Modalidad', value: course.modality },
                                        { icon: CalendarCheck, label: 'Vigencia', value: course.validity },
                                        { icon: CheckCircle, label: 'Acreditación', value: course.minScore },
                                    ].map(({ icon: StatIcon, label, value }) => (
                                        <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                                            <StatIcon className="w-4 h-4 text-teal-400 mb-1.5" />
                                            <p className="text-slate-400 text-xs mb-0.5">{label}</p>
                                            <p className="text-white text-sm font-semibold">{value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA buttons */}
                                <div className="flex flex-wrap gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setSelectedCourse(course);
                                            setActiveTab('resumen');
                                        }}
                                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${course.accentColor} text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}
                                    >
                                        Ver Ficha Técnica
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                    <Link
                                        href={`/cursos/${course.slug}`}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-all duration-300"
                                    >
                                        Ver Detalle Completo
                                    </Link>
                                </div>
                            </div>

                            {/* Right: Image */}
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={`img-${active}`}
                                    custom={direction}
                                    variants={imgVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    className="relative hidden lg:block"
                                >
                                    {/* Glow behind image */}
                                    <div
                                        className="absolute inset-0 rounded-2xl blur-2xl scale-95 translate-y-4"
                                        style={{ background: course.glowColor, opacity: 0.6 }}
                                    />
                                    <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl aspect-[16/10]">
                                        <Image
                                            src={course.image}
                                            alt={course.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            priority
                                        />
                                        {/* Subtle overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/30 via-transparent to-transparent" />
                                        {/* VMP badge */}
                                        <div className="absolute top-4 left-4">
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${course.accentColor} text-white shadow`}>
                                                Certificación IAPG / VMP
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation arrows + mobile dots */}
                <div className="flex items-center justify-between mt-6">
                    {/* Mobile dots */}
                    <div className="flex md:hidden items-center gap-2">
                        {courses.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                className={`transition-all duration-300 rounded-full ${i === active ? 'w-6 h-2 bg-teal-400' : 'w-2 h-2 bg-white/20'}`}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                        {/* Progress bar */}
                        <div className="hidden sm:flex items-center gap-2 mr-4">
                            <span className="text-slate-400 text-xs tabular-nums">{active + 1} / {courses.length}</span>
                            <div className="w-24 h-0.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full bg-gradient-to-r ${course.accentColor} rounded-full`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((active + 1) / courses.length) * 100}%` }}
                                    transition={{ duration: 0.4 }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={prev}
                            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                            aria-label="Anterior"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={next}
                            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                            aria-label="Siguiente"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Interactive Ficha Técnica Drawer (Slide-over) */}
            <AnimatePresence>
                {selectedCourse && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedCourse(null)}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 pointer-events-auto"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                            className="fixed top-0 right-0 h-full w-full sm:max-w-2xl bg-[#0b1629] border-l border-white/10 shadow-2xl z-50 flex flex-col pointer-events-auto"
                        >
                            {/* Drawer Header */}
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
                                <div>
                                    <span className={`text-[10px] font-bold tracking-[0.2em] px-2 py-0.5 rounded bg-gradient-to-r ${selectedCourse.accentColor} text-white`}>
                                        {selectedCourse.category}
                                    </span>
                                    <h3 className="text-xl sm:text-2xl font-bold text-white mt-2 font-heading">
                                        {selectedCourse.title}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setSelectedCourse(null)}
                                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                                    aria-label="Cerrar"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Drawer Content Tabs Navigation */}
                            <div className="border-b border-white/10 bg-slate-950/20 px-6 flex overflow-x-auto gap-6 scrollbar-hide">
                                {([
                                    { id: 'resumen', label: 'Resumen' },
                                    { id: 'temario', label: 'Programa' },
                                    { id: 'evaluaciones', label: 'Evaluaciones' }
                                ] as const).map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-4 text-sm font-semibold transition-all relative shrink-0 ${activeTab === tab.id ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                                    >
                                        {tab.label}
                                        {activeTab === tab.id && (
                                            <motion.div
                                                layoutId="activeTabUnderline"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Drawer Body (Scrollable) */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Tab: Resumen */}
                                {activeTab === 'resumen' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <h4 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-2">Descripción General</h4>
                                            <p className="text-slate-300 text-sm sm:text-base leading-relaxed bg-white/5 border border-white/5 rounded-2xl p-4">
                                                {selectedCourse.longDescription}
                                            </p>
                                        </div>

                                        {selectedCourse.objectives && (
                                            <div>
                                                <h4 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <Target className="w-4 h-4" /> Objetivo del Programa
                                                </h4>
                                                <p className="text-slate-300 text-sm leading-relaxed bg-white/5 border border-white/5 rounded-2xl p-4">
                                                    {selectedCourse.objectives}
                                                </p>
                                            </div>
                                        )}

                                        {selectedCourse.scope && (
                                            <div>
                                                <h4 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <Users className="w-4 h-4" /> Alcance
                                                </h4>
                                                <p className="text-slate-300 text-sm leading-relaxed bg-white/5 border border-white/5 rounded-2xl p-4">
                                                    {selectedCourse.scope}
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Tab: Temario */}
                                {activeTab === 'temario' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        {selectedCourse.temario.map((modulo, i) => (
                                            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                                                <div className="bg-slate-900/60 px-5 py-3.5 border-b border-white/10 flex items-center gap-3">
                                                    <div className="h-6 w-6 rounded-full bg-teal-400/20 flex items-center justify-center text-teal-400 font-bold text-xs">
                                                        {i + 1}
                                                    </div>
                                                    <h5 className="font-bold text-white text-sm">
                                                        {modulo.title}
                                                    </h5>
                                                </div>
                                                <div className="p-5">
                                                    <ul className="space-y-3">
                                                        {modulo.topics.map((tema, j) => (
                                                            <li key={j} className="flex items-start gap-2.5">
                                                                <BookOpen className="w-4 h-4 text-teal-400/70 shrink-0 mt-0.5" />
                                                                <span className="text-slate-300 text-sm">{tema}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}

                                {/* Tab: Evaluaciones */}
                                {activeTab === 'evaluaciones' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="bg-teal-950/10 border border-teal-500/20 rounded-2xl p-4 mb-2 flex gap-3">
                                            <AlertCircle className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                                            <p className="text-xs text-slate-300 leading-relaxed">
                                                Nuestros programas siguen los lineamientos de acreditación de la Escuela de Conducción Defensiva del IAPG para habilitaciones en yacimiento.
                                            </p>
                                        </div>

                                        {selectedCourse.evaluacionesInfo ? (
                                            <div className="grid gap-4">
                                                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                                    <h5 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-teal-400" /> Examen Teórico
                                                    </h5>
                                                    <p className="text-slate-300 text-sm leading-relaxed">
                                                        {selectedCourse.evaluacionesInfo.teorico}
                                                    </p>
                                                </div>

                                                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                                    <h5 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-teal-400" /> Examen Práctico
                                                    </h5>
                                                    <p className="text-slate-300 text-sm leading-relaxed">
                                                        {selectedCourse.evaluacionesInfo.practico}
                                                    </p>
                                                </div>

                                                {selectedCourse.evaluacionesInfo.psicosensometrico && (
                                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                                        <h5 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                                                            <span className="h-2 w-2 rounded-full bg-teal-400" /> Evaluación Psicosensométrica / Psicotécnica
                                                        </h5>
                                                        <p className="text-slate-300 text-sm leading-relaxed">
                                                            {selectedCourse.evaluacionesInfo.psicosensometrico}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                                                <p className="text-slate-400 text-sm">
                                                    Evaluación continua de carácter teórico-práctico en campo y aprobación mediante cuestionario virtual final. Nota mínima: {selectedCourse.minScore}.
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}


                            </div>

                            {/* Drawer Footer */}
                            <div className="p-6 border-t border-white/10 bg-slate-950/60 flex flex-col sm:flex-row gap-3">
                                <Link
                                    href="/#contacto"
                                    onClick={() => setSelectedCourse(null)}
                                    className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r ${selectedCourse.accentColor} text-white font-bold text-sm shadow hover:scale-[1.02] transition-transform`}
                                >
                                    Consultar por este Curso
                                    <ArrowRight className="w-4 h-4" />
                                </Link>

                                {selectedCourse.pdfProgramaUrl && (
                                    <a
                                        href={selectedCourse.pdfProgramaUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
                                    >
                                        <FileText className="w-4 h-4 text-teal-400" />
                                        Programa PDF
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </section>
    );
}
