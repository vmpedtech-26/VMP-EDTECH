'use client';

import React, { useState } from 'react';
import {
    X,
    QrCode,
    Copy,
    Check,
    Download,
    Share2,
    Building2,
    ExternalLink,
    ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ModalQrCorporativoProps {
    isOpen: boolean;
    onClose: () => void;
    empresaNombre: string;
    empresaSlug: string;
}

export function ModalQrCorporativo({
    isOpen,
    onClose,
    empresaNombre,
    empresaSlug
}: ModalQrCorporativoProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    // URL oficial de auto-registro
    const registrationUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/registro/${empresaSlug}`
        : `https://vmp-edtech.com/registro/${empresaSlug}`;

    // URL de API pública para generar imagen QR en HD
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(registrationUrl)}&color=0f172a&bgcolor=ffffff&qzone=1`;

    const handleCopy = () => {
        navigator.clipboard.writeText(registrationUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadQr = () => {
        const link = document.createElement('a');
        link.href = qrImageUrl;
        link.download = `QR_AutoRegistro_${empresaSlug.toUpperCase()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 flex flex-col">
                
                {/* Header */}
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-primary/20 rounded-xl text-primary-light">
                            <QrCode className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Link Corporativo & Código QR</h2>
                            <p className="text-xs text-gray-300">Auto-registro directo para personal de flota.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 text-center">
                    
                    {/* Empresa Badge */}
                    <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs">
                        <Building2 className="h-4 w-4" />
                        <span>{empresaNombre || 'Empresa Cliente'}</span>
                    </div>

                    {/* QR Code Container */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200 inline-block shadow-inner">
                        <img
                            src={qrImageUrl}
                            alt={`Código QR auto-registro ${empresaNombre}`}
                            className="w-52 h-52 mx-auto rounded-lg shadow-md border border-white"
                        />
                        <p className="text-[11px] text-gray-500 mt-3 font-medium flex items-center justify-center">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 mr-1" />
                            Escaneo directo desde el celular del chofer
                        </p>
                    </div>

                    {/* URL Link Box */}
                    <div className="space-y-2 text-left">
                        <label className="block text-xs font-bold text-gray-700">Enlace Único de Registro:</label>
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-2.5">
                            <input
                                type="text"
                                readOnly
                                value={registrationUrl}
                                className="bg-transparent text-xs font-mono text-gray-700 flex-1 outline-none truncate pr-2"
                            />
                            <button
                                onClick={handleCopy}
                                className="flex items-center space-x-1 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-sm"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                                        <span className="text-emerald-600">Copiado</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3.5 w-3.5" />
                                        <span>Copiar</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Quick Action buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleDownloadQr}
                            className="w-full bg-white border-gray-200 text-gray-800 hover:bg-gray-50 text-xs font-semibold py-2.5"
                        >
                            <Download className="h-4 w-4 mr-2 text-primary" />
                            Descargar QR
                        </Button>
                        <Button
                            type="button"
                            asChild
                            className="w-full bg-primary hover:bg-primary-dark text-white text-xs font-semibold py-2.5"
                        >
                            <a href={registrationUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Abrir Link
                            </a>
                        </Button>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-500">
                        Los conductores registrados mediante este enlace quedarán vinculados a <strong>{empresaNombre}</strong> en tiempo real.
                    </p>
                </div>

            </div>
        </div>
    );
}
