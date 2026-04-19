'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QrCode, Download, Share2, Shield, Calendar, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Credencial } from '@/types/training';

interface CardCredencialProps {
    credencial: Credencial;
}

export function CardCredencial({ credencial }: CardCredencialProps) {
    const { curso, numero, fechaEmision, fechaVencimiento, pdfUrl, alumno } = credencial;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className="group"
        >
            <Card className="p-0 overflow-hidden border-none shadow-2xl bg-white group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-500 rounded-2xl">
                {/* Visual Card (Blister ID Style) */}
                <div className="relative aspect-[1.6/1] w-full bg-[#0F0F12] p-5 text-white overflow-hidden flex flex-col justify-between">
                    {/* Background Tech Patterns */}
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                         style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-secondary/10 pointer-events-none"></div>
                    
                    {/* Header */}
                    <div className="relative flex justify-between items-center border-b border-white/10 pb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
                                <Shield className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black tracking-[0.2em] text-white uppercase">VMP EDTECH</div>
                                <div className="text-[7px] text-white/50 tracking-widest uppercase">Certification System</div>
                            </div>
                        </div>
                        <div className="text-[8px] font-mono text-white/40 bg-white/5 px-2 py-1 rounded">
                            ID: {numero.split('-').pop()}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="relative flex gap-4 items-center">
                        {/* Student Photo Slot */}
                        <div className="relative flex-shrink-0">
                            <div className="w-20 h-24 rounded-lg overflow-hidden border-2 border-white/20 bg-slate-800 shadow-inner flex items-center justify-center">
                                {alumno?.fotoUrl ? (
                                    <img 
                                        src={alumno.fotoUrl} 
                                        alt={alumno.nombre}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <UserIcon className="h-10 w-10 text-white/20" />
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-[#0F0F12] flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                            </div>
                        </div>

                        {/* Student & Course Info */}
                        <div className="flex-1 min-w-0">
                            <div className="text-[8px] uppercase tracking-widest text-primary-light font-bold mb-1">Titular</div>
                            <h4 className="text-sm font-bold truncate text-white leading-tight mb-2">
                                {alumno?.nombre} {alumno?.apellido}
                            </h4>
                            
                            <div className="text-[8px] uppercase tracking-widest text-white/40 font-bold mb-0.5">Certificación Profesional en:</div>
                            <div className="text-[11px] font-bold text-white/90 line-clamp-2 leading-snug">
                                {curso.nombre}
                            </div>
                        </div>
                    </div>

                    {/* Footer / QR / Dates */}
                    <div className="relative flex justify-between items-end border-t border-white/10 pt-3">
                        <div className="flex gap-4">
                            <div>
                                <div className="text-[7px] uppercase tracking-widest text-white/30 mb-0.5">EMISIÓN</div>
                                <div className="text-[9px] font-mono font-medium text-white/80">
                                    {new Date(fechaEmision).toLocaleDateString()}
                                </div>
                            </div>
                            <div>
                                <div className="text-[7px] uppercase tracking-widest text-white/30 mb-0.5">VENCE</div>
                                <div className="text-[9px] font-mono font-medium text-warning">
                                    {fechaVencimiento ? new Date(fechaVencimiento).toLocaleDateString() : 'PERMANENTE'}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <div className="text-[6px] text-white/40 uppercase tracking-tighter">Validar con QR</div>
                                <div className="text-[8px] font-mono text-white/60">{numero}</div>
                            </div>
                            <div className="bg-white p-1 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                <QrCode className="h-7 w-7 text-black" />
                            </div>
                        </div>
                    </div>

                    {/* Holographic "Security" Thread */}
                    <div className="absolute top-1/2 -right-4 w-12 h-[200%] bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-y-1/2 rotate-12 pointer-events-none group-hover:translate-x-[-150%] transition-transform duration-1000"></div>
                </div>

                {/* Actions Bar */}
                <div className="p-3 flex gap-2 bg-slate-50 border-t border-slate-100">
                    <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 text-[11px] h-9 shadow-lg shadow-primary/20"
                        onClick={() => window.open(pdfUrl, '_blank')}
                    >
                        <Download className="h-3.5 w-3.5 mr-2" />
                        Ver Certificado
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="px-3 h-9 border-slate-200"
                        title="Compartir"
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: `Credencial VMP - ${curso.nombre}`,
                                    text: `Certificación oficial de ${alumno?.nombre} ${alumno?.apellido}`,
                                    url: window.location.origin + pdfUrl
                                });
                            }
                        }}
                    >
                        <Share2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </Card>
        </motion.div>
    );
}
