import { CreditCard, QrCode, Shield, Calendar, User, Building } from 'lucide-react';

export function BlisterSection() {
    return (
        <section id="blister" className="py-20 bg-gradient-to-b from-background-light to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Visual de la credencial */}
                    <div className="relative group perspective-[2000px] w-full max-w-lg mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary-light/30 rounded-3xl blur-3xl group-hover:blur-[120px] transition-all duration-700 opacity-50"></div>
                        <div className="relative transform-gpu transition-transform duration-700 ease-out group-hover:rotate-x-12 group-hover:rotate-y-[-10deg] group-hover:scale-105">
                            {/* Mock de credencial - Diseño Pixel Perfect */}
                            <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] p-4 sm:p-8 border border-white/50 ring-1 ring-black/[0.03]">
                                <div className="w-full aspect-[1.58/1] bg-white rounded-2xl shadow-2xl relative flex flex-col overflow-hidden font-sans border border-slate-200">
                                    
                                    {/* Header Block */}
                                    <div className="h-[20%] bg-[#0f172a] w-full flex items-center justify-between px-4 sm:px-6 z-20">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#5EEAD4] rounded-lg flex items-center justify-center font-black text-[#0f172a] text-xl sm:text-2xl">
                                                V
                                            </div>
                                            <div className="font-heading font-bold text-white tracking-wide flex items-center text-lg sm:text-[1.4rem]">
                                                VMP <span className="text-slate-600 mx-1.5 sm:mx-2 text-base sm:text-lg font-light">|</span> <span className="text-[#5EEAD4]">EDTECH</span>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col justify-center">
                                            <div className="text-white font-bold text-[7px] sm:text-[9.5px] tracking-[0.15em] uppercase">CREDENCIAL VÁLIDA</div>
                                            <div className="text-[#5EEAD4] font-bold text-[5.5px] sm:text-[7.5px] tracking-[0.05em] mt-1 uppercase">CAPACITACIÓN CONDUCCIÓN PREVENTIVA</div>
                                        </div>
                                    </div>

                                    {/* Separator */}
                                    <div className="h-1.5 sm:h-2 bg-[#5EEAD4] w-full relative z-20"></div>

                                    {/* Body Area */}
                                    <div className="flex-1 bg-white relative flex pt-3 sm:pt-4 pb-2">
                                        {/* Left Top-to-Bottom Line */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 sm:w-[6px] bg-[#5EEAD4]"></div>

                                        <div className="pl-6 sm:pl-8 pr-4 sm:pr-8 h-full w-full flex gap-3 sm:gap-5 relative z-10">
                                            {/* Data Grid */}
                                            <div className="flex-1 flex flex-col justify-between pb-2 sm:pb-4">
                                                {/* Row 1 */}
                                                <div className="flex gap-4 sm:gap-6 w-full">
                                                    <div className="flex-1 border-b border-slate-300 pb-1">
                                                        <div className="text-[#2D9E93] font-bold text-[7px] sm:text-[9.5px] tracking-widest mb-1">APELLIDO</div>
                                                        <div className="text-[#0f172a] font-bold text-lg sm:text-2xl leading-none">PÉREZ</div>
                                                    </div>
                                                    <div className="flex-1 border-b border-slate-300 pb-1">
                                                        <div className="text-[#2D9E93] font-bold text-[7px] sm:text-[9.5px] tracking-widest mb-1">NOMBRE</div>
                                                        <div className="text-[#0f172a] font-bold text-lg sm:text-2xl leading-none">JUAN</div>
                                                    </div>
                                                </div>

                                                {/* Row 2 */}
                                                <div className="flex gap-4 sm:gap-6 w-full">
                                                    <div className="flex-1 border-b border-slate-300 pb-1">
                                                        <div className="text-[#2D9E93] font-bold text-[7px] sm:text-[9.5px] tracking-widest mb-1">DNI / PSP</div>
                                                        <div className="text-[#0f172a] font-bold text-[13px] sm:text-[18px] leading-none">12.345.678</div>
                                                    </div>
                                                    <div className="flex-1 border-b border-slate-300 pb-1">
                                                        <div className="text-[#2D9E93] font-bold text-[7px] sm:text-[9.5px] tracking-widest mb-1">PUESTO</div>
                                                        <div className="text-[#0f172a] font-bold text-[13px] sm:text-[18px] leading-none">Conductor</div>
                                                    </div>
                                                </div>

                                                {/* Row 3 */}
                                                <div className="w-[90%] sm:w-[85%] border-b border-slate-300 pb-1">
                                                    <div className="text-[#2D9E93] font-bold text-[7px] sm:text-[9.5px] tracking-widest mb-1">EMPRESA</div>
                                                    <div className="text-[#0f172a] font-bold text-[13px] sm:text-[18px] leading-none">Servicios Petroleros S.A.</div>
                                                </div>

                                                {/* Row 4 */}
                                                <div className="flex gap-4 sm:gap-6 w-full">
                                                    <div className="flex-1 border-b border-slate-300 pb-1">
                                                        <div className="text-[#2D9E93] font-bold text-[7px] sm:text-[9.5px] tracking-widest mb-1">FECHA DE EMISIÓN</div>
                                                        <div className="text-[#0f172a] font-bold text-[13px] sm:text-[18px] leading-none">15/01/26</div>
                                                    </div>
                                                    <div className="flex-1 border-b border-slate-300 pb-1">
                                                        <div className="text-[#2D9E93] font-bold text-[7px] sm:text-[9.5px] tracking-widest mb-1">VTO.</div>
                                                        <div className="text-[#0f172a] font-bold text-[13px] sm:text-[18px] leading-none">15/01/28</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Photo & Signature */}
                                            <div className="w-[85px] sm:w-[125px] shrink-0 flex flex-col pr-1">
                                                <div className="w-full aspect-[0.98/1] bg-[#94A3B8] rounded-[10px] sm:rounded-xl border-[2px] sm:border-[3px] shadow-sm flex items-center justify-center text-white font-medium text-4xl sm:text-6xl mt-1 tracking-tighter" style={{borderColor: '#5bb8b1'}}>
                                                    JP
                                                </div>

                                                <div className="flex flex-col items-center mt-auto pb-1.5 sm:pb-3 w-[100%] mx-auto relative group-hover:translate-x-0">
                                                    <div className="border-b-[1.2px] border-slate-400 w-[110%] relative h-[28px] sm:h-[40px] flex items-end justify-center pb-0.5 sm:pb-1">
                                                        <span className="font-serif italic text-slate-800 text-[12px] sm:text-[17px] whitespace-nowrap mb-0.5">Pedro Orejas</span>
                                                    </div>
                                                    <div className="text-[#0f172a] font-black text-[5px] sm:text-[7px] tracking-[0.05em] uppercase mt-1.5 sm:mt-2">Instructor VMP</div>
                                                    <div className="text-[#94a3b8] font-bold text-[4.5px] sm:text-[6px] tracking-[0.05em] uppercase mt-0.5">Mat. N° 2206825</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Area */}
                                    <div className="h-[12%] sm:h-[11%] bg-[#0f172a] w-full relative z-20">
                                        {/* YPF Logo overlapping */}
                                        <div className="absolute left-[24px] sm:left-[36px] -top-[12px] sm:-top-[15px]">
                                            <div className="w-6 h-6 sm:w-[30px] sm:h-[30px] bg-[#00326F] flex items-center justify-center rotate-45 border-[0.5px] border-[#F6B40E] shadow-sm">
                                                <span className="text-white text-[5px] sm:text-[6px] font-black -rotate-45 block transform scale-110">YPF</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* QR Floating Block */}
                                    <div className="absolute right-4 sm:right-6 -bottom-1 transform -translate-y-[8%] sm:-translate-y-[10%] bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-xl p-2 sm:p-2.5 z-30 flex items-center justify-center">
                                        <div className="grid grid-cols-2 gap-0.5 sm:gap-1 text-[#0f172a] w-5 h-5 sm:w-8 sm:h-8 p-0.5 sm:p-1">
                                            <div className="border-[1.5px] sm:border-2 border-current rounded-[3px] sm:rounded-md flex items-center justify-center p-[1px]"><div className="bg-current w-full h-full rounded-sm"></div></div>
                                            <div className="border-[1.5px] sm:border-2 border-current rounded-[3px] sm:rounded-md flex items-center justify-center p-[1px]"><div className="bg-current w-full h-full rounded-sm"></div></div>
                                            <div className="border-[1.5px] sm:border-2 border-current rounded-[3px] sm:rounded-md flex items-center justify-center p-[1px]"><div className="bg-current w-full h-full rounded-sm"></div></div>
                                            <div className="flex items-end justify-end"><div className="bg-current w-[70%] h-[70%] rounded-sm"></div></div>
                                        </div>
                                    </div>
                                    
                                </div>
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
