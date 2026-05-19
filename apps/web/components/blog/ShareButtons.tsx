'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareButtonsProps {
    title: string;
    url: string;
    text: string;
}

export default function ShareButtons({ title, url, text }: ShareButtonsProps) {
    const [fullUrl, setFullUrl] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        // En el cliente, construimos la URL absoluta si solo recibimos el slug o path
        if (typeof window !== 'undefined') {
            const currentUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
            setFullUrl(currentUrl);
        }
    }, [url]);

    const handleNativeShare = async () => {
        if (!fullUrl) return;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: text,
                    url: fullUrl,
                });
            } catch (error) {
                console.log('Error compartiendo:', error);
            }
        } else {
            // Fallback: Copiar al portapapeles si la API no está soportada (ej. PC)
            copyToClipboard();
        }
    };

    const copyToClipboard = async () => {
        if (!fullUrl) return;
        
        try {
            await navigator.clipboard.writeText(fullUrl);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Error al copiar:', err);
        }
    };

    const shareToWhatsApp = () => {
        if (!fullUrl) return;
        const encodedText = encodeURIComponent(`${title} - ${fullUrl}`);
        window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            <button 
                onClick={handleNativeShare}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold text-sm shadow-sm"
                title="Compartir"
            >
                {isCopied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                {isCopied ? '¡Enlace copiado!' : 'Compartir Artículo'}
            </button>
            
            {/* Botón rápido WhatsApp (opcional, útil para desktop o acceso rápido) */}
            <button 
                onClick={shareToWhatsApp}
                className="flex items-center justify-center h-9 w-9 bg-[#25D366] text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                title="Compartir en WhatsApp"
            >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </button>
        </div>
    );
}
