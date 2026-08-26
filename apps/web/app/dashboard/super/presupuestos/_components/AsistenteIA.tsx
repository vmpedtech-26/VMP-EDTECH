'use client';

import React, { useState } from 'react';
import { X, Sparkles, Wand2, Loader2, FileText, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { presupuestosHseApi } from '@/lib/api/presupuestos-hse';
import { toast } from 'sonner';

interface Props {
    onClose: () => void;
    onCompletar: (data: any) => void;
    onRedactarAlcance: (data: any) => void;
    onSugerirTarifas: (data: any) => void;
}

export function AsistenteIA({ onClose, onCompletar, onRedactarAlcance, onSugerirTarifas }: Props) {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    const handleAction = async (action: 'completar' | 'alcance' | 'tarifas') => {
        if (!prompt.trim()) {
            toast.error('Por favor ingresa una descripción para el asistente.');
            return;
        }

        setIsLoading(true);
        setLoadingAction(action);
        try {
            if (action === 'completar') {
                const res = await presupuestosHseApi.iaCompletar(prompt);
                onCompletar(res);
                toast.success('Formulario autocompletado por IA');
            } else if (action === 'alcance') {
                const res = await presupuestosHseApi.iaRedactarAlcance(prompt);
                onRedactarAlcance(res);
                toast.success('Alcance redactado por IA');
            } else if (action === 'tarifas') {
                const res = await presupuestosHseApi.iaSugerirTarifas(prompt);
                onSugerirTarifas(res);
                toast.success('Tarifas sugeridas por IA');
            }
        } catch (error) {
            console.error(error);
            toast.error('La IA no está disponible en este momento o hubo un error.');
        } finally {
            setIsLoading(false);
            setLoadingAction(null);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 border-l border-gray-200 w-80 shadow-2xl">
            <div className="flex items-center justify-between p-4 bg-[#060D1A] text-white">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#0D9488]" />
                    <h2 className="font-bold text-white">Asistente IA</h2>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <p className="text-sm text-gray-600">
                    Describí lo que necesitás y la IA se encargará de rellenar los datos.
                </p>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ej: Necesito un presupuesto para YPF de un supervisor en seguridad que va a estar 10 jornadas en Neuquén de 8 a 17hs..."
                    className="w-full h-32 p-3 text-sm rounded-xl border border-gray-200 shadow-inner resize-none focus:ring-2 focus:ring-[#0D9488]/50 outline-none"
                    disabled={isLoading}
                />

                <div className="space-y-3 pt-4">
                    <Button 
                        onClick={() => handleAction('completar')} 
                        disabled={isLoading}
                        className="w-full justify-start bg-white text-gray-700 border border-gray-200 hover:bg-slate-100"
                        variant="outline"
                    >
                        {loadingAction === 'completar' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2 text-[#0D9488]" />}
                        Completar Formulario
                    </Button>

                    <Button 
                        onClick={() => handleAction('alcance')} 
                        disabled={isLoading}
                        className="w-full justify-start bg-white text-gray-700 border border-gray-200 hover:bg-slate-100"
                        variant="outline"
                    >
                        {loadingAction === 'alcance' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2 text-blue-500" />}
                        Redactar Alcance
                    </Button>

                    <Button 
                        onClick={() => handleAction('tarifas')} 
                        disabled={isLoading}
                        className="w-full justify-start bg-white text-gray-700 border border-gray-200 hover:bg-slate-100"
                        variant="outline"
                    >
                        {loadingAction === 'tarifas' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Calculator className="h-4 w-4 mr-2 text-[#F97316]" />}
                        Sugerir Tarifas
                    </Button>
                </div>
            </div>
            {isLoading && (
                <div className="p-4 bg-[#0D9488]/10 text-[#0D9488] text-xs font-semibold flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Procesando con IA...
                </div>
            )}
        </div>
    );
}
