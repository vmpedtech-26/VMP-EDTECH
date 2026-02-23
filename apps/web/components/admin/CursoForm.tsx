'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { Curso } from '@/types/training';
import { cursosApi } from '@/lib/api/cursos';
import Link from 'next/link';

interface CursoFormProps {
    initialData?: Partial<Curso>;
    onSubmit: (data: Partial<Curso>) => Promise<void>;
    isLoading?: boolean;
    title: string;
}

export function CursoForm({ initialData, onSubmit, isLoading, title }: CursoFormProps) {
    const [formData, setFormData] = useState<Partial<Curso>>(initialData || {
        nombre: '',
        descripcion: '',
        codigo: '',
        duracionHoras: 0,
        vigenciaMeses: 12,
        activo: true,
    });
    const [isCheckingCode, setIsCheckingCode] = useState(false);
    const [isCodeAvailable, setIsCodeAvailable] = useState<boolean | null>(null);

    // Generar código automáticamente basado en el nombre
    useEffect(() => {
        if (!initialData && formData.nombre) {
            const suggested = 'VMP-' + formData.nombre
                .toUpperCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
                .replace(/[^A-Z0-9]/g, '-') // Solo letras y números
                .split('-')
                .filter(Boolean)
                .map(word => word.substring(0, 3))
                .join('-');

            setFormData(prev => ({ ...prev, codigo: suggested }));
        }
    }, [formData.nombre, initialData]);

    // Validar código en tiempo real (debounce)
    useEffect(() => {
        if (!formData.codigo) {
            setIsCodeAvailable(null);
            return;
        }

        // No validar si es el código original del curso que estamos editando
        if (initialData?.codigo === formData.codigo) {
            setIsCodeAvailable(true);
            return;
        }

        const timer = setTimeout(async () => {
            setIsCheckingCode(true);
            try {
                const { disponible } = await cursosApi.verificarCodigo(formData.codigo!);
                setIsCodeAvailable(disponible);
            } catch (error) {
                console.error('Error verificando código:', error);
            } finally {
                setIsCheckingCode(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.codigo, initialData?.codigo]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isCodeAvailable === false) {
            alert('El código ya está en uso. Por favor, elige otro.');
            return;
        }

        const dataToSubmit = {
            ...formData,
            empresaId: formData.empresaId || null
        };

        await onSubmit(dataToSubmit);
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/super/cursos">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            </div>

            <Card className="p-8 border-none shadow-xl ring-1 ring-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                            Nombre del Curso
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            required
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            placeholder="Ej: Seguridad en Alturas"
                            value={formData.nombre}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 relative">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                                Código (ID Único)
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="codigo"
                                    required
                                    className={`w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 transition-all outline-none ${isCodeAvailable === true ? 'focus:ring-green-500/20 ring-1 ring-green-200' :
                                        isCodeAvailable === false ? 'focus:ring-red-500/20 ring-1 ring-red-200 text-red-600' :
                                            'focus:ring-primary/20'
                                        }`}
                                    placeholder="Ej: VMP-SEG-01"
                                    value={formData.codigo}
                                    onChange={handleChange}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    {isCheckingCode && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                                    {!isCheckingCode && isCodeAvailable === true && (
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">Disponible</span>
                                    )}
                                    {!isCheckingCode && isCodeAvailable === false && (
                                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">En uso</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                                Duración (Horas)
                            </label>
                            <input
                                type="number"
                                name="duracionHoras"
                                required
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                value={formData.duracionHoras}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                            Descripción
                        </label>
                        <textarea
                            name="descripcion"
                            required
                            rows={4}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                            placeholder="Describe de qué trata el curso..."
                            value={formData.descripcion}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                                Vigencia (Meses)
                            </label>
                            <input
                                type="number"
                                name="vigenciaMeses"
                                required
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                value={formData.vigenciaMeses}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="min-w-[200px] shadow-lg shadow-primary/20"
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar Curso
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
