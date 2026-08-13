'use client';

import React, { useRef, useState } from 'react';
import { Camera, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fotosCredencialApi } from '@/lib/api/fotos-credencial';

interface PhotoCaptureModalProps {
    alumnoId: string;
    feedback?: string | null;
    onUploaded: () => void;
}

export function PhotoCaptureModal({ alumnoId, feedback, onUploaded }: PhotoCaptureModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        setFile(selected);
        setError(null);
        setPreview(URL.createObjectURL(selected));
    };

    const handleSubmit = async () => {
        if (!file) return;
        setIsUploading(true);
        setError(null);
        try {
            await fotosCredencialApi.subirFoto(alumnoId, file);
            onUploaded();
        } catch (err: any) {
            setError(err.message || 'No se pudo subir la foto. Probá de nuevo.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex flex-col items-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <Camera className="h-7 w-7 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Foto para tu credencial</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Necesitamos una foto tuya para poder emitir tu credencial de capacitación.
                        Sacate una foto de frente, con buena luz, sin lentes de sol ni gorra.
                    </p>

                    {feedback && (
                        <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-left text-sm text-amber-800">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>Tu foto anterior fue rechazada: {feedback}</span>
                        </div>
                    )}

                    <div className="mt-6 w-full">
                        {preview ? (
                            <img
                                src={preview}
                                alt="Vista previa"
                                className="mx-auto h-48 w-48 rounded-xl object-cover ring-2 ring-primary/30"
                            />
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-primary hover:text-primary transition-colors"
                            >
                                <Camera className="h-8 w-8" />
                                <span className="text-sm font-semibold">Tomar o subir foto</span>
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            capture="user"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

                    <div className="mt-6 flex w-full gap-3">
                        {preview && (
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                disabled={isUploading}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Cambiar foto
                            </Button>
                        )}
                        <Button
                            type="button"
                            className="flex-1"
                            disabled={!file || isUploading}
                            onClick={handleSubmit}
                        >
                            {isUploading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Subiendo...
                                </span>
                            ) : (
                                'Enviar foto'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
