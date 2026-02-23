'use client';

import { useState, useEffect } from 'react';
import { Modulo, TareaPractica } from '@/types/training';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { evidenciasApi } from '@/lib/api/evidencias';
import { inscripcionesApi } from '@/lib/api/inscripciones';
import { CheckCircle, Upload, Image as ImageIcon } from 'lucide-react';

interface ModuloPracticaProps {
    modulo: Modulo;
    cursoId: string;
    onCompletar: () => void;
}

interface TareaWithEvidence extends TareaPractica {
    uploaded: boolean;
    evidenciaUrl?: string;
    comentario?: string;
}

export function ModuloPractica({ modulo, cursoId, onCompletar }: ModuloPracticaProps) {
    const [tareas, setTareas] = useState<TareaWithEvidence[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadingTareaId, setUploadingTareaId] = useState<string | null>(null);

    useEffect(() => {
        loadEvidencias();
    }, []);

    const loadEvidencias = async () => {
        const tareasConEvidencia: TareaWithEvidence[] = await Promise.all(
            (modulo.tareasPracticas || []).map(async (tarea) => {
                if (tarea.requiereFoto) {
                    try {
                        const evidencias = await evidenciasApi.obtenerEvidencias(tarea.id);
                        if (evidencias.length > 0) {
                            return {
                                ...tarea,
                                uploaded: true,
                                evidenciaUrl: evidencias[0].fotoUrl,
                                comentario: evidencias[0].comentario,
                            };
                        }
                    } catch (error) {
                        console.error('Error cargando evidencias:', error);
                    }
                }

                return {
                    ...tarea,
                    uploaded: !tarea.requiereFoto, // Si no requiere foto, automáticamente "completada"
                };
            })
        );

        setTareas(tareasConEvidencia);
    };

    const handleFileUpload = async (tareaId: string, file: File, comentario?: string) => {
        setUploadingTareaId(tareaId);
        try {
            const result = await evidenciasApi.uploadEvidencia(file, tareaId, comentario);

            // Actualizar estado local
            setTareas(tareas.map(t =>
                t.id === tareaId
                    ? { ...t, uploaded: true, evidenciaUrl: result.evidencia.fotoUrl, comentario: result.evidencia.comentario }
                    : t
            ));

            alert('Evidencia subida exitosamente');
        } catch (error: any) {
            console.error('Error subiendo evidencia:', error);
            alert(error.message || 'Error al subir la evidencia');
        } finally {
            setUploadingTareaId(null);
        }
    };

    const handleCompletar = async () => {
        const todasCompletadas = tareas.every(t => t.uploaded);

        if (!todasCompletadas) {
            alert('Debes completar todas las tareas requeridas');
            return;
        }

        setLoading(true);
        try {
            await inscripcionesApi.completarModulo(cursoId, modulo.id);
            onCompletar();
        } catch (error: any) {
            console.error('Error al completar módulo:', error);
            alert(error.message || 'Error al completar el módulo');
        } finally {
            setLoading(false);
        }
    };

    const todasCompletadas = tareas.length > 0 && tareas.every(t => t.uploaded);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-900">{modulo.titulo}</h2>
                <div className="flex items-center space-x-2 mt-2 text-sm text-slate-800">
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold">
                        Módulo Práctico
                    </span>
                    <span>
                        {tareas.filter(t => t.uploaded).length} de {tareas.length} completadas
                    </span>
                </div>
            </div>

            {/* Lista de tareas */}
            <div className="space-y-4">
                {tareas.map((tarea, idx) => (
                    <Card key={tarea.id} className={`border-l-4 ${tarea.uploaded ? 'border-l-green-500 bg-green-50' : 'border-l-gray-300'}`}>
                        <div className="space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        {tarea.uploaded ? (
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                        )}
                                        <p className="font-semibold text-slate-900">
                                            Tarea {idx + 1}: {tarea.descripcion}
                                        </p>
                                    </div>

                                    {tarea.requiereFoto && (
                                        <p className="text-sm text-slate-800 mt-1 ml-7">
                                            Requiere evidencia fotográfica
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Upload de foto */}
                            {tarea.requiereFoto && !tarea.uploaded && (
                                <div className="ml-7">
                                    <PhotoUploadZone
                                        onUpload={(file, comentario) => handleFileUpload(tarea.id, file, comentario)}
                                        loading={uploadingTareaId === tarea.id}
                                    />
                                </div>
                            )}

                            {/* Preview de evidencia */}
                            {tarea.uploaded && tarea.evidenciaUrl && (
                                <div className="ml-7 space-y-2">
                                    <img
                                        src={tarea.evidenciaUrl}
                                        alt="Evidencia"
                                        className="rounded-lg max-w-sm border border-slate-200"
                                    />
                                    {tarea.comentario && (
                                        <p className="text-sm text-slate-800 italic">
                                            Comentario: {tarea.comentario}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Botón completar */}
            <div className="flex justify-end pt-6 border-t">
                <Button
                    onClick={handleCompletar}
                    disabled={!todasCompletadas || loading}
                    size="lg"
                >
                    {loading ? (
                        'Guardando...'
                    ) : (
                        <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Completar Módulo
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

// Componente auxiliar para upload
function PhotoUploadZone({
    onUpload,
    loading,
}: {
    onUpload: (file: File, comentario?: string) => void;
    loading: boolean;
}) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [comentario, setComentario] = useState('');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamaño (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('El archivo es demasiado grande. Máximo 5MB');
            return;
        }

        // Validar formato
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            alert('Formato no permitido. Use JPG, PNG o WebP');
            return;
        }

        setSelectedFile(file);

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = () => {
        if (!selectedFile) return;
        onUpload(selectedFile, comentario || undefined);
    };

    return (
        <div className="space-y-3">
            {!selectedFile ? (
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="w-8 h-8 text-slate-600 mb-2" />
                    <span className="text-sm text-slate-800">Click para seleccionar imagen</span>
                    <span className="text-xs text-slate-700 mt-1">JPG, PNG o WebP (máx. 5MB)</span>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </label>
            ) : (
                <div className="space-y-2">
                    <img
                        src={preview!}
                        alt="Preview"
                        className="rounded-lg max-w-sm border border-slate-200"
                    />

                    <textarea
                        placeholder="Comentario opcional..."
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        rows={2}
                    />

                    <div className="flex space-x-2">
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            size="sm"
                        >
                            {loading ? 'Subiendo...' : 'Subir Evidencia'}
                        </Button>
                        <Button
                            onClick={() => {
                                setSelectedFile(null);
                                setPreview(null);
                                setComentario('');
                            }}
                            variant="outline"
                            size="sm"
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
