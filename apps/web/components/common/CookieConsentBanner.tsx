'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export default function CookieConsentBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('vmp_cookie_consent');
        if (!consent) {
            setVisible(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('vmp_cookie_consent', 'accepted');
        setVisible(false);
    };

    const rejectCookies = () => {
        localStorage.setItem('vmp_cookie_consent', 'rejected');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div
            role="dialog"
            aria-label="Consentimiento de Cookies"
            aria-live="polite"
            className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 bg-slate-900/95 backdrop-blur-md text-white p-5 rounded-2xl border border-slate-700/80 shadow-2xl space-y-3 animate-slideUp"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                    <span>Privacidad y Protección de Datos</span>
                </div>
                <button
                    onClick={rejectCookies}
                    aria-label="Cerrar aviso de cookies"
                    className="text-slate-400 hover:text-white transition-colors p-1"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Utilizamos cookies propias y de sesión para garantizar la autenticidad de las credenciales y mejorar tu experiencia de aprendizaje conforme a la Ley 25.326.
            </p>
            <div className="flex items-center gap-2 pt-1">
                <button
                    onClick={acceptCookies}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md focus:ring-2 focus:ring-emerald-400"
                >
                    Aceptar Todas
                </button>
                <button
                    onClick={rejectCookies}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs py-2.5 px-3 rounded-xl border border-slate-700 transition-all"
                >
                    Solo Necesarias
                </button>
            </div>
        </div>
    );
}
