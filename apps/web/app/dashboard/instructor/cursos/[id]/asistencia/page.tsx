'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Users,
    Calendar,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    Loader2,
    Search,
    Download,
    Video
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cursosApi } from '@/lib/api/cursos';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function InstructorAsistenciaPage() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAsistencia = async () => {
            try {
                const res = await cursosApi.obtenerAsistencia(id as string);
                setData(res);
            } catch (error) {
                console.error('Error fetching attendance:', error);
                toast.error("Error al cargar los datos de asistencia");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchAsistencia();
    }, [id]);

    const filteredAlumnos = data?.alumnos.filter((a: any) =>
        `${a.nombre} ${a.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.dni.includes(searchTerm)
    );

    const checkAsistencia = (alumnoId: string, moduloId: string) => {
        return data?.asistencias.some((asist: any) =>
            asist.alumnoId === alumnoId && asist.moduloId === moduloId
        );
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
                </div>
            </div>
        );
    }

    if (!data || data.modulos.length === 0) {
        return (
            <div className="max-w-4xl mx-auto text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <Video className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-800">No hay clases en vivo agendadas</h2>
                <p className="text-slate-500 mt-2">Este curso no registra módulos con links de Google Meet o Teams.</p>
                <Button onClick={() => router.back()} variant="ghost" className="mt-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-2">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver al curso
                    </Button>
                    <h1 className="text-3xl font-bold text-slate-900">Control de Asistencia</h1>
                    <p className="text-slate-700 mt-2">Seguimiento de participación en clases virtuales iniciadas por los alumnos.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="hidden sm:flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Exportar CSV
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar alumno por nombre o DNI..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card className="overflow-hidden border-0 shadow-xl shadow-slate-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest min-w-[250px]">Alumno</th>
                                {data.modulos.map((m: any) => (
                                    <th key={m.id} className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-center min-w-[150px]">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="truncate max-w-[120px]" title={m.titulo}>{m.titulo}</span>
                                            {m.liveClassDate && (
                                                <span className="text-[10px] lowercase text-slate-400 font-normal">
                                                    {format(new Date(m.liveClassDate), "d MMM", { locale: es })}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredAlumnos.map((a: any) => (
                                <tr key={a.id} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                {a.nombre[0]}{a.apellido[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{a.nombre} {a.apellido}</p>
                                                <p className="text-xs text-slate-500">DNI: {a.dni}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {data.modulos.map((m: any) => {
                                        const asistio = checkAsistencia(a.id, m.id);
                                        return (
                                            <td key={m.id} className="p-6 text-center">
                                                {asistio ? (
                                                    <div className="flex items-center justify-center">
                                                        <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center border border-green-100 shadow-sm" title="Presente">
                                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center opacity-30">
                                                        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100" title="Ausente">
                                                            <XCircle className="h-5 w-5 text-slate-300" />
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4 text-blue-800">
                <Users className="h-6 w-6 shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-bold mb-1">Información de Participación</h3>
                    <p className="text-sm opacity-90 leading-relaxed">
                        El sistema registra automáticamente la asistencia cuando el alumno hace clic en el botón <strong>"Presente en Clase"</strong> dentro del módulo correspondiente.
                        Este reporte te permite verificar visualmente el compromiso de cada estudiante con las sesiones en vivo.
                    </p>
                </div>
            </div>
        </div>
    );
}
