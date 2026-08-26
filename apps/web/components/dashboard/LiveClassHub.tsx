'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Video, Users, ExternalLink, Calendar, Monitor, MessageSquare, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmbeddedMeeting } from './EmbeddedMeeting';

interface LiveClassHubProps {
    platform: 'google_meet' | 'teams' | 'zoom' | 'jitsi' | string | null;
    url: string | null;
    date?: string | null;
    isLive?: boolean;
    courseName?: string;
}

export function LiveClassHub({ platform, url, date, isLive = true, courseName = "Curso" }: LiveClassHubProps) {
    const [showEmbedded, setShowEmbedded] = useState(false);

    if (!url) return null;

    const isTeams = platform === 'teams' || url.includes('teams.microsoft.com');
    const isMeet = platform === 'google_meet' || url.includes('meet.google.com');
    const isZoom = platform === 'zoom' || url.includes('zoom.us');
    const isJitsi = platform === 'jitsi' || url.includes('jit.si');

    const getPlatformLabel = () => {
        if (isMeet) return 'Google Meet';
        if (isTeams) return 'Microsoft Teams';
        if (isZoom) return 'Zoom Meeting';
        if (isJitsi) return 'Jitsi Meet (Embebido)';
        return 'Virtual';
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8 space-y-6"
            >
                {!showEmbedded ? (
                    <Card className="relative overflow-hidden border-none shadow-xl bg-[#0F172A] text-white p-0">
                        {/* Animated Background Pulse */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px] animate-pulse"></div>
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/20 rounded-full blur-[80px] animate-pulse"></div>
                        </div>

                        <div className="relative p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                                        {isMeet ? (
                                            <div className="relative">
                                                <Video className="h-8 w-8 text-white" />
                                                <div className="absolute -top-1 -right-1 flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                                </div>
                                            </div>
                                        ) : isTeams ? (
                                            <div className="relative">
                                                <Users className="h-8 w-8 text-white" />
                                                <div className="absolute -top-1 -right-1 flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                                </div>
                                            </div>
                                        ) : isZoom ? (
                                            <div className="relative">
                                                <Video className="h-8 w-8 text-sky-400" />
                                                <div className="absolute -top-1 -right-1 flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                                                </div>
                                            </div>
                                        ) : (
                                            <Monitor className="h-8 w-8 text-emerald-400" />
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="inline-block px-2 py-0.5 rounded-full bg-red-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                                            EN VIVO
                                        </span>
                                        <span className="text-white/60 text-xs font-medium">Clase Sincrónica</span>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
                                        Aula {getPlatformLabel()}
                                    </h3>
                                    <p className="text-white/70 text-sm max-w-md">
                                        El instructor está en línea. Puedes ingresar directamente desde el LMS o abrir la plataforma externa.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                                {(isJitsi || isZoom) && (
                                    <Button 
                                        size="lg"
                                        variant="outline"
                                        className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 hover:text-white"
                                        onClick={() => setShowEmbedded(true)}
                                    >
                                        <Play className="mr-2 h-4 w-4 fill-current" />
                                        Ver en LMS
                                    </Button>
                                )}

                                <Button 
                                    size="lg" 
                                    className={`w-full sm:w-auto px-8 h-14 rounded-2xl text-base font-black shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                                        isMeet ? 'bg-[#3AAFA9] hover:bg-[#2D9E93] text-white' : 
                                        isTeams ? 'bg-[#4B53BC] hover:bg-[#3B43A0] text-white' : 
                                        isZoom ? 'bg-sky-600 hover:bg-sky-700 text-white' :
                                        'bg-white text-slate-900'
                                    }`}
                                    onClick={() => window.open(url, '_blank')}
                                >
                                    {isMeet ? 'Entrar a Meet' : isTeams ? 'Abrir en Teams' : isZoom ? 'Abrir Zoom' : 'Abrir Videollamada'}
                                    <ExternalLink className="ml-3 h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Progress Bar styled indicator */}
                        <div className="h-1 w-full bg-white/5 overflow-hidden">
                            <motion.div 
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                                className="w-1/3 h-full bg-gradient-to-r from-transparent via-primary/50 to-transparent"
                            />
                        </div>
                    </Card>
                ) : (
                    <EmbeddedMeeting 
                        platform={isZoom ? 'zoom' : 'jitsi'} 
                        url={url} 
                        courseName={courseName} 
                        onClose={() => setShowEmbedded(false)} 
                    />
                )}
            </motion.div>
        </AnimatePresence>
    );
}
