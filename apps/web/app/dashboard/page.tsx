'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { BookOpen, Award, TrendingUp, Clock, Loader2, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';
import { inscripcionesApi } from '@/lib/api/inscripciones';
import { examenesApi } from '@/lib/api/examenes';
import { MisCursosResponse, Credencial } from '@/types/training';
import { CardCredencial } from '@/components/dashboard/CardCredencial';

export default function DashboardPage() {
    const { user } = useAuth();
    const [data, setData] = useState<MisCursosResponse | null>(null);
    const [credenciales, setCredenciales] = useState<Credencial[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cursosRes, credRes] = await Promise.all([
                    inscripcionesApi.misCursos(),
                    examenesApi.misCredenciales(),
                ]);
                setData(cursosRes);
                setCredenciales(credRes);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-cyan-600 animate-spin" />
            </div>
        );
    }

    const stats = data?.stats || {
        cursosActivos: 0,
        cursosCompletados: 0,
        credencialesObtenidas: 0,
        horasAcumuladas: 0,
    };

    const cursosActivos = data?.cursos || [];

    // Framer motion variants for premium load animations
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut' },
        },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Header / Welcome Area */}
            <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-[2rem] p-8 md:p-10 border border-slate-200/60 shadow-xl bg-gradient-to-br from-slate-900 via-[#1F3A47] to-slate-950 text-white"
            >
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20">
                            <Shield className="h-5 w-5 text-cyan-400" />
                        </div>
                        <span className="text-[10px] font-black tracking-[0.25em] uppercase text-cyan-400">
                            VMP EdTech • Panel de Control Oficial
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-heading font-black text-white leading-tight">
                        ¡Hola, <span className="text-cyan-400">{user?.nombre || 'Estudiante'}</span>!
                    </h1>
                    <p className="text-slate-350 mt-3 max-w-xl text-base font-medium leading-relaxed">
                        Gestiona tus capacitaciones profesionales de alta tecnología y visualiza tus credenciales verificadas en tiempo real.
                    </p>
                </div>
                
                {/* Subtle technology grid overlay */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ 
                    backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', 
                    backgroundSize: '24px 24px' 
                }} />
                
                {/* Decorative radial glows */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] -translate-y-12 translate-x-12 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-500/20 rounded-full blur-[80px] translate-y-12 -translate-x-12 pointer-events-none" />
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Cursos Activos', value: stats.cursosActivos, icon: BookOpen, color: 'from-cyan-500 to-cyan-600', textClass: 'text-cyan-600 shadow-cyan-500/10' },
                    { label: 'Credenciales', value: stats.credencialesObtenidas, icon: Award, color: 'from-emerald-500 to-emerald-600', textClass: 'text-emerald-600 shadow-emerald-500/10' },
                    { label: 'Completados', value: stats.cursosCompletados, icon: TrendingUp, color: 'from-amber-500 to-amber-600', textClass: 'text-amber-600 shadow-amber-500/10' },
                    { label: 'Total Horas', value: `${stats.horasAcumuladas}h`, icon: Clock, color: 'from-slate-700 to-slate-800', textClass: 'text-slate-750 shadow-slate-600/10' },
                ].map((stat, idx) => (
                    <div 
                        key={idx}
                        className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center space-x-4 group hover:border-cyan-500/10"
                    >
                        <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl text-white shadow-md group-hover:scale-105 transition-transform duration-300`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <div className={`text-2xl font-black ${stat.textClass}`}>
                                {stat.value}
                            </div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Cursos Activos */}
            <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-heading font-black text-slate-900 tracking-tight">Mis Cursos Activos</h2>
                    <Button variant="outline" size="sm" asChild className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider">
                        <Link href="/dashboard/cursos">Ver Todos</Link>
                    </Button>
                </div>

                <div className="space-y-4">
                    {cursosActivos.length > 0 ? (
                        cursosActivos.map((curso) => (
                            <div 
                                key={curso.id}
                                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">
                                            {curso.nombre}
                                        </h3>
                                        <div className="flex items-center space-x-4 text-xs text-slate-500 font-bold uppercase tracking-wider">
                                            <span className="text-cyan-600 font-black">Progreso: {curso.progreso}%</span>
                                            <span className="text-slate-300">•</span>
                                            <span>Próximo: {curso.proximaActividad}</span>
                                        </div>

                                        {/* Progress Bar with neon details */}
                                        <div className="mt-4 w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/50">
                                            <div
                                                className="bg-gradient-to-r from-cyan-500 to-cyan-600 h-2.5 rounded-full transition-all duration-500 relative"
                                                style={{ width: `${curso.progreso}%` }}
                                            >
                                                {/* Neon dynamic shine line */}
                                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                            </div>
                                        </div>
                                    </div>

                                    <Button size="sm" asChild className="rounded-xl bg-cyan-600 hover:bg-cyan-700 font-bold uppercase tracking-wider text-xs px-6 py-3.5 shadow-lg shadow-cyan-600/10 border-0">
                                        <Link href={`/dashboard/cursos/${curso.id}`}>
                                            Continuar
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-semibold">No tienes cursos activos en este momento.</p>
                            <Button size="sm" asChild className="mt-4 rounded-xl bg-cyan-600 hover:bg-cyan-700">
                                <Link href="/dashboard/explorar">Explorar Catálogo</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Credenciales Recientes */}
            <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-heading font-black text-slate-900 tracking-tight">
                        Credenciales Recientes
                    </h2>
                    <Button variant="outline" size="sm" asChild className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider">
                        <Link href="/dashboard/credenciales">Ver Todas</Link>
                    </Button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {credenciales.length > 0 ? (
                        credenciales.slice(0, 3).map((cre) => (
                            <CardCredencial key={cre.id} credencial={cre} />
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                            <Award className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-semibold">
                                Aún no tienes credenciales generadas.
                                <br /> Completa un curso para obtener la tuya.
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
