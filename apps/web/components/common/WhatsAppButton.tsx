'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function WhatsAppButton() {
    const whatsappUrl = 'https://wa.me/5492995370173?text=Hola%2C%20quisiera%20recibir%20informaci%C3%B3n%20sobre%20las%20capacitaciones%20profesionales%20de%20VMP.';

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar por WhatsApp con el equipo de VMP-EDTECH"
            className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-slate-950 p-3.5 rounded-full shadow-[0_10px_30px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-110 flex items-center justify-center border-2 border-white/80 group"
        >
            <MessageSquare className="w-6 h-6 fill-current text-slate-950" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-500 whitespace-nowrap text-xs font-black tracking-wide text-slate-950 uppercase">
                Atención WhatsApp
            </span>
        </a>
    );
}
