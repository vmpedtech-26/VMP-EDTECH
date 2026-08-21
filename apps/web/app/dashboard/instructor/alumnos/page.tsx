'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, ChevronRight } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { usersApi, UserAdmin } from '@/lib/api/users';

export default function InstructorAlumnosPage() {
    const [alumnos, setAlumnos] = useState<UserAdmin[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        usersApi.listarUsuarios({ rol: 'ALUMNO' })
            .then(setAlumnos)
            .catch(() => setAlumnos([]))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Mis Alumnos</h1>
                <p className="text-gray-600 mt-2">Gestiona el progreso de los alumnos de tu empresa.</p>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                </div>
            ) : alumnos.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="Sin alumnos todavía"
                    description="Todavía no hay alumnos registrados en tu empresa."
                />
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                    {alumnos.map((alumno) => (
                        <Link
                            key={alumno.id}
                            href={`/dashboard/instructor/alumnos/${alumno.id}`}
                            className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                            <div>
                                <p className="font-semibold text-gray-900">{alumno.nombre} {alumno.apellido}</p>
                                <p className="text-sm text-gray-500">DNI: {alumno.dni} {alumno.empresa_nombre ? `• ${alumno.empresa_nombre}` : ''}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
