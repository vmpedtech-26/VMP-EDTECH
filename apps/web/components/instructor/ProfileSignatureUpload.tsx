'use client';

import React, { useState, useEffect } from 'react';
import { Upload, FileImage, Trash2, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';

export default function ProfileSignatureUpload() {
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const checkSignature = async () => {
        try {
            const data = await api.get('/users/me/signature');
            if (data.exists) {
                // Agregar un query param aleatorio para forzar refresco de cache de imagen
                setSignatureUrl(`${data.url}?t=${new Date().getTime()}`);
            } else {
                setSignatureUrl(null);
            }
        } catch (error) {
            console.error('Error al consultar firma:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkSignature();
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'image/png') {
            toast.error('Por favor, selecciona una imagen en formato PNG (necesaria para conservar transparencia).');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || '';
            const response = await fetch(`${backendUrl}/users/me/signature`, {
                method: 'POST',
                headers: {
                    // El navegador asignará automáticamente multipart/form-data con el boundary correcto
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Error al subir firma');
            }

            toast.success('¡Firma digitalizada guardada correctamente!');
            checkSignature();
        } catch (error: any) {
            console.error('Error al subir firma:', error);
            toast.error(error.message || 'No se pudo subir la firma. Por favor, reintenta.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Firma Digitalizada</h3>
                    <p className="text-slate-600 text-xs">Esta firma se estampará automáticamente en las credenciales PDF oficiales que emitas.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="h-36 bg-slate-50 animate-pulse rounded-xl border border-slate-100"></div>
            ) : signatureUrl ? (
                <div className="space-y-4">
                    <div className="border border-slate-100 rounded-xl bg-slate-50/50 p-4 flex flex-col items-center">
                        <span className="text-[10px] font-bold text-slate-600 uppercase mb-2">Vista Previa de tu Firma</span>
                        {/* Tablero estilo visor de firma con patrón de cuadrícula para denotar transparencia */}
                        <div className="h-32 w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-inner flex items-center justify-center relative overflow-hidden bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
                            <img 
                                src={`${process.env.NEXT_PUBLIC_API_URL || ''}${signatureUrl}`} 
                                alt="Firma Instructor" 
                                className="max-h-24 max-w-[80%] object-contain mix-blend-multiply"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <label className="cursor-pointer">
                            <span className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
                                {isUploading ? 'Subiendo...' : 'Reemplazar Firma'}
                            </span>
                            <input 
                                type="file" 
                                accept="image/png" 
                                className="hidden" 
                                onChange={handleFileChange} 
                                disabled={isUploading}
                            />
                        </label>
                    </div>
                </div>
            ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors">
                    <div className="p-3 bg-indigo-50 text-indigo-500 rounded-full mb-4">
                        <Upload className="h-6 w-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">Cargar tu Firma Digitalizada</h4>
                    <p className="text-slate-600 text-xs max-w-xs mt-1 mb-4 leading-relaxed">
                        Sube una imagen de tu firma manuscrita recortada con fondo transparente en formato <strong>PNG</strong>.
                    </p>
                    <label className="cursor-pointer">
                        <span className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-md shadow-primary/10">
                            {isUploading ? 'Subiendo...' : 'Seleccionar Archivo PNG'}
                        </span>
                        <input 
                            type="file" 
                            accept="image/png" 
                            className="hidden" 
                            onChange={handleFileChange} 
                            disabled={isUploading}
                        />
                    </label>
                </div>
            )}

            <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-800 leading-relaxed">
                    <strong>Importante para Credenciales:</strong> Asegúrate de que la firma tenga fondo transparente y alto contraste. Firmas sobre hojas cuadriculadas o con mala iluminación no se verán bien impresas en el PDF oficial.
                </div>
            </div>
        </div>
    );
}
