'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Loader2, Award } from 'lucide-react';
import { examenesApi } from '@/lib/api/examenes';
import { Credencial } from '@/types/training';
import { CardCredencial } from '@/components/dashboard/CardCredencial';

export default function CredencialesPage() {
    const [credenciales, setCredenciales] = useState<Credencial[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCredenciales = async () => {
            try {
                const data = await examenesApi.misCredenciales();
                setCredenciales(data);
            } catch (error) {
                console.error('Error fetching credenciales:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCredenciales();
    }, []);

    const vigentesCount = credenciales.filter(c => {
        if (!c.fechaVencimiento) return true;
        return new Date(c.fechaVencimiento) > new Date();
    }).length;

    const vencidasCount = credenciales.length - vigentesCount;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Mis Credenciales</h1>
                <p className="text-slate-800 mt-2">
                    Certificaciones profesionales con validez industrial obtenidas
                </p>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-6">
                <Card hover={false}>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-slate-900">
                            {credenciales.length}
                        </div>
                        <div className="text-sm text-slate-800 mt-1">Total Credenciales</div>
                    </div>
                </Card>
                <Card hover={false}>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-success">
                            {vigentesCount}
                        </div>
                        <div className="text-sm text-slate-800 mt-1">Vigentes</div>
                    </div>
                </Card>
                <Card hover={false}>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-slate-600">
                            {vencidasCount}
                        </div>
                        <div className="text-sm text-slate-800 mt-1">Vencidas</div>
                    </div>
                </Card>
            </div>

            {/* Credenciales Grid */}
            {credenciales.length > 0 ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {credenciales.map((credencial) => (
                        <CardCredencial key={credencial.id} credencial={credencial} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900">Sin credenciales aún</h3>
                    <p className="text-slate-700 mt-2 max-w-md mx-auto">
                        Completa tus cursos de capacitación para obtener tus certificaciones industriales oficiales.
                    </p>
                </div>
            )}
        </div>
    );
}
