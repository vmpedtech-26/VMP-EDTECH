'use client';

import React, { useState } from 'react';
import {
    Plus,
    Trash2,
    GripVertical,
    Loader2,
    X,
    Save,
    Settings
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ModuloSummary } from '@/types/training';
import { cursosApi } from '@/lib/api/cursos';
import Link from 'next/link';

interface GestorModulosProps {
    cursoId: string;
    modulos: ModuloSummary[];
    onUpdate: () => void;
}

export function GestorModulos({ cursoId, modulos, onUpdate }: GestorModulosProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newModulo, setNewModulo] = useState({
        titulo: '',
        tipo: 'TEORIA',
        orden: modulos.length + 1,
        contenidoHtml: '',
        videoUrl: ''
    });

    const handleAdd = async () => {
        if (!newModulo.titulo) return;
        setIsLoading(true);
        try {
            await cursosApi.crearModulo(cursoId, newModulo);
            setIsAdding(false);
            setNewModulo({
                titulo: '',
                tipo: 'TEORIA',
                orden: modulos.length + 2,
                contenidoHtml: '',
                videoUrl: ''
            });
            onUpdate();
        } catch (error) {
            console.error('Error adding modulo:', error);
            alert('Error al agregar módulo');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (moduloId: string) => {
        if (!confirm('¿Seguro que deseas eliminar este módulo?')) return;
        try {
            await cursosApi.eliminarModulo(cursoId, moduloId);
            onUpdate();
        } catch (error) {
            console.error('Error deleting modulo:', error);
            alert('Error al eliminar módulo');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Estructura del Curso</h2>
                    <p className="text-sm text-slate-700">Administra los módulos y su contenido</p>
                </div>
                {!isAdding && (
                    <Button size="sm" onClick={() => setIsAdding(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Módulo
                    </Button>
                )}
            </div>

            {isAdding && (
                <Card className="p-6 border-2 border-primary/20 bg-primary/5 shadow-xl animate-in slide-in-from-top duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-primary flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Nuevo Módulo
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                Título del Módulo
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 bg-white border-none rounded-lg ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Ej: Introducción a la Seguridad"
                                value={newModulo.titulo}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewModulo({ ...newModulo, titulo: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                Tipo de Contenido
                            </label>
                            <select
                                className="w-full px-4 py-2 bg-white border-none rounded-lg ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-primary/20"
                                value={newModulo.tipo}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewModulo({ ...newModulo, tipo: e.target.value })}
                            >
                                <option value="TEORIA">Teoría (Lectura/Video)</option>
                                <option value="QUIZ">Evaluación (Quiz)</option>
                                <option value="PRACTICA">Práctica (Evidencias)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>
                            Cancelar
                        </Button>
                        <Button size="sm" onClick={handleAdd} disabled={isLoading || !newModulo.titulo}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Crear Módulo
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            )}

            <div className="space-y-3">
                {modulos.map((modulo, idx) => (
                    <Card key={modulo.id} className="p-4 border-none shadow-sm ring-1 ring-gray-100 group hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="text-gray-300 group-hover:text-slate-600 cursor-grab">
                                <GripVertical className="h-5 w-5" />
                            </div>
                            <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 text-xs font-bold">
                                {idx + 1}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h4 className="font-bold text-slate-900">{modulo.titulo}</h4>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${modulo.tipo === 'TEORIA' ? 'bg-blue-50 text-blue-600' :
                                            modulo.tipo === 'QUIZ' ? 'bg-purple-50 text-purple-600' :
                                                'bg-orange-50 text-orange-600'
                                        }`}>
                                        {modulo.tipo}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/dashboard/super/cursos/${cursoId}/modulos/${modulo.id}`}>
                                        <Settings className="h-4 w-4 mr-1" />
                                        Contenido
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-300 hover:text-red-500"
                                    onClick={() => handleDelete(modulo.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}

                {modulos.length === 0 && !isAdding && (
                    <div className="py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100 text-center">
                        <p className="text-slate-600 font-medium">Este curso aún no tiene módulos</p>
                        <Button variant="outline" size="sm" className="mt-2 text-primary" onClick={() => setIsAdding(true)}>
                            Agregar mi primer contenido
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
