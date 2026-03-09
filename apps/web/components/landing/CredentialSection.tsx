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
                            {/* Mock de credencial - Estética Premium */}
                            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-10 border border-white/50 ring-1 ring-black/[0.03]">
                                <div className="aspect-[1.58/1] bg-white rounded-[1.2rem] shadow-2xl relative overflow-hidden flex flex-col border border-slate-200">
                                    {/* Franja Superior */}
                                    <div className="h-[20%] bg-slate-900 w-full relative flex items-center justify-between px-4 sm:px-6 z-10">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#5EEAD4] rounded-lg flex items-center justify-center font-black text-slate-900 text-lg sm:text-xl">V</div>
                                            <div className="font-heading font-bold text-white text-base sm:text-xl tracking-wide flex items-center">
                                                VMP <span className="text-slate-500 mx-1.5 sm:mx-2 text-xs sm:text-sm font-normal">|</span> <span className="text-[#5EEAD4]">EDTECH</span>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col justify-center">
                                            <div className="text-white font-bold text-[7px] sm:text-[9px] tracking-widest whitespace-nowrap">CREDENCIAL VÁLIDA</div>
                                            <div className="text-[#5EEAD4] font-bold text-[6px] sm:text-[7px] tracking-widest whitespace-nowrap mt-0.5">CAPACITACIÓN CONDUCCIÓN PREVENTIVA</div>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-[#5EEAD4] w-full z-10"></div>

                                    {/* Contenido (WHITE) */}
                                    <div className="flex-1 bg-white relative p-4 sm:p-6 flex">
                                        {/* Barra decorativa izquierda */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 sm:w-2 flex">
                                            <div className="w-[70%] h-full bg-[#5EEAD4]"></div>
                                            <div className="flex-1 h-full bg-slate-900"></div>
                                        </div>

                                        {/* Columnas de datos */}
                                        <div className="ml-3 sm:ml-4 flex-1 flex flex-col justify-center">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="space-y-2 sm:space-y-3 flex-1">
                                                    <div className="flex gap-6 sm:gap-8">
                                                        <div className="flex-1">
                                                            <div className="text-[#2D9E93] font-bold text-[6px] sm:text-[8px] tracking-wider mb-0.5 border-b border-slate-300 pb-0.5">APELLIDO</div>
                                                            <div className="text-slate-900 font-bold text-sm sm:text-lg leading-none mt-1">PÉREZ</div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-[#2D9E93] font-bold text-[6px] sm:text-[8px] tracking-wider mb-0.5 border-b border-slate-300 pb-0.5">NOMBRE</div>
                                                            <div className="text-slate-900 font-bold text-sm sm:text-lg leading-none mt-1">JUAN</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-6 sm:gap-8">
                                                        <div className="flex-1">
                                                            <div className="text-[#2D9E93] font-bold text-[6px] sm:text-[8px] tracking-wider mb-0.5 border-b border-slate-300 pb-0.5">DNI / PSP</div>
                                                            <div className="text-slate-900 font-bold text-xs sm:text-sm mt-1">12.345.678</div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-[#2D9E93] font-bold text-[6px] sm:text-[8px] tracking-wider mb-0.5 border-b border-slate-300 pb-0.5">PUESTO</div>
                                                            <div className="text-slate-900 font-bold text-xs sm:text-sm mt-1">Conductor</div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="text-[#2D9E93] font-bold text-[6px] sm:text-[8px] tracking-wider mb-0.5 border-b border-slate-300 pb-0.5 w-[70%]">EMPRESA</div>
                                                        <div className="text-slate-900 font-bold text-xs sm:text-sm mt-1">Servicios Petroleros S.A.</div>
                                                    </div>

                                                    <div className="flex gap-6 sm:gap-8 border-t border-slate-100 pt-1 mt-1 sm:mt-2">
                                                        <div className="flex-1">
                                                            <div className="text-[#2D9E93] font-bold text-[6px] sm:text-[8px] tracking-wider mb-0.5 border-b border-slate-300 pb-0.5">FECHA DE EMISIÓN</div>
                                                            <div className="text-slate-900 font-bold text-xs sm:text-sm mt-1">15/01/26</div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-[#2D9E93] font-bold text-[6px] sm:text-[8px] tracking-wider mb-0.5 border-b border-slate-300 pb-0.5">VTO.</div>
                                                            <div className="text-slate-900 font-bold text-xs sm:text-sm mt-1">15/01/28</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Foto y Firma */}
                                                <div className="w-[28%] sm:w-[25%] flex flex-col items-center shrink-0">
                                                    <div className="w-full aspect-[3/3.2] rounded-lg overflow-hidden border-[1.5px] border-[#2D9E93] bg-slate-200">
                                                        <img src="https://ui-avatars.com/api/?name=Juan+Perez&background=94A3B8&color=fff&size=200" alt="Foto" className="w-full h-full object-cover" />
                                                    </div>

                                                    <div className="mt-3 sm:mt-4 w-full h-6 sm:h-8 border-b border-slate-400 flex flex-col justify-end items-center relative">
                                                        <span className="font-serif italic text-slate-800 text-[10px] sm:text-sm absolute -bottom-1">Pedro Orejas</span>
                                                    </div>
                                                    <div className="text-[5px] sm:text-[6px] text-slate-500 font-bold uppercase mt-1">Instructor VMP</div>
                                                    <div className="text-[4px] sm:text-[5px] text-slate-400 font-bold uppercase mt-[1px]">Mat. N° 2206825</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="h-1.5 bg-[#5EEAD4] w-full z-10"></div>
                                    <div className="h-[12%] bg-slate-900 w-full flex justify-between items-center px-4 sm:px-6 relative z-10">
                                        <div className="flex items-center gap-2">
                                            {/* YPF Mock Logo */}
                                            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-[#00326F] rotate-45 flex items-center justify-center border-[0.5px] border-[#F6B40E]">
                                                <span className="text-white text-[5px] sm:text-[6px] font-bold -rotate-45">YPF</span>
                                            </div>
                                        </div>
                                        <div className="bg-white p-1 sm:p-1.5 rounded-md sm:rounded-lg shadow-lg absolute -top-4 sm:-top-6 right-4 sm:right-6 rotate-3 hover:rotate-0 transition-transform duration-300 border border-slate-200">
                                            <QrCode className="w-8 h-8 sm:w-10 sm:h-10 text-black hidden sm:block" />
                                            <QrCode className="w-6 h-6 text-black sm:hidden" />
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
