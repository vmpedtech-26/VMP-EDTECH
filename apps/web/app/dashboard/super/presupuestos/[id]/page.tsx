'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PresupuestoForm } from '../_components/PresupuestoForm';
import { presupuestosHseApi, PresupuestoHSE } from '@/lib/api/presupuestos-hse';
import { Loader2 } from 'lucide-react';

export default function EditarPresupuestoPage() {
    const params = useParams();
    const id = params.id as string;
    const [data, setData] = useState<PresupuestoHSE | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            presupuestosHseApi.obtener(id)
                .then(setData)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 text-[#0D9488] animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full">
            <PresupuestoForm initialData={data || {}} />
        </div>
    );
}
