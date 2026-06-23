'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
    Search,
    BookOpen,
    Clock,
    Users,
    Video,
    Calendar,
    ArrowRight,
    MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api-client';
import { Curso } from '@/types/training';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

const MODALIDAD_CONFIG = {
    ONLINE: {
        label: 'Online',
        bg: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10 border-emerald-100',
        icon: Video
    },
    IN_COMPANY: {
        label: 'In Company',
        bg: 'bg-purple-50 text-purple-700 ring-purple-700/10 border-purple-100',
        icon: MapPin
    },
    HYBRID: {
        label: 'Híbrido',
        bg: 'bg-amber-50 text-amber-700 ring-amber-600/10 border-amber-100',
        icon: Calendar
    }
};

export default function InstructorCursosPage() {
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCursos();
    }, []);

    const fetchCursos = async () => {
        setIsLoading(true);
        try {
            // El API client ya prepende /api, y el backend filtra por instructorId
            const data = await api.get('/cursos');
            setCursos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching instructor cursos:', error);
            toast.error('No se pudieron cargar tus cursos asignados');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCursos = useMemo(() => {
        return cursos.filter(c =>
            c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.codigo.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [cursos, searchTerm]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-[250px]" />
                    <Skeleton className="h-4 w-[350px]" />
                </div>
                <Skeleton className="h-12 w-full rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="space-y-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <Skeleton className="h-12 w-12 rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[60px]" />
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="pt-4 border-t border-slate-50 flex gap-2">
                                <Skeleton className="h-9 flex-1" />
                                <Skeleton className="h-9 flex-1" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-slate-900">Mis Cursos Asignados</h1>
                <p className="text-slate-500 mt-1">Monitorea y gestiona tus programas de capacitación activos.</p>
            </div>

            <Card className="p-4 border-none shadow-sm ring-1 ring-slate-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o código de curso..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCursos.map((curso) => {
                    const modConfig = MODALIDAD_CONFIG[curso.modalidad || 'ONLINE'] || MODALIDAD_CONFIG.ONLINE;
                    const ModIcon = modConfig.icon;

                    return (
                        <Card key={curso.id} className="group hover:shadow-xl transition-all duration-300 border-none ring-1 ring-slate-100 overflow-hidden flex flex-col justify-between">
                            <div className="p-6 space-y-4 flex-1">
                                <div className="flex items-start justify-between">
                                    <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                                        <BookOpen className="h-6 w-6" />
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${modConfig.bg}`}>
                                        <ModIcon className="w-3.5 h-3.5" />
                                        {modConfig.label}
                                    </span>
                                </div>

                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                        {curso.codigo}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                                        {curso.nombre}
                                    </h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                                        {curso.descripcion}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 pt-2">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4 text-slate-400" />
                                        {curso.duracionHoras} horas
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Users className="h-4 w-4 text-slate-400" />
                                        {curso.alumnosEsperados || 0} alumnos esp.
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 pt-0 flex gap-2 border-t border-slate-50 mt-auto bg-slate-50/50">
                                <Button variant="outline" size="sm" className="flex-1 bg-white hover:bg-slate-50" asChild>
                                    <Link href={`/dashboard/cursos/${curso.id}`}>
                                        Temario
                                    </Link>
                                </Button>
                                <Button size="sm" className="flex-1" asChild>
                                    <Link href="/dashboard/instructor/sesiones">
                                        Gestionar
                                        <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </div>
                        </Card>
                    );
                })}

                {filteredCursos.length === 0 && (
                    <div className="col-span-full">
                        <EmptyState
                            icon={BookOpen}
                            title="No tenés cursos asignados"
                            description={searchTerm ? `No hay resultados para "${searchTerm}". Intenta con otros términos.` : "Aún no te asignaron cursos en la plataforma."}
                            action={
                                searchTerm ? (
                                    <Button variant="outline" onClick={() => setSearchTerm('')}>
                                        Limpiar búsqueda
                                    </Button>
                                ) : undefined
                            }
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
