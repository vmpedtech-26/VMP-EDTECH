'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function InstructorAlumnosPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Mis Alumnos</h1>
                <p className="text-slate-800 mt-2">Gestiona el progreso de los alumnos de tu empresa.</p>
            </div>

            <EmptyState
                icon={Users}
                title="Próximamente"
                description="La gestión detallada de alumnos estará disponible en la próxima actualización."
            />
        </div>
    );
}
