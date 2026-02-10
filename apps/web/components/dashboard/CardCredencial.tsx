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
    const { curso, numero, fechaEmision, fechaVencimiento, pdfUrl } = credencial;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="group"
        >
            <Card className="p-0 overflow-hidden border-none shadow-xl bg-white group-hover:shadow-2xl transition-all duration-300">
                {/* Visual Card (ID Style) */}
                <div className="relative aspect-[1.6/1] w-full bg-[#0A0A0B] p-6 text-white overflow-hidden flex flex-col justify-between">
                    {/* Decorative Elements */}
                    <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[60px] pointer-events-none"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-light/10 rounded-full blur-[40px] pointer-events-none"></div>
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>

                    {/* Header */}
                    <div className="relative flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center font-black text-[10px]">V</div>
                            <span className="text-[10px] font-black tracking-[0.2em] text-white/90">VMP - EDTECH</span>
                        </div>
                        <Shield className="h-5 w-5 text-primary-light opacity-50" />
                    </div>

                    {/* Content */}
                    <div className="relative space-y-1">
                        <div className="text-[10px] uppercase tracking-widest text-white/40 font-medium">Credencial Profesional</div>
                        <h4 className="text-sm font-bold truncate leading-tight">{curso.nombre}</h4>
                        <div className="text-[9px] font-mono text-primary-light/80">{numero}</div>
                    </div>

                    {/* Footer */}
                    <div className="relative flex justify-between items-end border-t border-white/5 pt-3">
                        <div className="space-y-1">
                            <div className="flex gap-3">
                                <div>
                                    <div className="text-[7px] uppercase tracking-widest text-white/30">EMISIÓN</div>
                                    <div className="text-[8px] font-medium">{new Date(fechaEmision).toLocaleDateString()}</div>
                                </div>
                                {fechaVencimiento && (
                                    <div>
                                        <div className="text-[7px] uppercase tracking-widest text-white/30">VENCE</div>
                                        <div className="text-[8px] font-medium text-yellow-500">{new Date(fechaVencimiento).toLocaleDateString()}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-white p-1 rounded-md">
                            <QrCode className="h-6 w-6 text-black" />
                        </div>
                    </div>

                    {/* Holographic Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none skew-x-12 translate-x-full group-hover:-translate-x-full transform"></div>
                </div>

                {/* Actions */}
                <div className="p-4 grid grid-cols-2 gap-2 bg-slate-50/50">
                    <Button
                        variant="primary"
                        size="sm"
                        className="w-full text-[11px]"
                        onClick={() => window.open(pdfUrl, '_blank')}
                    >
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Descargar PDF
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-[11px]"
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: `Credencial VMP - ${curso.nombre}`,
                                    url: window.location.origin + pdfUrl
                                });
                            }
                        }}
                    >
                        <Share2 className="h-3.5 w-3.5 mr-1.5" />
                        Compartir
                    </Button>
                </div>
            </Card>
        </motion.div>
    );
}
