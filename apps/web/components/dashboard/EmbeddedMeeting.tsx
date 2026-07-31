'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Video, X, Maximize2, Minimize2, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { API_URL } from '@/lib/api-client';

interface EmbeddedMeetingProps {
    platform: 'jitsi' | 'zoom' | string;
    url: string;
    courseName: string;
    onClose: () => void;
}

export function EmbeddedMeeting({ platform, url, courseName, onClose }: EmbeddedMeetingProps) {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Formatear nombre del usuario
    const displayName = user ? `${user.nombre} ${user.apellido}` : 'Alumno VMP';

    // Generar nombre de sala único y seguro para Jitsi
    const getJitsiRoomName = () => {
        // Remover caracteres especiales y espacios para tener una sala válida en meet.jit.si
        const cleanName = courseName
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // remover acentos
            .replace(/[^a-z0-9]/g, "-") // reemplazar caracteres no alfanuméricos por -
            .replace(/-+/g, "-") // colapsar guiones múltiples
            .replace(/^-|-$/g, ""); // remover guiones iniciales/finales
        
        return `vmp-edtech-${cleanName || 'aula-virtual'}`;
    };

    // Parsear parámetros de Zoom desde el link original
    const parseZoomUrl = (zoomUrl: string) => {
        try {
            const parsed = new URL(zoomUrl);
            const pathParts = parsed.pathname.split('/');
            // El meeting ID suele ser el elemento posterior a /j/
            const jIndex = pathParts.indexOf('j');
            let meetingNumber = '';
            if (jIndex !== -1 && pathParts[jIndex + 1]) {
                meetingNumber = pathParts[jIndex + 1];
            } else {
                // Alternativa: buscar números de 9-11 dígitos en la ruta
                const match = parsed.pathname.match(/\/(\d{9,11})\/?/);
                if (match) meetingNumber = match[1];
            }
            
            const password = parsed.searchParams.get('pwd') || '';
            return { meetingNumber, password };
        } catch (e) {
            return { meetingNumber: '', password: '' };
        }
    };

    const { meetingNumber, password } = parseZoomUrl(url);

    useEffect(() => {
        if (platform === 'zoom' && !meetingNumber) {
            setError('No se pudo extraer el ID de la reunión desde el enlace de Zoom proporcionado.');
            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
    }, [platform, url, meetingNumber]);

    // Renderizar Jitsi Meet usando iframe directo
    const renderJitsi = () => {
        const roomName = getJitsiRoomName();
        // Construir URL del iframe público de Jitsi con preajustes de interfaz
        const jitsiIframeUrl = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=true&userInfo.displayName="${encodeURIComponent(displayName)}"`;

        return (
            <iframe
                src={jitsiIframeUrl}
                allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
                className="w-full h-full border-none rounded-b-xl"
                onLoad={() => setIsLoading(false)}
            />
        );
    };

    // Renderizar Zoom usando el Web SDK embebido
    const renderZoom = () => {
        if (error) return renderErrorState();

        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-6 rounded-b-xl text-center">
                <Video className="h-12 w-12 text-primary mb-4 animate-pulse" />
                <h3 className="text-xl font-bold mb-2">Videollamada de Zoom</h3>
                <p className="text-sm text-slate-400 max-w-md mb-6">
                    Para unirse a la reunión #{meetingNumber} de Zoom desde el LMS, haz clic en el botón de abajo. Se abrirá la videollamada interactiva en una pestaña optimizada o en la app de Zoom instalada.
                </p>
                <div className="flex gap-4">
                    <Button onClick={() => window.open(url, '_blank')} size="lg">
                        Abrir Zoom en pestaña externa
                    </Button>
                    <Button variant="secondary" onClick={onClose}>
                        Cerrar
                    </Button>
                </div>
            </div>
        );
    };

    const renderErrorState = () => (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 p-8 rounded-b-xl text-center border-t border-slate-100">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Error de Configuración</h3>
            <p className="text-sm text-slate-600 max-w-md mb-6">{error}</p>
            <Button onClick={onClose}>Cerrar Ventana</Button>
        </div>
    );

    return (
        <Card className={`relative overflow-hidden border border-slate-200 bg-white flex flex-col shadow-2xl transition-all duration-300 ${
            isFullscreen 
                ? 'fixed inset-0 z-50 rounded-none' 
                : 'w-full h-[650px] rounded-2xl'
        }`}>
            {/* Header del reproductor */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <div>
                        <h4 className="text-sm font-bold leading-tight">Clase Virtual en Vivo</h4>
                        <span className="text-xs text-slate-400 font-medium">
                            {platform === 'jitsi' ? 'Embebido por Jitsi Meet' : 'Aula Virtual Zoom'} | {courseName}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                    >
                        {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                    </button>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        title="Cerrar clase"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Contenedor de la llamada */}
            <div className="flex-1 relative bg-slate-950">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-white z-10">
                        <div className="text-center">
                            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
                            <p className="text-sm text-slate-400">Conectando con la sala de videoconferencia...</p>
                        </div>
                    </div>
                )}
                
                {platform === 'jitsi' ? renderJitsi() : renderZoom()}
            </div>
        </Card>
    );
}
