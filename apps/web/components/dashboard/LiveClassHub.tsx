'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Video, Users, ExternalLink, Calendar, Monitor, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveClassHubProps {
    platform: 'google_meet' | 'teams' | string | null;
    url: string | null;
    date?: string | null;
    isLive?: boolean;
}

export function LiveClassHub({ platform, url, date, isLive = true }: LiveClassHubProps) {
    if (!url) return null;

    const isTeams = platform === 'teams' || url.includes('teams.microsoft.com');
    const isMeet = platform === 'google_meet' || url.includes('meet.google.com');

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8"
            >
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
                                    ) : (
                                        <Monitor className="h-8 w-8 text-white" />
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
                                    {isMeet ? 'Aula Google Meet' : isTeams ? 'Aula Microsoft Teams' : 'Aula Virtual en Vivo'}
                                </h3>
                                <p className="text-white/70 text-sm max-w-md">
                                    El instructor está esperando. Haz clic en el botón para unirte a la sesión interactiva y registrar tu asistencia.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                            <div className="hidden sm:flex flex-col items-end mr-4">
                                <div className="flex items-center gap-2 text-white/50 text-[10px] uppercase font-bold tracking-tighter">
                                    <MessageSquare className="h-3 w-3" /> Chat Activo
                                </div>
                                <div className="text-xs font-mono text-primary-light">Soporte técnico VMP OK</div>
                            </div>
                            
                            <Button 
                                size="lg" 
                                className={`w-full sm:w-auto px-8 h-14 rounded-2xl text-base font-black shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                                    isMeet ? 'bg-[#3AAFA9] hover:bg-[#2D9E93] text-white' : 
                                    isTeams ? 'bg-[#4B53BC] hover:bg-[#3B43A0] text-white' : 
                                    'bg-white text-slate-900'
                                }`}
                                onClick={() => window.open(url, '_blank')}
                            >
                                {isMeet ? 'Entrar a Meet' : isTeams ? 'Abrir en Teams' : 'Unirse al Aula'}
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
            </motion.div>
        </AnimatePresence>
    );
}
