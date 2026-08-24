'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Loader2, ArrowLeft, Save, Video, FileText, HelpCircle,
    Plus, Trash2, CheckCircle, AlertCircle, Calendar, Monitor, Link2,
    GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { cursosApi } from '@/lib/api/cursos';
import Link from 'next/link';
import { toast } from 'sonner';

interface PreguntaEdit {
    id?: string;
    pregunta: string;
    opciones: string[];
    respuestaCorrecta: number;
    explicacion: string;
}

interface TareaEdit {
    id?: string;
    descripcion: string;
    requiereFoto: boolean;
}

interface ModuloEdit {
    id: string;
    titulo: string;
    orden: number;
    tipo: 'TEORIA' | 'QUIZ' | 'PRACTICA';
    contenidoHtml?: string;
    videoUrl?: string;
    liveClassUrl?: string;
    liveClassDate?: string;
    liveClassPlatform?: 'google_meet' | 'teams' | 'zoom';
    preguntas?: PreguntaEdit[];
    tareasPracticas?: TareaEdit[];
    minimoAprobacion?: number;
}

function PreguntaEditor({
    pregunta,
    index,
    onChange,
    onDelete,
}: {
    pregunta: PreguntaEdit;
    index: number;
    onChange: (updated: PreguntaEdit) => void;
    onDelete: () => void;
}) {
    const updateOpcion = (i: number, val: string) => {
        const newOpciones = [...pregunta.opciones];
        newOpciones[i] = val;
        onChange({ ...pregunta, opciones: newOpciones });
    };

    const addOpcion = () => {
        if (pregunta.opciones.length >= 6) return;
        onChange({ ...pregunta, opciones: [...pregunta.opciones, ''] });
    };

    const removeOpcion = (i: number) => {
        if (pregunta.opciones.length <= 2) return;
        const newOpciones = pregunta.opciones.filter((_, idx) => idx !== i);
        const newCorrect = pregunta.respuestaCorrecta >= newOpciones.length
            ? newOpciones.length - 1
            : pregunta.respuestaCorrecta;
        onChange({ ...pregunta, opciones: newOpciones, respuestaCorrecta: newCorrect });
    };

    return (
        <Card className="p-5 space-y-4 border border-purple-100 bg-purple-50/30">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    Pregunta {index + 1}
                </div>
                <button
                    type="button"
                    onClick={onDelete}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    title="Eliminar pregunta"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            {/* Enunciado */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Enunciado *</label>
                <textarea
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-300 outline-none resize-none"
                    rows={2}
                    placeholder="¿Cuál es la distancia de seguridad mínima recomendada?"
                    value={pregunta.pregunta}
                    onChange={(e) => onChange({ ...pregunta, pregunta: e.target.value })}
                />
            </div>

            {/* Opciones */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase block">
                    Opciones — marca la respuesta correcta con el círculo
                </label>
                {pregunta.opciones.map((op, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <button
                            type="button"
                            title="Marcar como correcta"
                            onClick={() => onChange({ ...pregunta, respuestaCorrecta: i })}
                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-colors ${
                                pregunta.respuestaCorrecta === i
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-gray-300 hover:border-green-400'
                            } flex items-center justify-center`}
                        >
                            {pregunta.respuestaCorrecta === i && (
                                <CheckCircle className="h-4 w-4" />
                            )}
                        </button>
                        <input
                            type="text"
                            className={`flex-1 px-3 py-1.5 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-purple-300 ${
                                pregunta.respuestaCorrecta === i
                                    ? 'border-green-400 bg-green-50'
                                    : 'border-gray-200 bg-white'
                            }`}
                            placeholder={`Opción ${String.fromCharCode(65 + i)}`}
                            value={op}
                            onChange={(e) => updateOpcion(i, e.target.value)}
                        />
                        {pregunta.opciones.length > 2 && (
                            <button
                                type="button"
                                onClick={() => removeOpcion(i)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                ))}
                {pregunta.opciones.length < 6 && (
                    <button
                        type="button"
                        onClick={addOpcion}
                        className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1 mt-1"
                    >
                        <Plus className="h-3 w-3" /> Agregar opción
                    </button>
                )}
            </div>

            {/* Explicación */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                    Explicación (se muestra al alumno después de responder)
                </label>
                <input
                    type="text"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-300 outline-none"
                    placeholder="La distancia mínima es de 3 segundos..."
                    value={pregunta.explicacion}
                    onChange={(e) => onChange({ ...pregunta, explicacion: e.target.value })}
                />
            </div>
        </Card>
    );
}

function TareaEditor({
    tarea,
    index,
    onChange,
    onDelete,
}: {
    tarea: TareaEdit;
    index: number;
    onChange: (updated: TareaEdit) => void;
    onDelete: () => void;
}) {
    return (
        <Card className="p-5 space-y-3 border border-orange-100 bg-orange-50/30">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-orange-600 font-bold text-sm">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    Tarea {index + 1}
                </div>
                <button
                    type="button"
                    onClick={onDelete}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    title="Eliminar tarea"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Consigna *</label>
                <textarea
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 outline-none resize-none"
                    rows={2}
                    placeholder="Ej: Fotografiá el extintor de tu puesto de trabajo verificando que la carga esté vigente"
                    value={tarea.descripcion}
                    onChange={(e) => onChange({ ...tarea, descripcion: e.target.value })}
                />
            </div>
        </Card>
    );
}

export default function ModuloConfigPage() {
    const { id: cursoId, moduloId } = useParams();
    const router = useRouter();
    const [modulo, setModulo] = useState<ModuloEdit | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        const fetchModulo = async () => {
            try {
                const data = await cursosApi.obtenerModuloAdmin(cursoId as string, moduloId as string);
                // Normalize preguntas
                const preguntas = (data.preguntas || []).map((p: any) => ({
                    id: p.id,
                    pregunta: p.pregunta,
                    opciones: Array.isArray(p.opciones) ? p.opciones : [],
                    respuestaCorrecta: p.respuestaCorrecta ?? 0,
                    explicacion: p.explicacion || '',
                }));
                const tareasPracticas = (data.tareasPracticas || []).map((t: any) => ({
                    id: t.id,
                    descripcion: t.descripcion,
                    requiereFoto: t.requiereFoto ?? true,
                }));
                setModulo({ ...data, preguntas, tareasPracticas });
            } catch (error) {
                console.error('Error fetching modulo:', error);
                toast.error('No se pudo cargar el módulo. Verificá tu conexión.');
            } finally {
                setIsLoading(false);
            }
        };

        if (cursoId && moduloId) fetchModulo();
    }, [cursoId, moduloId]);

    const handleSave = async () => {
        if (!modulo) return;

        // Guardar tareas prácticas reemplaza por completo la lista anterior en el
        // backend, y eso borra en cascada las evidencias ya subidas por alumnos.
        // Si ya había tareas guardadas (con id, es decir persistidas), confirmar.
        if (modulo.tipo === 'PRACTICA' && (modulo.tareasPracticas || []).some(t => t.id)) {
            const confirmado = confirm(
                'Si ya hay alumnos con evidencias subidas para las tareas actuales, guardar estos cambios las va a eliminar. ¿Continuar?'
            );
            if (!confirmado) return;
        }

        setIsSaving(true);
        setSaveStatus('idle');
        try {
            const payload: any = {
                titulo: modulo.titulo,
                contenidoHtml: modulo.contenidoHtml,
                videoUrl: modulo.videoUrl,
                liveClassUrl: modulo.liveClassUrl,
                liveClassDate: modulo.liveClassDate || undefined,
            };

            // Include preguntas for QUIZ modules
            if (modulo.tipo === 'QUIZ') {
                payload.preguntas = (modulo.preguntas || []).map(p => ({
                    pregunta: p.pregunta,
                    opciones: p.opciones,
                    respuestaCorrecta: p.respuestaCorrecta,
                    explicacion: p.explicacion || undefined,
                }));
            }

            // Include tareas for PRACTICA modules
            if (modulo.tipo === 'PRACTICA') {
                payload.tareasPracticas = (modulo.tareasPracticas || []).map(t => ({
                    descripcion: t.descripcion,
                    requiereFoto: true,
                }));
            }

            await cursosApi.actualizarModulo(cursoId as string, moduloId as string, payload);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            console.error('Error saving modulo:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 4000);
        } finally {
            setIsSaving(false);
        }
    };

    const addPregunta = () => {
        setModulo(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                preguntas: [
                    ...(prev.preguntas || []),
                    {
                        pregunta: '',
                        opciones: ['', '', '', ''],
                        respuestaCorrecta: 0,
                        explicacion: '',
                    }
                ]
            };
        });
    };

    const updatePregunta = (index: number, updated: PreguntaEdit) => {
        setModulo(prev => {
            if (!prev || !prev.preguntas) return prev;
            const newPreguntas = [...prev.preguntas];
            newPreguntas[index] = updated;
            return { ...prev, preguntas: newPreguntas };
        });
    };

    const deletePregunta = (index: number) => {
        setModulo(prev => {
            if (!prev || !prev.preguntas) return prev;
            return {
                ...prev,
                preguntas: prev.preguntas.filter((_, i) => i !== index)
            };
        });
    };

    const addTarea = () => {
        setModulo(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                tareasPracticas: [
                    ...(prev.tareasPracticas || []),
                    { descripcion: '', requiereFoto: true }
                ]
            };
        });
    };

    const updateTarea = (index: number, updated: TareaEdit) => {
        setModulo(prev => {
            if (!prev || !prev.tareasPracticas) return prev;
            const newTareas = [...prev.tareasPracticas];
            newTareas[index] = updated;
            return { ...prev, tareasPracticas: newTareas };
        });
    };

    const deleteTarea = (index: number) => {
        setModulo(prev => {
            if (!prev || !prev.tareasPracticas) return prev;
            return {
                ...prev,
                tareasPracticas: prev.tareasPracticas.filter((_, i) => i !== index)
            };
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!modulo) return (
        <div className="text-center py-12 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-400" />
            <p>Módulo no encontrado</p>
        </div>
    );

    const TIPO_ICONS = {
        TEORIA: <FileText className="h-5 w-5" />,
        QUIZ: <HelpCircle className="h-5 w-5" />,
        PRACTICA: <CheckCircle className="h-5 w-5" />,
    };

    const TIPO_COLORS = {
        TEORIA: 'text-blue-600 bg-blue-50',
        QUIZ: 'text-purple-600 bg-purple-50',
        PRACTICA: 'text-orange-600 bg-orange-50',
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/super/cursos/${cursoId}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{modulo.titulo}</h1>
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold mt-1 ${TIPO_COLORS[modulo.tipo]}`}>
                            {TIPO_ICONS[modulo.tipo]}
                            {modulo.tipo}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {saveStatus === 'success' && (
                        <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                            <CheckCircle className="h-4 w-4" /> Guardado
                        </span>
                    )}
                    {saveStatus === 'error' && (
                        <span className="flex items-center gap-1.5 text-red-600 text-sm font-medium">
                            <AlertCircle className="h-4 w-4" /> Error al guardar
                        </span>
                    )}
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Guardar Cambios
                    </Button>
                </div>
            </div>

            {/* Configuración de Clase en Vivo (disponible para todos los tipos) */}
            <Card className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold">
                    <Monitor className="h-5 w-5" />
                    Clase en Vivo (opcional)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Plataforma</label>
                        <select
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                            value={modulo.liveClassPlatform || ''}
                            onChange={(e) => setModulo({ ...modulo, liveClassPlatform: e.target.value as any || undefined })}
                        >
                            <option value="">Sin clase en vivo</option>
                            <option value="google_meet">Google Meet</option>
                            <option value="teams">Microsoft Teams</option>
                            <option value="zoom">Zoom</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Fecha y Hora
                        </label>
                        <input
                            type="datetime-local"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                            value={modulo.liveClassDate ? modulo.liveClassDate.slice(0, 16) : ''}
                            onChange={(e) => setModulo({ ...modulo, liveClassDate: e.target.value })}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                        <Link2 className="h-3 w-3" /> URL de la reunión
                    </label>
                    <input
                        type="url"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                        placeholder="https://meet.google.com/xxx-yyyy-zzz"
                        value={modulo.liveClassUrl || ''}
                        onChange={(e) => setModulo({ ...modulo, liveClassUrl: e.target.value })}
                    />
                </div>
            </Card>

            {/* Módulo TEORIA */}
            {modulo.tipo === 'TEORIA' && (
                <div className="grid grid-cols-1 gap-6">
                    <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-2 text-blue-600 font-bold">
                            <Video className="h-5 w-5" />
                            Video del Módulo
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">URL del Video (YouTube / Vimeo)</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                placeholder="https://youtube.com/watch?v=..."
                                value={modulo.videoUrl || ''}
                                onChange={(e) => setModulo({ ...modulo, videoUrl: e.target.value })}
                            />
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-2 text-blue-600 font-bold">
                            <FileText className="h-5 w-5" />
                            Material de Lectura (Editor Enriquecido)
                        </div>
                        <div className="space-y-2">
                            <RichTextEditor
                                value={modulo.contenidoHtml || ''}
                                onChange={(content) => setModulo({ ...modulo, contenidoHtml: content })}
                            />
                        </div>
                    </Card>
                </div>
            )}

            {/* Módulo QUIZ — Editor completo y funcional */}
            {modulo.tipo === 'QUIZ' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <HelpCircle className="h-5 w-5 text-purple-600" />
                                Editor de Cuestionario
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {modulo.preguntas?.length || 0} pregunta(s) · Aprobación: {modulo.minimoAprobacion ?? 70}%
                            </p>
                        </div>
                        <Button
                            onClick={addPregunta}
                            variant="outline"
                            className="border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva Pregunta
                        </Button>
                    </div>

                    {(!modulo.preguntas || modulo.preguntas.length === 0) && (
                        <Card className="p-10 text-center border-dashed border-2 border-purple-200 bg-purple-50/30">
                            <HelpCircle className="h-12 w-12 text-purple-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No hay preguntas todavía</p>
                            <p className="text-sm text-gray-400 mb-4">Haz clic en "Nueva Pregunta" para agregar la primera</p>
                            <Button
                                onClick={addPregunta}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar Primera Pregunta
                            </Button>
                        </Card>
                    )}

                    {(modulo.preguntas || []).map((pregunta, i) => (
                        <PreguntaEditor
                            key={i}
                            index={i}
                            pregunta={pregunta}
                            onChange={(updated) => updatePregunta(i, updated)}
                            onDelete={() => deletePregunta(i)}
                        />
                    ))}

                    {(modulo.preguntas || []).length > 0 && (
                        <Button
                            onClick={addPregunta}
                            variant="outline"
                            className="w-full border-dashed border-purple-300 text-purple-600 hover:bg-purple-50"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar otra pregunta
                        </Button>
                    )}
                </div>
            )}

            {/* Módulo PRACTICA */}
            {modulo.tipo === 'PRACTICA' && (
                <div className="space-y-6">
                    <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-2 text-orange-600 font-bold">
                            <CheckCircle className="h-5 w-5" />
                            Introducción del Módulo (opcional)
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Contexto general para el alumno</label>
                            <textarea
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] text-sm"
                                placeholder="Ej: En este módulo vas a relevar los elementos de protección de tu puesto de trabajo..."
                                value={modulo.contenidoHtml || ''}
                                onChange={(e) => setModulo({ ...modulo, contenidoHtml: e.target.value })}
                            />
                        </div>
                    </Card>

                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-orange-600" />
                                Tareas Prácticas
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {modulo.tareasPracticas?.length || 0} tarea(s) · cada una pide una foto de evidencia
                            </p>
                        </div>
                        <Button
                            onClick={addTarea}
                            variant="outline"
                            className="border-orange-200 text-orange-700 hover:bg-orange-50"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva Tarea
                        </Button>
                    </div>

                    {(!modulo.tareasPracticas || modulo.tareasPracticas.length === 0) && (
                        <Card className="p-10 text-center border-dashed border-2 border-orange-200 bg-orange-50/30">
                            <CheckCircle className="h-12 w-12 text-orange-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No hay tareas todavía</p>
                            <p className="text-sm text-gray-400 mb-4">Sin tareas, el alumno no tiene nada que evidenciar y el módulo nunca se puede completar</p>
                            <Button
                                onClick={addTarea}
                                className="bg-orange-600 hover:bg-orange-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar Primera Tarea
                            </Button>
                        </Card>
                    )}

                    {(modulo.tareasPracticas || []).map((tarea, i) => (
                        <TareaEditor
                            key={i}
                            index={i}
                            tarea={tarea}
                            onChange={(updated) => updateTarea(i, updated)}
                            onDelete={() => deleteTarea(i)}
                        />
                    ))}

                    {(modulo.tareasPracticas || []).length > 0 && (
                        <Button
                            onClick={addTarea}
                            variant="outline"
                            className="w-full border-dashed border-orange-300 text-orange-600 hover:bg-orange-50"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar otra tarea
                        </Button>
                    )}

                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 text-sm text-orange-700">
                        💡 Por cada tarea, el alumno deberá subir una foto como evidencia. El instructor la revisará y
                        la aprobará o rechazará; el módulo se completa recién cuando todas las evidencias están aprobadas.
                    </div>
                </div>
            )}

            {/* Botón guardar inferior */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button onClick={handleSave} disabled={isSaving} size="lg">
                    {isSaving ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Guardando...</>
                    ) : (
                        <><Save className="h-4 w-4 mr-2" /> Guardar Cambios</>
                    )}
                </Button>
            </div>
        </div>
    );
}
