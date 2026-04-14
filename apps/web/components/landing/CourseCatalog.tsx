'use client';

import { useState, useEffect, useCallback } from 'react';
import { Truck, Shield, Mountain, Snowflake, Clock, Monitor, CalendarCheck, CheckCircle, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const courses = [
    {
        id: 'preventivo',
        slug: 'conduccion-preventiva',
        icon: Shield,
        title: 'Conducción Preventiva',
        category: 'PREVENTIVO',
        duration: '8 horas',
        modality: '100% Online',
        validity: '12 meses',
        minScore: '70%',
        longDescription: 'Curso integral diseñado para formar conductores capaces de anticipar y prevenir situaciones de riesgo en la vía pública. Combina fundamentos teóricos de seguridad vial con técnicas prácticas de conducción defensiva, preparando al conductor para tomar decisiones seguras en todo tipo de escenarios.',
        image: '/images/courses/conduccion-preventiva.png',
        accentColor: 'from-teal-500 to-cyan-400',
        glowColor: 'rgba(20, 184, 166, 0.25)',
    },
    {
        id: 'carga-pesada',
        slug: 'flota-liviana-pesada',
        icon: Truck,
        title: 'Conducción Flota Liviana / Pesada',
        category: 'TRANSPORTE',
        duration: '12 horas',
        modality: 'Online/Presencial',
        validity: '24 meses',
        minScore: '75%',
        longDescription: 'Programa de capacitación diseñado específicamente para conductores de vehículos de flota liviana y pesada. Abarca inspección pre-operacional, técnicas avanzadas de maniobra con carga y normativas de tránsito pesado vigentes.',
        image: '/images/courses/carga-pesada.png',
        accentColor: 'from-blue-500 to-indigo-400',
        glowColor: 'rgba(99, 102, 241, 0.25)',
    },
    {
        id: '2-traccion',
        slug: 'doble-traccion',
        icon: Mountain,
        title: 'Conducción Doble Tracción',
        category: 'ESPECIALIZADO',
        duration: '16 horas',
        modality: 'Presencial',
        validity: '36 meses',
        minScore: '80%',
        longDescription: 'Manejo avanzado en terrenos difíciles con técnicas de tracción diferencial, recuperación vehicular en campo y protocolos de seguridad en zonas remotas de alta montaña y acceso petrolero.',
        image: '/images/courses/conduccion-2-traccion.png',
        accentColor: 'from-orange-500 to-amber-400',
        glowColor: 'rgba(249, 115, 22, 0.25)',
    },
    {
        id: 'invernal',
        slug: 'conduccion-invernal',
        icon: Snowflake,
        title: 'Conducción Invernal',
        category: 'CORDILLERANO',
        duration: '12 horas',
        modality: 'Online/Presencial',
        validity: '12 meses',
        minScore: '80%',
        longDescription: 'Técnicas avanzadas para conducción segura en presencia de nieve, hielo y condiciones climáticas extremas. Indispensable para rutas cordilleranas y zonas patagónicas con temporada invernal severa.',
        image: '/images/courses/conduccion-invernal.png',
        accentColor: 'from-sky-400 to-blue-300',
        glowColor: 'rgba(56, 189, 248, 0.25)',
    },
];

const AUTOPLAY_INTERVAL = 5000;

export default function CourseCatalog() {
    const [active, setActive] = useState(0);
    const [direction, setDirection] = useState(1);
    const [isPaused, setIsPaused] = useState(false);

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
        if (isPaused) return;
        const timer = setInterval(next, AUTOPLAY_INTERVAL);
        return () => clearInterval(timer);
    }, [next, isPaused]);

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
            className="relative py-0 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d1f3c 50%, #0a1628 100%)' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Ambient glow that changes with course */}
            <motion.div
                key={`glow-${active}`}
                className="absolute inset-0 pointer-events-none"
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-teal-400 text-sm font-bold uppercase tracking-[0.2em] mb-2">Catálogo de Formación</p>
                        <h2 className="text-3xl md:text-4xl font-bold font-heading text-white">
                            Nuestros Cursos de Capacitación
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
                <div className="relative min-h-[460px] flex items-center">
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
                            <div className="flex flex-col justify-center space-y-6 py-8">
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
                                <h3 className="text-4xl md:text-5xl font-bold font-heading text-white leading-tight">
                                    {course.title}
                                </h3>

                                {/* Description */}
                                <p className="text-slate-300 text-base leading-relaxed max-w-xl">
                                    {course.longDescription}
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
                                    <Link
                                        href="/#contacto"
                                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${course.accentColor} text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}
                                    >
                                        Consultar por este Curso
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        href={`/cursos/${course.slug}`}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-all duration-300"
                                    >
                                        Ver todos los cursos
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
                                            priority
                                        />
                                        {/* Subtle overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/30 via-transparent to-transparent" />
                                        {/* VMP badge */}
                                        <div className="absolute top-4 left-4">
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${course.accentColor} text-white shadow`}>
                                                VMP Certificado
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
        </section>
    );
}
