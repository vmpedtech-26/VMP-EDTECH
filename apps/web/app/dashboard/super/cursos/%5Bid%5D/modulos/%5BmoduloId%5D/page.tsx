'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save, Video, FileText, CheckCircle, Link as LinkIcon, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modulo } from '@/types/training';
import { cursosApi } from '@/lib/api/cursos';
import Link from 'next/link';

import { QuizEditor } from '@/components/admin/QuizEditor';
import { PracticaEditor } from '@/components/admin/PracticaEditor';

export default function ModuloConfigPage() {
    const { id: cursoId, moduloId } = useParams();
    const router = useRouter();
    const [modulo, setModulo] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchModulo = async () => {
            try {
                // Usamos la versión de ADMIN para ver respuestas y tareas
                const data = await cursosApi.obtenerModuloAdmin(cursoId as string, moduloId as string);
                setModulo(data);
            } catch (error) {
                console.error('Error fetching modulo:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (cursoId && moduloId) fetchModulo();
    }, [cursoId, moduloId]);

    const handleSave = async () => {
        if (!modulo) return;
        setIsSaving(true);
        try {
            await cursosApi.actualizarModulo(cursoId as string, moduloId as string, {
                titulo: modulo.titulo,
                orden: modulo.orden,
                videoUrl: modulo.videoUrl,
                contenidoHtml: modulo.contenidoHtml,
                liveClassUrl: modulo.liveClassUrl,
                liveClassPlatform: modulo.liveClassPlatform,
                liveClassDate: modulo.liveClassDate,
                preguntas: modulo.preguntas,
                tareasPracticas: modulo.tareasPracticas
            });
            alert('Cambios guardados correctamente');
        } catch (error: any) {
            console.error('Error saving modulo:', error);
            alert(error.message || 'Error al guardar los cambios');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!modulo) return <div>Módulo no encontrado</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/super/cursos/${cursoId}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{modulo.titulo}</h1>
                        <p className="text-sm text-slate-700">Configuración de contenido • {modulo.tipo}</p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="px-8 shadow-lg shadow-primary/20">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Guardar Cambios
                        </>
                    )}
                </Button>
            </div>

            {modulo.tipo === 'TEORIA' && (
                <div className="grid grid-cols-1 gap-6">
                    <Card className="p-6 space-y-4 border-none shadow-sm ring-1 ring-gray-100">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                            <LinkIcon className="h-5 w-5" />
                            Clase en Vivo (Meet/Teams)
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">URL de la reunión</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="https://meet.google.com/..."
                                    value={modulo.liveClassUrl || ''}
                                    onChange={(e) => setModulo({ ...modulo, liveClassUrl: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Plataforma</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                    value={modulo.liveClassPlatform || ''}
                                    onChange={(e) => setModulo({ ...modulo, liveClassPlatform: e.target.value })}
                                >
                                    <option value="">Seleccionar plataforma...</option>
                                    <option value="google_meet">Google Meet</option>
                                    <option value="teams">Microsoft Teams</option>
                                </select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Fecha y Hora (Opcional)</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="datetime-local"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                        value={modulo.liveClassDate ? modulo.liveClassDate.substring(0, 16) : ''}
                                        onChange={(e) => setModulo({ ...modulo, liveClassDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4 border-none shadow-sm ring-1 ring-gray-100">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                            <Video className="h-5 w-5" />
                            Contenido Audiovisual
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">URL del Video (Youtube/Vimeo)</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="https://youtube.com/watch?v=..."
                                value={modulo.videoUrl || ''}
                                onChange={(e) => setModulo({ ...modulo, videoUrl: e.target.value })}
                            />
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4 border-none shadow-sm ring-1 ring-gray-100">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                            <FileText className="h-5 w-5" />
                            Material de Lectura
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Contenido HTML / Texto</label>
                            <textarea
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 min-h-[400px] font-mono text-sm leading-relaxed"
                                placeholder="<p>Escribe aquí el contenido del módulo...</p>"
                                value={modulo.contenidoHtml || ''}
                                onChange={(e) => setModulo({ ...modulo, contenidoHtml: e.target.value })}
                            />
                        </div>
                    </Card>
                </div>
            )}

            {modulo.tipo === 'QUIZ' && (
                <QuizEditor
                    preguntas={modulo.preguntas || []}
                    onChange={(preguntas) => setModulo({ ...modulo, preguntas })}
                />
            )}

            {modulo.tipo === 'PRACTICA' && (
                <PracticaEditor
                    tareas={modulo.tareasPracticas || []}
                    onChange={(tareasPracticas) => setModulo({ ...modulo, tareasPracticas })}
                />
            )}
        </div>
    );
}
