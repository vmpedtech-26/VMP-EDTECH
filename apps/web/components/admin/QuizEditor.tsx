'use client';

import React, { useState } from 'react';
import {
    Plus,
    Trash2,
    CheckCircle2,
    HelpCircle,
    MessageSquare,
    ChevronDown,
    ChevronUp,
    Image as ImageIcon,
    GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Pregunta {
    id?: string;
    pregunta: string;
    opciones: string[];
    respuestaCorrecta: number;
    explicacion?: string;
}

interface QuizEditorProps {
    preguntas: Pregunta[];
    onChange: (preguntas: Pregunta[]) => void;
}

export function QuizEditor({ preguntas, onChange }: QuizEditorProps) {
    const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

    const addQuestion = () => {
        const newQuestion: Pregunta = {
            pregunta: '',
            opciones: ['', '', '', ''],
            respuestaCorrecta: 0,
            explicacion: ''
        };
        onChange([...preguntas, newQuestion]);
        setExpandedIdx(preguntas.length);
    };

    const updateQuestion = (idx: number, data: Partial<Pregunta>) => {
        const newPreguntas = [...preguntas];
        newPreguntas[idx] = { ...newPreguntas[idx], ...data };
        onChange(newPreguntas);
    };

    const removeQuestion = (idx: number) => {
        const newPreguntas = preguntas.filter((_, i) => i !== idx);
        onChange(newPreguntas);
        if (expandedIdx === idx) setExpandedIdx(null);
    };

    const updateOption = (qIdx: number, oIdx: number, value: string) => {
        const newOpciones = [...preguntas[qIdx].opciones];
        newOpciones[oIdx] = value;
        updateQuestion(qIdx, { opciones: newOpciones });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    Cuestionario ({preguntas.length} preguntas)
                </h3>
                <Button onClick={addQuestion} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Pregunta
                </Button>
            </div>

            <div className="space-y-4">
                {preguntas.map((p, idx) => (
                    <Card key={idx} className="overflow-hidden border-none shadow-sm ring-1 ring-gray-100">
                        {/* Header colapsable */}
                        <div
                            className={`p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${expandedIdx === idx ? 'bg-slate-50 border-b border-slate-100' : ''}`}
                            onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <span className="bg-primary/10 text-primary text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center">
                                    {idx + 1}
                                </span>
                                <span className="font-medium text-slate-700 truncate max-w-md">
                                    {p.pregunta || <span className="text-slate-600 italic">Escribe la pregunta...</span>}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-300 hover:text-red-500 h-8 w-8 p-0"
                                    onClick={(e) => { e.stopPropagation(); removeQuestion(idx); }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                {expandedIdx === idx ? <ChevronUp className="h-4 w-4 text-slate-600" /> : <ChevronDown className="h-4 w-4 text-slate-600" />}
                            </div>
                        </div>

                        {/* Contenido expandido */}
                        {expandedIdx === idx && (
                            <div className="p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                                {/* Texto de la pregunta */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                        Enunciado de la Pregunta
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                                        placeholder="Ej: ¿Cuál es el procedimiento correcto ante un derrame?"
                                        value={p.pregunta}
                                        onChange={(e) => updateQuestion(idx, { pregunta: e.target.value })}
                                    />
                                </div>

                                {/* Opciones */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                        Opciones (Marca la correcta)
                                    </label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {p.opciones.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center gap-3 group">
                                                <button
                                                    type="button"
                                                    className={`h-6 w-6 rounded-full flex items-center justify-center transition-all ${p.respuestaCorrecta === oIdx ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-gray-200'}`}
                                                    onClick={() => updateQuestion(idx, { respuestaCorrecta: oIdx })}
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </button>
                                                <input
                                                    type="text"
                                                    className={`flex-1 px-4 py-2 rounded-lg border-none outline-none focus:ring-2 transition-all ${p.respuestaCorrecta === oIdx ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'bg-slate-50 focus:ring-primary/20'}`}
                                                    placeholder={`Opción ${oIdx + 1}`}
                                                    value={opt}
                                                    onChange={(e) => updateOption(idx, oIdx, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Explicación */}
                                <div className="space-y-2 pt-4 border-t border-gray-50">
                                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                        <MessageSquare className="h-3 w-3" /> Explicación (Opcional)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="¿Por qué esta es la respuesta correcta?"
                                        value={p.explicacion || ''}
                                        onChange={(e) => updateQuestion(idx, { explicacion: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {preguntas.length === 0 && (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                    <HelpCircle className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-slate-700 italic">No hay preguntas aún. Agrega la primera para comenzar.</p>
                </div>
            )}
        </div>
    );
}
