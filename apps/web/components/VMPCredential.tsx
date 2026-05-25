'use client';

import React from 'react';
import { Award, ShieldCheck, Calendar, User, BookOpen } from 'lucide-react';
import Image from 'next/image';

interface VMPCredentialProps {
    alumno: {
        nombre_completo: string;
        dni: string;
    };
    curso: {
        nombre: string;
        fecha_vencimiento: string;
    };
    nota: number;
    qrCode: string;
}

export default function VMPCredential({ alumno, curso, nota, qrCode }: VMPCredentialProps) {
    return (
        <div className="bg-[#0A1120] text-white rounded-3xl shadow-[0_45px_100px_-25px_rgba(0,0,0,0.4)] overflow-hidden border-2 border-slate-800/80 w-[420px] max-w-full font-sans transition-all duration-500 hover:shadow-cyan-500/10 group">
            {/* Header del Carnet */}
            <div className="bg-[#0B1528] px-6 py-4 flex justify-between items-center border-b-2 border-cyan-500/80">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center font-black text-lg text-[#0A1120] shadow-md shadow-cyan-500/20">V</div>
                    <div className="flex flex-col">
                        <div className="text-sm font-bold tracking-tight text-white flex items-center">
                            VMP <span className="mx-1 text-slate-600">|</span> <span className="text-cyan-400">EDTECH</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em]">Credencial Certificada</div>
                    <div className="text-[7px] text-slate-400 uppercase font-semibold">ISO 39001 - Seguridad Vial</div>
                </div>
            </div>

            {/* Cuerpo del Carnet */}
            <div className="p-6 relative bg-gradient-to-b from-[#0C1629] to-[#080E1C] overflow-hidden">
                {/* Micro-animación de Fondo */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.06),transparent_60%)] pointer-events-none" />
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />

                <div className="flex gap-4 items-start relative z-10">
                    {/* Foto y Nota */}
                    <div className="flex flex-col items-center gap-3 shrink-0">
                        <div className="relative w-28 aspect-[3/4] bg-slate-900 rounded-xl overflow-hidden border border-slate-700/60 shadow-inner">
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-slate-600">
                                <User className="h-10 w-10 text-cyan-500/20" />
                            </div>
                            <Image 
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&h=530&auto=format&fit=crop" 
                                alt="Foto Operador"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        
                        {/* Score Badge */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full text-[10px] font-bold shadow-sm">
                            <Award className="h-3 w-3" />
                            Calificación: {nota}%
                        </div>
                    </div>

                    {/* Datos del Alumno y Curso */}
                    <div className="flex-grow space-y-4">
                        <div>
                            <div className="text-[8px] font-black text-cyan-500 uppercase tracking-widest mb-0.5">Operador</div>
                            <div className="text-base font-bold text-slate-100 uppercase tracking-tight line-clamp-1">{alumno.nombre_completo}</div>
                            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">DNI: {alumno.dni}</div>
                        </div>

                        <div>
                            <div className="text-[8px] font-black text-cyan-500 uppercase tracking-widest mb-0.5">Programa Oficial</div>
                            <div className="text-xs font-bold text-slate-200 uppercase leading-snug line-clamp-2">{curso.nombre}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                            <div>
                                <div className="text-[7px] font-black text-cyan-500 uppercase tracking-wider mb-0.5">Estatus</div>
                                <div className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    Aprobado
                                </div>
                            </div>
                            <div>
                                <div className="text-[7px] font-black text-cyan-500 uppercase tracking-wider mb-0.5">Vencimiento</div>
                                <div className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-slate-400" />
                                    {new Date(curso.fecha_vencimiento).toLocaleDateString('es-AR', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* QR y Firmas del pie */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex justify-between items-center relative z-10">
                    <div className="text-left">
                        <div className="text-[7px] font-black text-slate-500 uppercase tracking-wider">Firma Digital</div>
                        <div className="text-[8px] font-mono text-cyan-500/80 mt-1 uppercase tracking-tighter">VMP-SIG-VERIFIED</div>
                    </div>

                    {/* QR Code Container */}
                    <div className="w-10 h-10 bg-white rounded-lg p-0.5 shadow-md flex items-center justify-center shrink-0 border border-cyan-400/20 group-hover:scale-105 transition-transform duration-300">
                        {/* QR Placeholder SVG */}
                        <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100">
                            <rect x="0" y="0" width="20" height="20" fill="currentColor"/>
                            <rect x="0" y="80" width="20" height="20" fill="currentColor"/>
                            <rect x="80" y="0" width="20" height="20" fill="currentColor"/>
                            <rect x="30" y="30" width="10" height="10" fill="currentColor"/>
                            <rect x="50" y="40" width="20" height="10" fill="currentColor"/>
                            <rect x="40" y="60" width="10" height="30" fill="currentColor"/>
                            <rect x="70" y="70" width="20" height="20" fill="currentColor"/>
                            <rect x="40" y="10" width="30" height="10" fill="currentColor"/>
                            <rect x="10" y="40" width="10" height="30" fill="currentColor"/>
                            <rect x="80" y="40" width="10" height="20" fill="currentColor"/>
                        </svg>
                    </div>
                </div>
            </div>
            
            {/* Pie Decorativo */}
            <div className="h-2.5 bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-600"></div>
        </div>
    );
}
