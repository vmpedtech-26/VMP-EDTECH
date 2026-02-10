'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save, Video, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modulo } from '@/types/training';
import { cursosApi } from '@/lib/api/cursos';
import Link from 'next/link';

export default function ModuloConfigPage() {
    const { id: cursoId, moduloId } = useParams();
    const router = useRouter();
    const [modulo, setModulo] = useState<Modulo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchModulo = async () => {
            try {
                const data = await cursosApi.obtenerModulo(cursoId as string, moduloId as string);
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
            // TODO: Implement updateModulo in API
            // For now we'll just log
            console.log('Saving modulo content:', modulo);
            alert('Cambios guardados correctamente (Simulado)');
        } catch (error) {
            console.error('Error saving modulo:', error);
            alert('Error al guardar');
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/super/cursos/${cursoId}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{modulo.titulo}</h1>
                        <p className="text-sm text-slate-700">Configuración de contenido - {modulo.tipo}</p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
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
                    <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-2 text-primary font-bold">
                            <Video className="h-5 w-5" />
                            Contenido Audiovisual
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase">URL del Video (Youtube/Vimeo)</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="https://youtube.com/watch?v=..."
                                value={modulo.videoUrl || ''}
                                onChange={(e) => setModulo({ ...modulo, videoUrl: e.target.value })}
                            />
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-2 text-primary font-bold">
                            <FileText className="h-5 w-5" />
                            Material de Lectura
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase">Contenido HTML / Texto</label>
                            <textarea
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 min-h-[300px] font-mono text-sm"
                                placeholder="<p>Escribe aquí el contenido del módulo...</p>"
                                value={modulo.contenidoHtml || ''}
                                onChange={(e) => setModulo({ ...modulo, contenidoHtml: e.target.value })}
                            />
                        </div>
                    </Card>
                </div>
            )}

            {modulo.tipo === 'QUIZ' && (
                <Card className="p-8 text-center space-y-4">
                    <div className="h-16 w-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="h-8 w-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Editor de Cuestionarios</h3>
                        <p className="text-slate-700">Pronto podrás agregar y editar las preguntas de este examen.</p>
                    </div>
                </Card>
            )}

            {modulo.tipo === 'PRACTICA' && (
                <Card className="p-8 text-center space-y-4">
                    <div className="h-16 w-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="h-8 w-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Tareas Prácticas</h3>
                        <p className="text-slate-700">Define los requerimientos que el alumno debe subir como evidencia.</p>
                    </div>
                </Card>
            )}
        </div>
    );
}
