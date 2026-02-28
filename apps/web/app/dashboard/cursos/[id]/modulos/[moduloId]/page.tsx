'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { cursosApi } from '@/lib/api/cursos';
import { inscripcionesApi } from '@/lib/api/inscripciones';
import { Modulo } from '@/types/training';
import { TheoriaViewer } from '@/components/training/TheoriaViewer';
import { QuizViewer } from '@/components/training/QuizViewer';
import { PracticaViewer } from '@/components/training/PracticaViewer';

export default function ModuloDetailPage() {
    const { id, moduloId } = useParams();
    const router = useRouter();
    const [modulo, setModulo] = useState<Modulo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchModulo = async () => {
            try {
                const data = await cursosApi.obtenerModulo(id as string, moduloId as string);
                setModulo(data);
            } catch (error) {
                console.error('Error fetching modulo:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id && moduloId) fetchModulo();
    }, [id, moduloId]);

    const handleComplete = async (quizData?: { calificacion: number; aprobado: boolean }) => {
        try {
            await inscripcionesApi.completarModulo(
                id as string,
                moduloId as string,
                quizData?.calificacion,
                quizData?.aprobado
            );

            // Si es un quiz y no aprobó, no avanzamos
            if (quizData && !quizData.aprobado) return;

            // Obtener el curso para saber cuál es el siguiente módulo
            const curso = await cursosApi.obtenerCurso(id as string);
            const modulos = curso.modulos || [];
            const currentIndex = modulos.findIndex(m => m.id === moduloId);
            const nextModulo = modulos[currentIndex + 1];

            if (nextModulo) {
                // Auto-advance al siguiente módulo
                router.push(`/dashboard/cursos/${id}/modulos/${nextModulo.id}`);
            } else {
                // Si es el último, volver a la página del curso (o mostrar éxito)
                router.push(`/dashboard/cursos/${id}?completed=true`);
            }
        } catch (error) {
            console.error('Error completing modulo:', error);
            alert('Error al guardar progreso');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!modulo) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <h2 className="text-2xl font-bold">Módulo no encontrado</h2>
                <Button asChild>
                    <Link href={`/dashboard/cursos/${id}`}>Volver al curso</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Nav Bar */}
            <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                            <Link href={`/dashboard/cursos/${id}`}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Link>
                        </Button>
                        <div className="h-8 w-px bg-gray-200 hidden sm:block" />
                        <div>
                            <div className="text-xs font-bold text-slate-600 uppercase tracking-widest hidden sm:block">
                                Módulo {modulo.orden}
                            </div>
                            <h1 className="text-lg font-bold text-slate-900 truncate max-w-[200px] md:max-w-md">
                                {modulo.titulo}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/dashboard">
                                <Home className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <main className="max-w-5xl mx-auto px-4 pt-12">
                {modulo.tipo === 'TEORIA' && (
                    <TheoriaViewer
                        cursoId={id as string}
                        moduloId={moduloId as string}
                        titulo={modulo.titulo}
                        contenidoHtml={modulo.contenidoHtml}
                        videoUrl={modulo.videoUrl}
                        liveClassUrl={modulo.liveClassUrl}
                        onComplete={() => handleComplete()}
                    />
                )}

                {modulo.tipo === 'QUIZ' && (
                    <QuizViewer
                        preguntas={modulo.preguntas || []}
                        onComplete={handleComplete}
                    />
                )}

                {modulo.tipo === 'PRACTICA' && (
                    <PracticaViewer
                        tareas={modulo.tareasPracticas || []}
                        onComplete={() => handleComplete()}
                    />
                )}
            </main>
        </div>
    );
}
