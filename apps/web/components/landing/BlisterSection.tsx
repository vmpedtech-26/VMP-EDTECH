import { CreditCard, QrCode, Shield, Calendar, User, Building } from 'lucide-react';

export function BlisterSection() {
    return (
        <section id="blister" className="py-20 bg-gradient-to-b from-background-light to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Visual de la credencial */}
                    <div className="relative">
                    {/* Visual de la credencial */}
                    <div className="relative group perspective-[2000px] w-full max-w-lg mx-auto">
                        {/* Glow Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#5EEAD4]/20 to-[#2D9E93]/20 rounded-3xl blur-[80px] group-hover:blur-[100px] transition-all duration-700 opacity-60"></div>
                        
                        <div className="relative transform-gpu transition-transform duration-700 ease-out group-hover:rotate-x-12 group-hover:rotate-y-[-10deg] group-hover:scale-105">
                            {/* FRONT OF CARD */}
                            <div className="bg-white rounded-[16px] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-white/40 ring-1 ring-black/5 relative aspect-[1.58/1]">
                                {/* Franja Superior */}
                                <div className="h-[20%] bg-[#121626] w-full relative flex items-center justify-between px-5 z-20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-[#5EEAD4] rounded-[0.2rem] flex items-center justify-center font-bold text-[#121626] text-xl">
                                            V
                                        </div>
                                        <div className="font-heading font-bold text-white text-2xl tracking-wide flex items-center">
                                            VMP <span className="text-slate-600 mx-2 text-xl font-normal">|</span> <span className="text-[#5EEAD4]">EDTECH</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col justify-center">
                                        <div className="text-white font-bold text-[8px] tracking-[0.15em]">CREDENCIAL VÁLIDA</div>
                                        <div className="text-[#5EEAD4] font-bold text-[7px] tracking-[0.05em] mt-0.5">CAPACITACIÓN CONDUCCIÓN PREVENTIVA</div>
                                    </div>
                                </div>
                                <div className="h-1.5 bg-[#5EEAD4] w-full relative z-20"></div>

                                {/* Contenido (WHITE) */}
                                <div className="absolute top-[20%] bottom-[12%] left-0 right-0 bg-[#FAFAFA] flex z-10">
                                    {/* Watermark Logo */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden pb-8 pl-10">
                                        <span className="font-heading font-black text-[180px] text-[#2D9E93] leading-none transform -rotate-12 select-none">VMP</span>
                                    </div>

                                    {/* Barra decorativa izquierda */}
                                    <div className="w-1.5 h-full bg-[#5EEAD4] flex-shrink-0"></div>

                                    <div className="flex-1 p-5 lg:p-6 flex gap-6 relative z-10">
                                        {/* Datos Personales */}
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                                                <div className="border-b border-slate-300 pb-1">
                                                    <div className="text-[#2D9E93] font-black text-[7px] tracking-wider mb-1">APELLIDO</div>
                                                    <div className="text-[#121626] font-black text-lg sm:text-xl leading-none">PEREZ</div>
                                                </div>
                                                <div className="border-b border-slate-300 pb-1">
                                                    <div className="text-[#2D9E93] font-black text-[7px] tracking-wider mb-1">NOMBRE</div>
                                                    <div className="text-[#121626] font-black text-lg sm:text-xl leading-none">JUAN PABLO</div>
                                                </div>
                                                
                                                <div className="border-b border-slate-300 pb-1">
                                                    <div className="text-[#2D9E93] font-black text-[7px] tracking-wider mb-1">DNI / PSP</div>
                                                    <div className="text-[#121626] font-bold text-sm">12345678</div>
                                                </div>
                                                <div className="border-b border-slate-300 pb-1">
                                                    <div className="text-[#2D9E93] font-black text-[7px] tracking-wider mb-1">PUESTO</div>
                                                    <div className="text-[#121626] font-bold text-sm">Conductor</div>
                                                </div>
                                                
                                                <div className="col-span-2 border-b border-slate-300 pb-1">
                                                    <div className="text-[#2D9E93] font-black text-[7px] tracking-wider mb-1">EMPRESA</div>
                                                    <div className="text-[#121626] font-bold text-sm">Logística Integral S.A.</div>
                                                </div>
                                                
                                                <div className="border-b border-slate-300 pb-1 mt-2">
                                                    <div className="text-[#2D9E93] font-black text-[7px] tracking-wider mb-1">FECHA DE EMISIÓN</div>
                                                    <div className="text-[#121626] font-bold text-sm">05/03/2026</div>
                                                </div>
                                                <div className="border-b border-slate-300 pb-1 mt-2">
                                                    <div className="text-[#2D9E93] font-black text-[7px] tracking-wider mb-1">VTO.</div>
                                                    <div className="text-[#121626] font-bold text-sm">05/03/2027</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Foto y Firma */}
                                        <div className="w-[120px] flex flex-col justify-between pt-1">
                                            <div className="w-full aspect-[3/3.8] rounded-xl overflow-hidden border-[2px] border-[#2D9E93] shadow-md bg-slate-200">
                                                <img src="https://ui-avatars.com/api/?name=Juan+Perez&background=94A3B8&color=fff&size=200" alt="Foto Demo" className="w-full h-full object-cover" />
                                            </div>

                                            <div className="flex flex-col items-center mt-auto">
                                                <div className="w-[90%] h-12 border-b-[1.5px] border-[#121626] relative flex justify-center items-end pb-1">
                                                    {/* Fake Signature */}
                                                    <svg className="w-16 h-8 absolute -top-1 opacity-80" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M10 25C20 15 30 5 40 10C50 15 35 35 50 30C65 25 75 5 80 15C85 25 90 35 95 30" stroke="#121626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M30 35C45 25 55 10 45 20C35 30 25 25 35 15" stroke="#121626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                    <span className="font-serif font-semibold text-[#121626] text-[8px] z-10 bg-[#FAFAFA] px-1 translate-y-2">Matias Orejas</span>
                                                </div>
                                                <div className="text-[5px] text-[#121626] font-bold mt-2">Instructor VMP | Mat. N° 2206825</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="absolute bottom-0 left-0 right-0 h-[12%] bg-[#121626] z-20"></div>
                            </div>
                            
                            {/* Reflection effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-[1.5s] ease-in-out transform -skew-x-12 pointer-events-none"></div>
                        </div>
                    </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        <div className="inline-block">
                            <span className="bg-success/10 text-success px-4 py-2 rounded-full text-sm font-semibold">
                                Sistema de Certificación Oficial
                            </span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                            Credencial Digital <span className="text-primary">Blister</span>
                        </h2>

                        <p className="text-lg text-slate-800 leading-relaxed">
                            Al completar exitosamente un curso, nuestro sistema genera
                            automáticamente una credencial profesional en formato compacto
                            tipo ID card, verificable por código QR.
                        </p>

                        {/* Características del Blister */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex items-start space-x-3">
                                <CreditCard className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <div className="font-semibold text-slate-900">
                                        Formato ID Card
                                    </div>
                                    <div className="text-sm text-slate-800">
                                        85.60 × 53.98 mm estándar
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <User className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <div className="font-semibold text-slate-900">
                                        Datos del Alumno
                                    </div>
                                    <div className="text-sm text-slate-800">DNI, nombre, foto</div>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Building className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <div className="font-semibold text-slate-900">
                                        Info del Curso
                                    </div>
                                    <div className="text-sm text-slate-800">
                                        Nombre y código oficial
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <div className="font-semibold text-slate-900">Vigencia</div>
                                    <div className="text-sm text-slate-800">
                                        Fechas de emisión y vencimiento
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <QrCode className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <div className="font-semibold text-slate-900">
                                        Código QR
                                    </div>
                                    <div className="text-sm text-slate-800">
                                        Verificación pública online
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <div className="font-semibold text-slate-900">
                                        Número Único
                                    </div>
                                    <div className="text-sm text-slate-800">
                                        Formato VMP-2026-XXXXX
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
