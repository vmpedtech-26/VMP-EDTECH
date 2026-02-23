'use client';

import { useState, useEffect } from 'react';
import { Modulo, QuizFeedbackResponse } from '@/types/training';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { examenesApi } from '@/lib/api/examenes';
import { inscripcionesApi } from '@/lib/api/inscripciones';
import { CheckCircle, XCircle, ChevronRight, ChevronLeft } from 'lucide-react';

interface ModuloQuizProps {
    modulo: Modulo;
    cursoId: string;
    onCompletar: () => void;
}

export function ModuloQuiz({ modulo, cursoId, onCompletar }: ModuloQuizProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [respuestas, setRespuestas] = useState<Record<string, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [feedback, setFeedback] = useState<QuizFeedbackResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const preguntas = modulo.preguntas || [];
    const preguntaActual = preguntas[currentQuestion];

    const handleSelectOption = (opcionIndex: number) => {
        if (submitted) return;

        setRespuestas({
            ...respuestas,
            [preguntaActual.id]: opcionIndex,
        });
    };

    const handleNext = () => {
        if (currentQuestion < preguntas.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const result = await examenesApi.enviarQuiz(cursoId, modulo.id, respuestas);
            setFeedback(result);
            setSubmitted(true);
        } catch (error: any) {
            console.error('Error al enviar quiz:', error);
            alert(error.message || 'Error al enviar el quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleCompletar = async () => {
        if (!feedback?.aprobado) {
            // Reiniciar quiz
            setRespuestas({});
            setSubmitted(false);
            setFeedback(null);
            setCurrentQuestion(0);
            return;
        }

        setLoading(true);
        try {
            await inscripcionesApi.completarModulo(
                cursoId,
                modulo.id,
                feedback.calificacion,
                feedback.aprobado
            );
            onCompletar();
        } catch (error: any) {
            console.error('Error al completar módulo:', error);
            alert(error.message || 'Error al completar el módulo');
        } finally {
            setLoading(false);
        }
    };

    if (preguntas.length === 0) {
        return (
            <div className="p-8 text-center text-slate-800">
                Este quiz no tiene preguntas configuradas.
            </div>
        );
    }

    // Vista de resultados
    if (submitted && feedback) {
        return (
            <div className="space-y-6">
                <div className="border-b pb-4">
                    <h2 className="text-2xl font-bold text-slate-900">{modulo.titulo}</h2>
                </div>

                {/* Resultado General */}
                <Card className={`border-2 ${feedback.aprobado ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                    <div className="text-center space-y-4">
                        {feedback.aprobado ? (
                            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                        ) : (
                            <XCircle className="w-16 h-16 text-red-600 mx-auto" />
                        )}
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">
                                {feedback.calificacion.toFixed(1)}%
                            </h3>
                            <p className="text-slate-700 mt-2">{feedback.message}</p>
                            <p className="text-sm text-slate-800 mt-1">
                                Respondiste correctamente {feedback.respuestasCorrectas} de {feedback.totalPreguntas} preguntas
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Feedback por pregunta */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900">Revisión de Respuestas</h3>
                    {feedback.feedback.map((item, idx) => {
                        const pregunta = preguntas.find(p => p.id === item.preguntaId);
                        if (!pregunta) return null;

                        return (
                            <Card key={item.preguntaId} className={`border-l-4 ${item.correcta ? 'border-l-green-500' : 'border-l-red-500'}`}>
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between">
                                        <p className="font-semibold text-slate-900">
                                            {idx + 1}. {pregunta.pregunta}
                                        </p>
                                        {item.correcta ? (
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                        )}
                                    </div>

                                    {!item.correcta && (
                                        <div className="text-sm space-y-1">
                                            <p className="text-red-600">
                                                Tu respuesta: {pregunta.opciones[item.respuestaElegida]}
                                            </p>
                                            <p className="text-green-600">
                                                Respuesta correcta: {pregunta.opciones[item.respuestaCorrecta]}
                                            </p>
                                        </div>
                                    )}

                                    {item.explicacion && (
                                        <p className="text-sm text-slate-800 bg-slate-50 p-2 rounded">
                                            💡 {item.explicacion}
                                        </p>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Botón de acción */}
                <div className="flex justify-end pt-6 border-t">
                    <Button
                        onClick={handleCompletar}
                        disabled={loading}
                        size="lg"
                        variant={feedback.aprobado ? 'primary' : 'outline'}
                    >
                        {loading ? (
                            'Guardando...'
                        ) : feedback.aprobado ? (
                            <>
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Completar y Continuar
                            </>
                        ) : (
                            'Intentar Nuevamente'
                        )}
                    </Button>
                </div>
            </div>
        );
    }

    // Vista de quiz
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-900">{modulo.titulo}</h2>
                <div className="flex items-center justify-between mt-2">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold text-sm">
                        Cuestionario
                    </span>
                    <span className="text-sm text-slate-800">
                        Pregunta {currentQuestion + 1} de {preguntas.length}
                    </span>
                </div>
            </div>

            {/* Progreso */}
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / preguntas.length) * 100}%` }}
                />
            </div>

            {/* Pregunta */}
            <Card>
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                        {preguntaActual.pregunta}
                    </h3>

                    <div className="space-y-3">
                        {preguntaActual.opciones.map((opcion, idx) => {
                            const isSelected = respuestas[preguntaActual.id] === idx;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectOption(idx)}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${isSelected
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                                            }`}>
                                            {isSelected && (
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                            )}
                                        </div>
                                        <span className="text-slate-900">{opcion}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </Card>

            {/* Navegación */}
            <div className="flex items-center justify-between pt-6 border-t">
                <Button
                    onClick={handlePrev}
                    disabled={currentQuestion === 0}
                    variant="outline"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                </Button>

                <span className="text-sm text-slate-800">
                    {Object.keys(respuestas).length} de {preguntas.length} respondidas
                </span>

                {currentQuestion === preguntas.length - 1 ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={Object.keys(respuestas).length !== preguntas.length || loading}
                    >
                        {loading ? 'Enviando...' : 'Enviar Quiz'}
                    </Button>
                ) : (
                    <Button
                        onClick={handleNext}
                        disabled={currentQuestion === preguntas.length - 1}
                    >
                        Siguiente
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                )}
            </div>
        </div>
    );
}
