'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen, Users, ArrowRight, Video, Calendar } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { cursosApi } from '@/lib/api/cursos';
import { Curso } from '@/types/training';
import Link from 'next/link';
import { toast } from 'sonner';

export default function InstructorCursosPage() {
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCursos = async () => {
            try {
                const data = await cursosApi.listarCursos();
                setCursos(data);
            } catch (error) {
                console.error('Error fetching instructor courses:', error);
                toast.error("Error al cargar tus cursos asignados");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCursos();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Mis Cursos</h1>
                <p className="text-slate-700 mt-2">Gestiona el progreso y la asistencia de tus grupos asignados.</p>
            </div>

            {cursos.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title="Sin cursos asignados"
                    description="Actualmente no tienes cursos activos asignados bajo tu supervisión."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cursos.map((curso) => (
                        <Card key={curso.id} className="group relative overflow-hidden h-full flex flex-col hover:border-primary/20 transition-all shadow-md">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <BookOpen className="h-24 w-24 text-primary" />
                            </div>

                            <div className="p-6 flex-1">
                                <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">
                                    {curso.codigo}
                                </span>
                                <h3 className="text-xl font-bold text-slate-900 line-clamp-2 mb-2">{curso.nombre}</h3>
                                <p className="text-slate-600 text-sm line-clamp-3 mb-6">
                                    {curso.descripcion}
                                </p>
                            </div>

                            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col gap-3">
                                <Button asChild variant="outline" className="w-full bg-white flex items-center justify-center gap-2">
                                    <Link href={`/dashboard/instructor/cursos/${curso.id}/asistencia`}>
                                        <Users className="h-4 w-4" />
                                        Control de Asistencia
                                    </Link>
                                </Button>
                                <Button asChild className="w-full">
                                    <Link href={`/dashboard/cursos/${curso.id}`} className="flex items-center justify-center gap-2">
                                        Ver Temario
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
