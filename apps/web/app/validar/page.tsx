'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { Search, ShieldCheck, Camera, Upload, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import jsQR from 'jsqr';

export default function ValidarPage() {
    const [codigo, setCodigo] = useState('');
    const [isScanningCamera, setIsScanningCamera] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [scanMessage, setScanMessage] = useState<string | null>(null);
    const router = useRouter();

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameId = useRef<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cleaned = codigo.trim().toUpperCase();
        if (cleaned) {
            processValidationCode(cleaned);
        }
    };

    const processValidationCode = (scannedText: string) => {
        let code = scannedText.trim();
        // If scanned text is a full URL, extract the code path parameter or query string
        if (code.includes('/validar/')) {
            const parts = code.split('/validar/');
            if (parts[1]) {
                code = parts[1].split('?')[0].trim();
            }
        } else if (code.includes('codigo=')) {
            const urlParams = new URLSearchParams(code.substring(code.indexOf('?')));
            const paramVal = urlParams.get('codigo');
            if (paramVal) code = paramVal.trim();
        }
        
        if (code) {
            router.push(`/validar/${encodeURIComponent(code)}`);
        }
    };

    // Camera Scanning Loop
    const startCameraScan = async () => {
        setCameraError(null);
        setScanMessage('Iniciando cámara...');
        setIsScanningCamera(true);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.setAttribute('playsinline', 'true');
                videoRef.current.play();
                setScanMessage('Apunta la cámara al código QR de la credencial');
                scanVideoLoop();
            }
        } catch (err: any) {
            setCameraError('No se pudo acceder a la cámara. Revisa los permisos de tu navegador.');
            setIsScanningCamera(false);
        }
    };

    const stopCameraScan = () => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsScanningCamera(false);
        setScanMessage(null);
    };

    const scanVideoLoop = () => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            const canvas = canvasRef.current || document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx && videoRef.current) {
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const codeResult = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: 'dontInvert'
                });

                if (codeResult && codeResult.data) {
                    stopCameraScan();
                    processValidationCode(codeResult.data);
                    return;
                }
            }
        }
        animationFrameId.current = requestAnimationFrame(scanVideoLoop);
    };

    // File Image Upload Decoder
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);

                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                const codeResult = jsQR(imageData.data, imageData.width, imageData.height);

                if (codeResult && codeResult.data) {
                    processValidationCode(codeResult.data);
                } else {
                    alert('No se detectó un código QR válido en la imagen seleccionada. Por favor intenta con otra foto o ingresa el código manualmente.');
                }
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        return () => {
            stopCameraScan();
        };
    }, []);

    return (
        <main className="min-h-screen bg-background-light flex flex-col">
            <Header />

            <div className="flex-grow flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
                            <ShieldCheck className="h-10 w-10 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-4">
                            Validador de Certificaciones
                        </h1>
                        <p className="text-slate-800">
                            Verificá la autenticidad de cualquier credencial VMP en segundos escaneando el QR o ingresando su código.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-100 space-y-6">
                        {/* Camera Scanner View */}
                        {isScanningCamera ? (
                            <div className="space-y-4 text-center">
                                <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-square flex items-center justify-center border-2 border-primary">
                                    <video ref={videoRef} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 border-2 border-dashed border-teal-400 m-8 rounded-lg pointer-events-none animate-pulse" />
                                </div>
                                {scanMessage && (
                                    <p className="text-sm font-semibold text-primary">{scanMessage}</p>
                                )}
                                <Button onClick={stopCameraScan} variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                                    <X className="w-4 h-4 mr-2" /> Cancelar Escaneo
                                </Button>
                            </div>
                        ) : (
                            <>
                                {/* Quick Camera & Upload Action Buttons */}
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        type="button"
                                        onClick={startCameraScan}
                                        className="w-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center py-3 text-sm"
                                    >
                                        <Camera className="w-4 h-4 mr-2" /> Escanear QR
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        variant="outline"
                                        className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center justify-center py-3 text-sm"
                                    >
                                        <Upload className="w-4 h-4 mr-2" /> Cargar Foto
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </div>

                                {cameraError && (
                                    <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg text-center">
                                        {cameraError}
                                    </p>
                                )}

                                <div className="relative flex items-center justify-center">
                                    <div className="border-t border-slate-200 w-full" />
                                    <span className="bg-white px-3 text-xs text-slate-600 font-semibold uppercase relative">
                                        o ingresa manualmente
                                    </span>
                                </div>

                                {/* Manual Code Form */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="codigo" className="block text-sm font-medium text-slate-700 mb-2">
                                            Código Único de Credencial
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Search className="h-5 w-5 text-slate-600" />
                                            </div>
                                            <input
                                                type="text"
                                                id="codigo"
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm uppercase font-bold tracking-wider text-slate-900"
                                                placeholder="EJ: VMP-2026-1283"
                                                value={codigo}
                                                onChange={(e) => setCodigo(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit" size="lg" className="w-full">
                                        Verificar Credencial
                                    </Button>
                                </form>
                            </>
                        )}
                    </div>

                    <div className="mt-8 text-center text-sm text-slate-700">
                        <p>El código de credencial figura impreso tanto en el frente como al dorso de su carnet digital.</p>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}

