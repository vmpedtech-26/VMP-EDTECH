'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { Pregunta, QuizFeedbackResponse } from '@/types/training';
import { toast } from 'sonner';
import { examenesApi } from '@/lib/api/examenes';

interface QuizViewerProps {
    cursoId: string;
    moduloId: string;
    preguntas: Pregunta[];
    onComplete: (data: { calificacion: number; aprobado: boolean }) => Promise<void>;
}

export function QuizViewer({ cursoId, moduloId, preguntas, onComplete }: QuizViewerProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [respuestas, setRespuestas] = useState<Record<string, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<QuizFeedbackResponse | null>(null);

    // Cargar script de confeti dinámicamente de forma robusta
    React.useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
        script.async = true;
        document.body.appendChild(script);
        
        return () => {
            try {
                document.body.removeChild(script);
            } catch (e) {}
        };
    }, []);

    const handleSelect = (opcionIndex: number) => {
        setRespuestas({ ...respuestas, [preguntas[currentStep].id]: opcionIndex });
    };

    const handleNext = () => {
        if (currentStep < preguntas.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Llama al endpoint real de enviar-quiz que evalúa las respuestas y emite la credencial en el backend
            const feedbackRes = await examenesApi.enviarQuiz(cursoId, moduloId, respuestas);

            await onComplete({ calificacion: feedbackRes.calificacion, aprobado: feedbackRes.aprobado });

            if (feedbackRes.aprobado) {
                toast.success('¡Felicidades!', {
                    description: 'Has aprobado el examen y el módulo ha sido completado.',
                });

                // Lanzar confeti espectacular de doble ráfaga lateral
                if (typeof window !== 'undefined' && (window as any).confetti) {
                    const duration = 3.5 * 1000;
                    const end = Date.now() + duration;

                    (function frame() {
                        (window as any).confetti({
                            particleCount: 5,
                            angle: 60,
                            spread: 55,
                            origin: { x: 0 }
                        });
                        (window as any).confetti({
                            particleCount: 5,
                            angle: 120,
                            spread: 55,
                            origin: { x: 1 }
                        });

                        if (Date.now() < end) {
                            requestAnimationFrame(frame);
                        }
                    }());
                }
            } else {
                toast.error('Examen no aprobado', {
                    description: 'No has alcanzado la nota mínima. Puedes intentarlo de nuevo.',
                });
            }

            setFeedback(feedbackRes);
        } catch (err) {
            console.error('Error submitting quiz:', err);
            toast.error('Error al enviar el examen. Por favor intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (feedback) {
        return (
            <div className="max-w-2xl mx-auto text-center space-y-8 animate-in zoom-in duration-500">
                <div className={`inline-flex p-6 rounded-full ${feedback.aprobado ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    {feedback.aprobado ? <CheckCircle2 className="h-20 w-20" /> : <XCircle className="h-20 w-20" />}
                </div>

                <div>
                    <h2 className="text-4xl font-bold text-slate-900 mb-2">{feedback.message}</h2>
                    <p className="text-slate-700 text-lg">Tu calificación final: <span className="font-bold text-slate-900">{feedback.calificacion}%</span></p>
                </div>

                <Card className="bg-slate-50 border-0 p-8">
                    <div className="flex justify-around items-center">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-slate-900">{feedback.respuestasCorrectas}</div>
                            <div className="text-xs text-slate-700 uppercase tracking-wider">Correctas</div>
                        </div>
                        <div className="h-12 w-px bg-gray-200" />
                        <div className="text-center">
                            <div className="text-3xl font-bold text-slate-900">{feedback.totalPreguntas}</div>
                            <div className="text-xs text-slate-700 uppercase tracking-wider">Total</div>
                        </div>
                    </div>
                </Card>

                <div className="pt-4">
                    {feedback.aprobado ? (
                        <p className="text-slate-800 mb-6">El módulo ha sido marcado como completado y tu progreso ha sido actualizado.</p>
                    ) : (
                        <p className="text-slate-800 mb-6">Puedes revisar el material e intentar nuevamente cuando estés listo.</p>
                    )}
                    <Button
                        size="lg"
                        onClick={() => window.location.href = window.location.pathname.split('/modulos')[0]}
                    >
                        Volver al curso
                    </Button>
                </div>
            </div>
        );
    }

    const currentPregunta = preguntas[currentStep];
    const selectedOpcion = respuestas[currentPregunta.id];

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Progress Header */}
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <div>
                        <span className="text-primary font-bold">Evaluación: Pregunta {currentStep + 1}</span>
                        <span className="text-slate-600 font-medium"> de {preguntas.length}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-600">
                        {Math.round(((currentStep + 1) / preguntas.length) * 100)}%
                    </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / preguntas.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <Card className="p-8 md:p-12 shadow-xl border-0 ring-1 ring-gray-100">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 leading-tight">
                    {currentPregunta.pregunta}
                </h2>

                <div className="space-y-4">
                    {currentPregunta.opciones.map((opcion, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSelect(idx)}
                            className={`w-full text-left p-6 rounded-xl border-2 transition-all flex items-center justify-between group ${selectedOpcion === idx
                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            <span className={`text-lg font-medium ${selectedOpcion === idx ? 'text-primary' : 'text-slate-700'}`}>
                                {opcion}
                            </span>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedOpcion === idx ? 'border-primary bg-primary' : 'border-gray-300 group-hover:border-gray-400'
                                }`}>
                                {selectedOpcion === idx && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                        </button>
                    ))}
                </div>
            </Card>

            <div className="flex justify-between items-center pt-4">
                <div className="flex items-center text-slate-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span>Selecciona una opción para continuar</span>
                </div>
                <Button
                    size="lg"
                    disabled={selectedOpcion === undefined || isSubmitting}
                    onClick={handleNext}
                    className="min-w-[200px]"
                >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> :
                        currentStep === preguntas.length - 1 ? 'Finalizar Examen' : 'Siguiente Pregunta'}
                    {!isSubmitting && <ChevronRight className="ml-2 h-5 w-5" />}
                </Button>
            </div>
        </div>
    );
}
