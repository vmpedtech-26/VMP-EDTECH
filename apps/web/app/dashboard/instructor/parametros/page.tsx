'use client';

import React from 'react';
import { Sliders } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ParametrosPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Parámetros</h1>
                <p className="text-gray-600 mt-2">Configura los parámetros de las capacitaciones.</p>
            </div>

            <EmptyState
                icon={Sliders}
                title="Próximamente"
                description="La configuración de parámetros estará disponible en la próxima actualización."
            />
        </div>
    );
}
