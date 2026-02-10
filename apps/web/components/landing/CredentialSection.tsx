import React from 'react';
import { CreditCard, QrCode, Shield, Calendar, User, Building } from 'lucide-react';

export function CredentialSection() {
    return (
        <section id="credencial" className="py-20 bg-gradient-to-b from-background-light to-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Visual de la credencial */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary-light/30 rounded-3xl blur-3xl group-hover:blur-[120px] transition-all duration-700 opacity-50"></div>
                        <div className="relative">
                            {/* Mock de credencial - Estética Premium */}
                            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-10 border border-white/50 ring-1 ring-black/[0.03]">
                                <div className="aspect-[1.6/1] bg-[#0A0A0B] rounded-[1.5rem] p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl">
                                    {/* Glassmorphism overlays */}
                                    <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[80px]"></div>
                                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-light/10 rounded-full blur-[60px]"></div>

                                    {/* Micro-mesh pattern */}
                                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>

                                    {/* Header */}
                                    <div className="relative flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center font-black text-[10px]">V</div>
                                                <span className="text-[10px] font-black tracking-[0.2em] text-white/90">VMP - EDTECH</span>
                                            </div>
                                            <div className="text-[8px] uppercase tracking-widest text-white/40 font-medium">Credencial de Competencia Profesional</div>
                                        </div>
                                        <div className="h-10 w-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center">
                                            <Shield className="h-5 w-5 text-primary-light" />
                                        </div>
                                    </div>

                                    {/* User Info */}
                                    <div className="relative space-y-4">
                                        <div>
                                            <div className="text-[8px] uppercase tracking-widest text-white/30 mb-1">Titular</div>
                                            <div className="text-2xl font-bold tracking-tight">JUAN PÉREZ</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-[8px] uppercase tracking-widest text-white/30 mb-0.5">DNI</div>
                                                <div className="text-xs font-mono text-white/80">12.345.678</div>
                                            </div>
                                            <div>
                                                <div className="text-[8px] uppercase tracking-widest text-white/30 mb-0.5">Credencial ID</div>
                                                <div className="text-xs font-mono text-white/80">VMP-2026-00123</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="relative flex justify-between items-end border-t border-white/5 pt-4">
                                        <div className="space-y-1">
                                            <div className="text-[8px] uppercase tracking-widest text-white/30">Curso Certificado</div>
                                            <div className="text-xs font-bold text-primary-light">SEGURIDAD INDUSTRIAL E HIGIENE</div>
                                            <div className="flex gap-4 mt-2">
                                                <div className="text-[7px] text-white/40">EMISIÓN <span className="text-white/70 ml-1">15/01/26</span></div>
                                                <div className="text-[7px] text-white/40">VENCE <span className="text-yellow-500 font-bold ml-1">15/01/28</span></div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-2 rounded-xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                            <QrCode className="h-8 w-8 text-black" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                Estándar Internacional
                            </div>

                            <h2 className="text-4xl sm:text-6xl font-black text-slate-900 leading-[1.1] tracking-tighter">
                                Tu validación <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light italic">profesional</span> instantánea.
                            </h2>

                            <p className="text-lg text-slate-800 font-medium leading-relaxed max-w-lg">
                                Al finalizar tu capacitación, entregamos una credencial digital diseñada para el mundo real: segura, estética y verificable en segundos por cualquier contratista.
                            </p>
                        </div>

                        {/* Feature Grid */}
                        <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
                            <div className="group">
                                <div className="mb-4 w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:scale-110 group-hover:rotate-6">
                                    <Shield className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-2">Seguridad Criptográfica</h3>
                                <p className="text-xs text-slate-700 leading-relaxed font-medium">Cada credencial cuenta con una firma única e inalterable vinculada a tu DNI.</p>
                            </div>

                            <div className="group">
                                <div className="mb-4 w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:scale-110 group-hover:rotate-6">
                                    <QrCode className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-2">Acceso Instantáneo</h3>
                                <p className="text-xs text-slate-700 leading-relaxed font-medium">Escanea el código QR para ver el historial de cursada y validez del certificado.</p>
                            </div>

                            <div className="group">
                                <div className="mb-4 w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:scale-110 group-hover:rotate-6">
                                    <CreditCard className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-2">Ecosistema Digital</h3>
                                <p className="text-xs text-slate-700 leading-relaxed font-medium">Lleva tu certificación en el móvil, lista para ser presentada en cualquier portal de ingreso.</p>
                            </div>

                            <div className="group">
                                <div className="mb-4 w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:scale-110 group-hover:rotate-6">
                                    <Building className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-2">Validez Industrial</h3>
                                <p className="text-xs text-slate-700 leading-relaxed font-medium">Aceptada por las principales operadoras logísticas e industriales del país.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
