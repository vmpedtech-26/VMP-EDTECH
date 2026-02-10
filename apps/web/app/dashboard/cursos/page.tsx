'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookOpen, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { inscripcionesApi } from '@/lib/api/inscripciones';
import { MisCursosItem } from '@/types/training';

export default function CursosPage() {
    const [cursos, setCursos] = useState<MisCursosItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCursos = async () => {
            try {
                const response = await inscripcionesApi.misCursos();
                setCursos(response.cursos);
            } catch (error) {
                console.error('Error fetching enrolled courses:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCursos();
    }, []);

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'COMPLETADO':
            case 'APROBADO':
                return 'bg-success/10 text-success border-success/20';
            case 'EN_PROGRESO':
                return 'bg-warning/10 text-warning border-warning/20';
            case 'NO_INICIADO':
                return 'bg-slate-100 text-slate-800 border-slate-200';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const getEstadoText = (estado: string) => {
        switch (estado) {
            case 'COMPLETADO':
            case 'APROBADO':
                return 'Completado';
            case 'EN_PROGRESO':
                return 'En Progreso';
            case 'NO_INICIADO':
                return 'No Iniciado';
            default:
                return estado;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Mis Cursos</h1>
                <p className="text-slate-800 mt-2">
                    Cursos asignados y tu progreso en cada uno
                </p>
            </div>

            {cursos.length > 0 ? (
                <div className="grid lg:grid-cols-2 gap-6">
                    {cursos.map((i) => (
                        <Card key={i.id}>
                            <div className="space-y-4">
                                {/* Header del curso */}
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                                            {i.nombre}
                                        </h3>
                                        <p className="text-slate-800 text-sm line-clamp-2">{i.descripcion}</p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoColor(
                                            i.estado
                                        )}`}
                                    >
                                        {getEstadoText(i.estado)}
                                    </span>
                                </div>

                                {/* Info del curso */}
                                <div className="flex items-center space-x-4 text-sm text-slate-800">
                                    <div className="flex items-center space-x-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{i.duracionHoras} horas</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <span className="text-xs font-mono font-bold text-slate-600">
                                            {i.codigo}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-slate-800">Progreso</span>
                                        <span className="font-semibold text-slate-900">
                                            {i.progreso}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-500 ${(i.estado === 'COMPLETADO' || i.estado === 'APROBADO')
                                                ? 'bg-success'
                                                : 'bg-primary'
                                                }`}
                                            style={{ width: `${i.progreso}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex space-x-3">
                                    <Button
                                        size="sm"
                                        className="flex-1"
                                        asChild
                                        variant={(i.estado === 'COMPLETADO' || i.estado === 'APROBADO') ? 'outline' : 'primary'}
                                    >
                                        <Link href={`/dashboard/cursos/${i.id}`}>
                                            {(i.estado === 'COMPLETADO' || i.estado === 'APROBADO')
                                                ? 'Ver Detalles'
                                                : 'Continuar Capacitación'}
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-1">No tienes cursos en curso</h3>
                    <p className="text-slate-700 mb-6">Explora nuestro catálogo para comenzar tu capacitación.</p>
                    <Button asChild>
                        <Link href="/dashboard/explorar">Ver Catálogo de Cursos</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
