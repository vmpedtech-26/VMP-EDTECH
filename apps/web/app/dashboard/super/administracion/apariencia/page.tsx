'use client';

import React, { useEffect, useState } from 'react';
import { Palette, Save } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { administracionApi, Appearance } from '@/lib/api/administracion';
import { toast } from 'sonner';

const DEFAULTS: Appearance = {
    nombre: 'VMP - EDTECH',
    brandTag: 'VMP',
    tagline: 'Capacitaciones Profesionales',
    tema: 'light',
    colorPrimario: '#3AAFA9',
};

export default function AparienciaPage() {
    const [data, setData] = useState<Appearance>(DEFAULTS);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        administracionApi.obtenerApariencia()
            .then((res) => setData({ ...DEFAULTS, ...res }))
            .catch((error) => {
                console.error('Error fetching appearance:', error);
                toast.error('No se pudo cargar la configuración de apariencia.');
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await administracionApi.actualizarApariencia(data);
            toast.success('Apariencia actualizada correctamente');
        } catch (error) {
            toast.error('No se pudo guardar. Intentá nuevamente.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Palette className="h-6 w-6 text-primary" />
                    Apariencia
                </h1>
                <p className="text-slate-500 text-sm mt-1">Branding y configuración visual de la plataforma</p>
            </div>

            <Card className="p-6 border-none shadow-sm ring-1 ring-slate-100 max-w-xl space-y-5">
                {isLoading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                ) : (
                    <>
                        {[
                            { key: 'nombre', label: 'Nombre de la organización' },
                            { key: 'brandTag', label: 'Tag / Sigla' },
                            { key: 'tagline', label: 'Eslogan' },
                        ].map(({ key, label }) => (
                            <div key={key}>
                                <label className="block text-sm font-bold text-slate-700 mb-1">{label}</label>
                                <input
                                    type="text"
                                    value={(data as any)[key] || ''}
                                    onChange={(e) => setData({ ...data, [key]: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        ))}

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Tema</label>
                            <select
                                value={data.tema}
                                onChange={(e) => setData({ ...data, tema: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="light">Claro</option>
                                <option value="dark">Oscuro</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Color primario</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={data.colorPrimario}
                                    onChange={(e) => setData({ ...data, colorPrimario: e.target.value })}
                                    className="h-10 w-14 rounded-lg border border-slate-200 cursor-pointer p-1"
                                />
                                <input
                                    type="text"
                                    value={data.colorPrimario}
                                    onChange={(e) => setData({ ...data, colorPrimario: e.target.value })}
                                    className="w-32 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        <Button onClick={handleSave} disabled={isSaving}>
                            <Save className="h-4 w-4 mr-2" />
                            {isSaving ? 'Guardando...' : 'Guardar cambios'}
                        </Button>
                    </>
                )}
            </Card>
        </div>
    );
}
