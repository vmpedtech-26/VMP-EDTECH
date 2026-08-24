'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Gauge } from 'lucide-react';
import { usersApi, UserAdmin, InscripcionAlumno } from '@/lib/api/users';
import { toast } from 'sonner';

const ESTADO_LABELS: Record<string, string> = {
    NO_INICIADO: 'No iniciado',
    EN_CURSO: 'En curso',
    COMPLETADO: 'Completado',
};

export default function AlumnoDetallePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [alumno, setAlumno] = useState<UserAdmin | null>(null);
    const [inscripciones, setInscripciones] = useState<InscripcionAlumno[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            usersApi.obtenerUsuario(id),
            usersApi.listarInscripciones(id),
        ])
            .then(([alumnoData, inscripcionesData]) => {
                setAlumno(alumnoData);
                setInscripciones(inscripcionesData);
            })
            .catch((error) => {
                console.error('Error fetching alumno:', error);
                toast.error('No se pudo cargar el alumno. Verificá tu conexión.');
                setAlumno(null);
            })
            .finally(() => setIsLoading(false));
    }, [id]);

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
            </div>
        );
    }

    if (!alumno) {
        return (
            <div className="text-center py-12 text-gray-500">
                No se pudo cargar este alumno.
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-3xl">
            <div>
                <Link href="/dashboard/instructor/alumnos" className="text-sm text-primary hover:underline mb-2 inline-flex items-center gap-1">
                    <ArrowLeft className="h-4 w-4" /> Volver a Mis Alumnos
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">{alumno.nombre} {alumno.apellido}</h1>
                <p className="text-gray-600 mt-1">
                    DNI: {alumno.dni} {alumno.empresa_nombre ? `• ${alumno.empresa_nombre}` : ''}
                </p>
            </div>

            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Cursos
                </h2>

                {inscripciones.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 py-12 text-center text-gray-500">
                        Este alumno todavía no está inscripto en ningún curso.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {inscripciones.map((insc) => (
                            <div key={insc.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900">{insc.curso_nombre}</p>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                        <span>{ESTADO_LABELS[insc.estado] || insc.estado}</span>
                                        <span>•</span>
                                        <span>{insc.progreso}% completado</span>
                                    </div>
                                </div>
                                {insc.usa_telemetria_obd2 && (
                                    <Link
                                        href={`/dashboard/instructor/alumnos/${id}/obd2/${insc.id}`}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-semibold hover:bg-primary hover:text-white transition-colors shrink-0"
                                    >
                                        <Gauge className="h-4 w-4" />
                                        Telemetría OBD2
                                        {insc.obd2_sessions_count > 0 && (
                                            <span className="bg-white/80 text-primary rounded-full px-1.5 text-xs font-bold">
                                                {insc.obd2_sessions_count}
                                            </span>
                                        )}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
