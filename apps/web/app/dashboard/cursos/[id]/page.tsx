'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    BookOpen,
    Clock,
    Loader2,
    ChevronRight,
    CheckCircle2,
    PlayCircle,
    FileText,
    HelpCircle,
    Award
} from 'lucide-react';
import { cursosApi } from '@/lib/api/cursos';
import { inscripcionesApi } from '@/lib/api/inscripciones';
import { CursoDetail, Inscripcion } from '@/types/training';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function CursoDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [curso, setCurso] = useState<CursoDetail | null>(null);
    const [inscripcion, setInscripcion] = useState<Inscripcion | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showCelebration, setShowCelebration] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cursoData, inscripcionData] = await Promise.all([
                    cursosApi.obtenerCurso(id as string),
                    inscripcionesApi.obtenerInscripcion(id as string).catch(() => null)
                ]);
                setCurso(cursoData);
                setInscripcion(inscripcionData);

                // Activar celebración si viene de completar el último módulo
                if (searchParams.get('completed') === 'true') {
                    setShowCelebration(true);
                    // Limpiar la URL sin refrescar
                    window.history.replaceState({}, '', `/dashboard/cursos/${id}`);
                }
            } catch (error) {
                console.error('Error fetching course detail:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, searchParams]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!curso) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-slate-900">Curso no encontrado</h2>
                <Button className="mt-4" asChild>
                    <Link href="/dashboard/cursos">Volver a mis cursos</Link>
                </Button>
            </div>
        );
    }

    const isEnrolled = !!inscripcion;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header / Hero */}
            <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                                {curso.codigo}
                            </span>
                            {isEnrolled && (
                                <span className="text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded">
                                    En curso
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                            {curso.nombre}
                        </h1>
                        <p className="text-slate-800 text-lg max-w-2xl">
                            {curso.descripcion}
                        </p>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-700 pt-2">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-secondary" />
                                <span>{curso.duracionHoras} Horas totales</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <BookOpen className="h-5 w-5 text-primary" />
                                <span>{curso.modulos?.length || 0} Módulos</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Modules List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900">Contenido del curso</h2>
                    <div className="space-y-4">
                        {curso.modulos?.map((modulo, index) => {
                            const isCompleted = inscripcion?.modulosCompletados?.includes(modulo.id);
                            const isNext = !isCompleted && (index === 0 || inscripcion?.modulosCompletados?.includes(curso.modulos![index - 1].id));
                            const isDisabled = isEnrolled && !isCompleted && !isNext;

                            return (
                                <Card
                                    key={modulo.id}
                                    className={`relative border-l-4 transition-all ${isCompleted ? 'border-l-success bg-success/5' :
                                        isNext ? 'border-l-primary bg-primary/5' :
                                            'border-l-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-2 rounded-lg ${isCompleted ? 'bg-success/10 text-success' :
                                                isNext ? 'bg-primary/10 text-primary' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                {modulo.tipo === 'TEORIA' ? <FileText className="h-5 w-5" /> :
                                                    modulo.tipo === 'QUIZ' ? <HelpCircle className="h-5 w-5" /> :
                                                        <PlayCircle className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                                    Módulo {modulo.orden}
                                                </div>
                                                <h3 className={`font-bold ${isDisabled ? 'text-slate-600' : 'text-slate-900'}`}>
                                                    {modulo.titulo}
                                                </h3>
                                            </div>
                                        </div>

                                        {isEnrolled ? (
                                            <div className="flex items-center space-x-3">
                                                {isCompleted ? (
                                                    <CheckCircle2 className="h-6 w-6 text-success" />
                                                ) : isNext ? (
                                                    <Button size="sm" asChild>
                                                        <Link href={`/dashboard/cursos/${curso.id}/modulos/${modulo.id}`}>
                                                            Iniciar
                                                        </Link>
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs text-slate-600 italic">No disponible</span>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Tarjeta de Certificado si está completado */}
                    {isEnrolled && inscripcion.progreso === 100 && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg border-0"
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Award className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold">¡Felicitaciones!</h3>
                            </div>
                            <p className="text-white/90 text-sm mb-6">
                                Completaste con éxito todas las instancias de esta capacitación profesional.
                            </p>
                            <Button
                                className="w-full bg-white text-emerald-600 hover:bg-emerald-50 font-bold py-6 text-lg"
                                asChild
                            >
                                <Link href={`/dashboard/certificados?curso=${curso.id}`}>
                                    Descargar Credencial
                                </Link>
                            </Button>
                        </motion.div>
                    )}

                    <Card>
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Sobre esta capacitación</h3>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="p-2 bg-slate-50 rounded-lg">
                                    <BookOpen className="h-4 w-4 text-slate-800" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">Modalidad Flexible</div>
                                    <div className="text-xs text-slate-700">Avanza a tu propio ritmo desde cualquier dispositivo.</div>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="p-2 bg-slate-50 rounded-lg">
                                    <CheckCircle2 className="h-4 w-4 text-slate-800" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">Certificado Oficial</div>
                                    <div className="text-xs text-slate-700">Obtén tu credencial VMP al finalizar todos los módulos.</div>
                                </div>
                            </div>
                        </div>

                        {!isEnrolled && (
                            <Button
                                className="w-full mt-6"
                                onClick={async () => {
                                    try {
                                        await inscripcionesApi.inscribirse(curso.id);
                                        window.location.reload();
                                    } catch (err) {
                                        alert('Error al inscribirse');
                                    }
                                }}
                            >
                                Inscribirme Ahora
                            </Button>
                        )}
                    </Card>

                    {isEnrolled && (
                        <Card className="bg-gradient-to-br from-primary to-primary-light text-white border-0">
                            <h3 className="text-lg font-bold mb-2">Tu Progreso</h3>
                            <div className="text-3xl font-bold mb-4">{inscripcion.progreso}%</div>
                            <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                                <div
                                    className="bg-white h-2 rounded-full transition-all duration-1000"
                                    style={{ width: `${inscripcion.progreso}%` }}
                                />
                            </div>
                            <p className="text-sm text-white/80">
                                {inscripcion.modulosCompletados?.length || 0} de {curso.modulos?.length || 0} módulos completados
                            </p>
                        </Card>
                    )}
                </div>
            </div>

            {/* Overlay de Celebración */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setShowCelebration(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.5, y: 100 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.5, y: 100 }}
                            className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl overflow-hidden relative"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Partículas visuales */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary" />

                            <div className="mb-6 relative">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                                <Award className="h-20 w-20 text-primary mx-auto relative animate-bounce" />
                            </div>

                            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
                                ¡Curso Completado!
                            </h2>
                            <p className="text-slate-700 mb-8">
                                Felicitaciones por completar satisfactoriamente <strong>{curso.nombre}</strong>. Tu esfuerzo ha dado frutos.
                            </p>

                            <div className="space-y-3">
                                <Button
                                    className="w-full py-6 text-lg font-bold shadow-lg shadow-primary/20"
                                    onClick={() => setShowCelebration(false)}
                                >
                                    ¡Genial!
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
