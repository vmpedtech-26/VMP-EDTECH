'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import {
    Users,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { evidenciasApi } from '@/lib/api/evidencias';
import { Evidencia } from '@/types/training';
import { useAuth } from '@/lib/auth-context';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function InstructorTareasPage() {
    const { user } = useAuth();
    const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRevisiones = async () => {
            try {
                const data = await evidenciasApi.listarRevisiones();
                setEvidencias(data);
            } catch (error) {
                console.error('Error fetching revisions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRevisiones();
    }, []);

    const filteredEvidencias = evidencias.filter(e =>
        e.alumno?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.alumno?.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.tarea?.modulo.curso.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-[250px]" />
                        <Skeleton className="h-4 w-[350px]" />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Revisión de Tareas</h1>
                <p className="text-slate-800 mt-2">
                    Gestiona las evidencias prácticas enviadas por tus alumnos.
                </p>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                    <input
                        type="text"
                        placeholder="Buscar por alumno o curso..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtros
                </Button>
            </div>

            {filteredEvidencias.length === 0 ? (
                <EmptyState
                    icon={CheckCircle2}
                    title={searchTerm ? "No se encontraron resultados" : "¡Todo al día!"}
                    description={searchTerm
                        ? `No hay tareas pendientes que coincidan con "${searchTerm}".`
                        : "No tienes evidencias pendientes de revisión en este momento."
                    }
                    action={searchTerm ? (
                        <Button variant="outline" onClick={() => setSearchTerm('')}>
                            Limpiar búsqueda
                        </Button>
                    ) : null}
                />
            ) : (
                <div className="grid gap-4">
                    {filteredEvidencias.map((evidencia) => (
                        <Card key={evidencia.id} className="hover:border-primary/20 transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-1">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {evidencia.alumno?.nombre[0]}{evidencia.alumno?.apellido[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">
                                            {evidencia.alumno?.nombre} {evidencia.alumno?.apellido}
                                        </h3>
                                        <p className="text-sm text-slate-700 font-medium">
                                            {evidencia.tarea?.modulo.curso.nombre}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 md:px-8">
                                    <div className="flex items-center justify-between md:justify-start gap-8 text-sm text-slate-800">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-warning" />
                                            <span>Subido: {format(new Date(evidencia.uploadedAt), "d MMM, HH:mm", { locale: es })}</span>
                                        </div>
                                        <div className="hidden lg:flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-primary" />
                                            <span>Módulo: {evidencia.tarea?.modulo.titulo}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/dashboard/instructor/tareas/${evidencia.id}`}>
                                            Revisar Evidencia
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
