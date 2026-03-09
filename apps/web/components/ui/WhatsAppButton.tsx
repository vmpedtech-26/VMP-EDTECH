'use client';

import { motion } from 'framer-motion';

const WHATSAPP_NUMBER = '5492995370173';
const DEFAULT_MESSAGE = 'Hola, me interesa conocer más sobre los cursos de capacitación. ¿Podrían darme más información?';

export default function WhatsAppButton() {
    const openWhatsApp = () => {
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            <motion.button
                onClick={openWhatsApp}
                className="relative w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Abrir chat de WhatsApp"
            >
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.123 1.526 5.858L.057 23.534a.5.5 0 00.61.61l5.676-1.47A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.918 0-3.752-.5-5.382-1.448l-.386-.23-3.369.872.897-3.279-.252-.4A9.8 9.8 0 012.18 12C2.18 6.58 6.58 2.18 12 2.18S21.82 6.58 21.82 12 17.42 21.82 12 21.82z" />
                </svg>
                {/* Pulse ring animation */}
                <motion.div
                    className="absolute -inset-1 rounded-full bg-[#25D366]"
                    style={{ zIndex: -1 }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                />
            </motion.button>
        </div>
    );
}
