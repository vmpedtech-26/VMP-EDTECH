import React from 'react';
import { CreditCard, QrCode, Shield, Calendar, User, Building } from 'lucide-react';

export function CredentialSection() {
    return (
        <section id="validar" className="py-20 bg-gradient-to-b from-background-light to-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Visual de la credencial */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary-light/30 rounded-3xl blur-3xl group-hover:blur-[120px] transition-all duration-700 opacity-50"></div>
                        <div className="relative">
                            {/* Credencial Estilo VMP EdTech 2026 */}
                            <div className="bg-white rounded-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden border border-slate-100 max-w-[650px] mx-auto transform hover:scale-[1.02] transition-all duration-500">
                                {/* Header del Carnet */}
                                <div className="bg-[#0A1120] px-8 py-5 flex justify-between items-center border-b-[3px] border-cyan-400">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-cyan-400 rounded-lg flex items-center justify-center font-black text-xl text-[#0A1120]">V</div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center text-white text-xl font-bold tracking-tight">
                                                <span>VMP</span>
                                                <span className="mx-2 text-slate-500">|</span>
                                                <span className="text-cyan-400">EDTECH</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1">Credencial Válida</div>
                                        <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Capacitación Conducción Preventiva</div>
                                    </div>
                                </div>

                                {/* Cuerpo del Carnet */}
                                <div className="p-8 flex gap-8 bg-white relative">
                                    {/* Marca de agua de fondo */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                                        <span className="text-[120px] font-black rotate-[-15deg]">VMP</span>
                                    </div>

                                    {/* Columna Izquierda: Datos */}
                                    <div className="flex-grow space-y-5 relative z-10">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="border-b border-slate-400 pb-1">
                                                <div className="text-[9px] font-black text-cyan-600 uppercase mb-1">Apellido</div>
                                                <div className="text-xl font-bold text-slate-900 uppercase">RODRÍGUEZ</div>
                                            </div>
                                            <div className="border-b border-slate-400 pb-1">
                                                <div className="text-[9px] font-black text-cyan-600 uppercase mb-1">Nombre</div>
                                                <div className="text-xl font-bold text-slate-900 uppercase">CARLOS</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="border-b border-slate-400 pb-1">
                                                <div className="text-[9px] font-black text-cyan-600 uppercase mb-1">DNI / PSP</div>
                                                <div className="text-xl font-bold text-slate-900">28.456.789</div>
                                            </div>
                                            <div className="border-b border-slate-400 pb-1">
                                                <div className="text-[9px] font-black text-cyan-600 uppercase mb-1">Puesto</div>
                                                <div className="text-xl font-bold text-slate-900">Conductor Profesional</div>
                                            </div>
                                        </div>

                                        <div className="border-b border-slate-400 pb-1">
                                            <div className="text-[9px] font-black text-cyan-600 uppercase mb-1">Empresa</div>
                                            <div className="text-xl font-bold text-slate-900">Logística del Sur S.A.</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="border-b border-slate-400 pb-1">
                                                <div className="text-[9px] font-black text-cyan-600 uppercase mb-1">Fecha de Emisión</div>
                                                <div className="text-lg font-bold text-slate-900">30/03/2026</div>
                                            </div>
                                            <div className="border-b border-slate-400 pb-1">
                                                <div className="text-[9px] font-black text-cyan-600 uppercase mb-1">Vto.</div>
                                                <div className="text-lg font-bold text-slate-900">30/03/2027</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Columna Derecha: Foto y Firma */}
                                    <div className="w-[180px] flex flex-col justify-between relative z-10">
                                        {/* Foto Perfil */}
                                        <div className="relative group/photo">
                                            <div className="absolute -inset-1 bg-cyan-400 rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                            <div className="relative aspect-[4/5] bg-slate-100 rounded-xl overflow-hidden border-2 border-cyan-400">
                                                <img 
                                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=500&auto=format&fit=crop" 
                                                    alt="Avatar Profesional"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>

                                        {/* Espacio Firma Instructor */}
                                        <div className="mt-8 text-center">
                                            <div className="h-[2px] bg-slate-400 w-full mb-4"></div>
                                            <div className="space-y-1 h-12">
                                                {/* Dejado en blanco por solicitud del usuario */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Bottom Accent */}
                                <div className="h-6 bg-[#0A1120]"></div>
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
