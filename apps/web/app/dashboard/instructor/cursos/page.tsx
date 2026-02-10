'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function InstructorCursosPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Gestión de Cursos</h1>
                <p className="text-slate-800 mt-2">Monitorea los programas de capacitación activos.</p>
            </div>

            <EmptyState
                icon={BookOpen}
                title="Próximamente"
                description="La asignación de cursos por instructor estará disponible próximamente."
            />
        </div>
    );
}
