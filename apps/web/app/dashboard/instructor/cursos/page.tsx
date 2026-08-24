'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
    BookOpen,
    Users,
    CheckCircle2,
    Award,
    Monitor,
    Building2,
    Globe,
} from 'lucide-react';
import { cursosApi, CursoAsignado } from '@/lib/api/cursos';
import { toast } from 'sonner';

const MODALIDAD_META: Record<CursoAsignado['modalidad'], { label: string; icon: React.ElementType }> = {
    ONLINE: { label: 'Online', icon: Globe },
    IN_COMPANY: { label: 'In-Company', icon: Building2 },
    HYBRID: { label: 'Híbrido', icon: Monitor },
};

export default function InstructorCursosPage() {
    const [cursos, setCursos] = useState<CursoAsignado[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCursos = async () => {
            try {
                const data = await cursosApi.listarCursosAsignados();
                setCursos(data);
            } catch (error) {
                console.error('Error fetching cursos asignados:', error);
                toast.error('No se pudieron cargar tus cursos asignados. Verificá tu conexión.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCursos();
    }, []);

    const totalInscripciones = cursos.reduce((acc, c) => acc + c.totalInscripciones, 0);
    const totalCredenciales = cursos.reduce((acc, c) => acc + c.credencialesEmitidas, 0);

    if (isLoading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-10 w-80" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-3xl" />)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map(i => <Skeleton key={i} className="h-48 rounded-3xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Gestión de Cursos</h1>
                <p className="text-slate-600 mt-1">Los programas de capacitación donde estás asignado como instructor.</p>
            </div>

            {cursos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <Card className="p-6" hover={false}>
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-primary/10">
                                <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Cursos Asignados</p>
                                <p className="text-3xl font-bold text-slate-900">{cursos.length}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6" hover={false}>
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-blue-100">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Inscripciones Totales</p>
                                <p className="text-3xl font-bold text-blue-600">{totalInscripciones}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6" hover={false}>
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-green-100">
                                <Award className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Credenciales Emitidas</p>
                                <p className="text-3xl font-bold text-green-600">{totalCredenciales}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {cursos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cursos.map((curso) => {
                        const modalidad = MODALIDAD_META[curso.modalidad];
                        const ModalidadIcon = modalidad.icon;
                        return (
                            <Card key={curso.id} className="p-6" hover={false}>
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono font-bold text-primary text-xs bg-primary/5 px-2 py-1 rounded-lg">
                                                {curso.codigo}
                                            </span>
                                            {!curso.activo && (
                                                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                                                    Inactivo
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900">{curso.nombre}</h3>
                                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{curso.descripcion}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl shrink-0">
                                        <ModalidadIcon className="h-3.5 w-3.5" />
                                        {modalidad.label}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                                    <div>
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Inscriptos</p>
                                        <p className="text-xl font-bold text-slate-900">{curso.totalInscripciones}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Completados</p>
                                        <p className="text-xl font-bold text-slate-900">{curso.completadas}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Completitud</p>
                                        <p className="text-xl font-bold text-primary">{curso.tasaCompletitud}%</p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-primary to-primary-light h-2 rounded-full transition-all"
                                            style={{ width: `${curso.tasaCompletitud}%` }}
                                        />
                                    </div>
                                </div>

                                {curso.credencialesEmitidas > 0 && (
                                    <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2 w-fit">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        {curso.credencialesEmitidas} credencial{curso.credencialesEmitidas !== 1 ? 'es' : ''} emitida{curso.credencialesEmitidas !== 1 ? 's' : ''}
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <EmptyState
                    icon={BookOpen}
                    title="Todavía no tenés cursos asignados"
                    description="Cuando un administrador te asigne como instructor de un curso, va a aparecer acá con el progreso de tus alumnos."
                />
            )}
        </div>
    );
}
