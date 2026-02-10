import { CreditCard, QrCode, Shield, Calendar, User, Building } from 'lucide-react';

export function BlisterSection() {
    return (
        <section id="blister" className="py-20 bg-gradient-to-b from-background-light to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Visual de la credencial */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-2xl blur-2xl"></div>
                        <div className="relative">
                            {/* Mock de credencial Blister */}
                            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
                                <div className="aspect-[1.6/1] bg-gradient-to-br from-primary to-primary-light rounded-xl p-6 text-white relative overflow-hidden">
                                    {/* Pattern de fondo */}
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="grid grid-cols-8 h-full">
                                            {Array.from({ length: 40 }).map((_, i) => (
                                                <div key={i} className="border border-white"></div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Contenido de la credencial */}
                                    <div className="relative h-full flex flex-col justify-between">
                                        <div>
                                            <div className="text-sm font-semibold mb-1">
                                                VMP SERVICIOS
                                            </div>
                                            <div className="text-xs opacity-80">
                                                Credencial Profesional
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-lg font-bold">JUAN PÉREZ</div>
                                            <div className="text-sm">DNI: 12.345.678</div>
                                            <div className="text-sm font-semibold">
                                                Curso: Seguridad Industrial
                                            </div>
                                            <div className="flex justify-between items-end text-xs">
                                                <div>
                                                    <div>Emisión: 15/01/2026</div>
                                                    <div>Vence: 15/01/2028</div>
                                                </div>
                                                <div className="bg-white p-2 rounded">
                                                    <QrCode className="h-12 w-12 text-primary" />
                                                </div>
                                            </div>
                                            <div className="text-xs font-mono">VMP-2026-00123</div>
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
