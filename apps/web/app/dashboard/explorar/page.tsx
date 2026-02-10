'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { BookOpen, Clock, Loader2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cursosApi } from '@/lib/api/cursos';
import { inscripcionesApi } from '@/lib/api/inscripciones';
import { Curso } from '@/types/training';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';

export default function ExplorarCursosPage() {
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [enrollingId, setEnrollingId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchCursos = async () => {
            try {
                const data = await cursosApi.listarCursos();
                setCursos(data);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCursos();
    }, []);

    const handleEnroll = async (cursoId: string) => {
        setEnrollingId(cursoId);
        try {
            await inscripcionesApi.inscribirse(cursoId);
            router.push(`/dashboard/cursos/${cursoId}`);
        } catch (error) {
            console.error('Error enrolling in course:', error);
            alert('Hubo un error al inscribirse. Intente nuevamente.');
        } finally {
            setEnrollingId(null);
        }
    };

    const filteredCursos = cursos.filter(curso =>
        curso.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        curso.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        curso.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Explorar Capacitaciones</h1>
                    <p className="text-slate-800 mt-2">
                        Descubre nuevos cursos para potenciar tus habilidades y obtener certificaciones oficiales.
                    </p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                    <Input
                        placeholder="Buscar por nombre, código o descripción..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="flex items-center space-x-2">
                    <Filter className="h-4 w-4" />
                    <span>Filtros</span>
                </Button>
            </div>

            {/* Courses Grid */}
            {filteredCursos.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCursos.map((curso) => (
                        <Card key={curso.id} className="flex flex-col h-full">
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                                        {curso.codigo}
                                    </span>
                                    {curso.vigenciaMeses && (
                                        <span className="text-xs text-slate-700">
                                            Vigencia: {curso.vigenciaMeses} meses
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">
                                    {curso.nombre}
                                </h3>
                                <p className="text-slate-800 text-sm mb-6 line-clamp-3">
                                    {curso.descripcion}
                                </p>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between text-sm text-slate-700">
                                    <div className="flex items-center space-x-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{curso.duracionHoras} horas</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <BookOpen className="h-4 w-4" />
                                        <span>Autoasistido</span>
                                    </div>
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={() => handleEnroll(curso.id)}
                                    disabled={enrollingId === curso.id}
                                >
                                    {enrollingId === curso.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : null}
                                    {enrollingId === curso.id ? 'Inscribiendo...' : 'Inscribirse'}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-1">No se encontraron cursos</h3>
                    <p className="text-slate-700">Intenta con otros términos de búsqueda.</p>
                </div>
            )}
        </div>
    );
}
