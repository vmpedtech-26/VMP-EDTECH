'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loader2, Save, ArrowLeft, Building2, Users } from 'lucide-react';
import { Curso } from '@/types/training';
import { empresasApi, Empresa } from '@/lib/api/empresas';
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
        empresaId: '',
        alumnosEsperados: 0,
        activo: true,
    });

    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [isLoadingEmpresas, setIsLoadingEmpresas] = useState(false);

    useEffect(() => {
        const fetchEmpresas = async () => {
            setIsLoadingEmpresas(true);
            try {
                const data = await empresasApi.listarEmpresas();
                setEmpresas(data);
            } catch (error) {
                console.error('Error fetching empresas:', error);
            } finally {
                setIsLoadingEmpresas(false);
            }
        };
        fetchEmpresas();
    }, []);

    const generateCodeFromName = (name: string): string => {
        if (!name) return '';
        const cleanName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const words = cleanName.toUpperCase().split(/[\s\-]+/).filter(w => w.length > 0);
        
        if (words.length === 1) {
            return 'VMP-' + words[0].substring(0, 4);
        } else {
            const initials = words.map(w => w[0]).join('');
            return 'VMP-' + initials;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        let finalValue: string | number = value;
        if (type === 'number') {
            finalValue = parseInt(value) || 0;
        } else if (name === 'codigo') {
            finalValue = value.toUpperCase().replace(/\s+/g, '-').replace(/-+/g, '-');
        }

        setFormData(prev => {
            const newData = { ...prev, [name]: finalValue };
            
            // Auto-generar código al escribir el nombre (solo en creación)
            if (name === 'nombre' && !initialData?.id) {
                newData.codigo = generateCodeFromName(value);
            }
            
            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Limpiar empresaId si se seleccionó la opción vacía
        const submissionData = { ...formData };
        if (!submissionData.empresaId) delete submissionData.empresaId;
        
        await onSubmit(submissionData);
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-20">
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
                    {/* Nombre */}
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

                    {/* Empresa y Alumnos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-slate-400" />
                                Empresa (Opcional)
                            </label>
                            <select
                                name="empresaId"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none"
                                value={formData.empresaId || ''}
                                onChange={handleChange}
                                disabled={isLoadingEmpresas}
                            >
                                <option value="">Seleccionar Empresa (General)</option>
                                {empresas.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                <Users className="h-4 w-4 text-slate-400" />
                                Alumnos Esperados
                            </label>
                            <input
                                type="number"
                                name="alumnosEsperados"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                value={formData.alumnosEsperados}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Código y Duración */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                                Código (ID Único)
                            </label>
                            <input
                                type="text"
                                name="codigo"
                                required
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                placeholder="Ej: VMP-SEG-01"
                                value={formData.codigo}
                                onChange={handleChange}
                            />
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

                    {/* Descripción */}
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

                    {/* Vigencia */}
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
