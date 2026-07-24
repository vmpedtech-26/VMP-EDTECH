'use client';

import React from 'react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { Shield, Eye, Lock, FileCheck, Scale } from 'lucide-react';

export default function PrivacidadPage() {
    return (
        <main className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            {/* Header section */}
            <div className="pt-24 pb-12 bg-[#0A192F] text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Política de Privacidad</h1>
                    <p className="text-gray-300 text-lg">
                        Protección de datos personales y compromiso de confidencialidad de VMP - EDTECH
                    </p>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-grow py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-8 md:p-10 space-y-8">
                    <div className="flex items-center space-x-3 text-primary border-b border-slate-100 pb-4">
                        <Shield className="h-6 w-6" />
                        <h2 className="text-xl font-bold text-slate-900">Tratamiento y Seguridad de Datos</h2>
                    </div>

                    <div className="space-y-6 text-slate-700 leading-relaxed text-sm md:text-base">
                        <section className="space-y-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <FileCheck className="h-5 w-5 text-secondary" />
                                1. Cumplimiento de la Ley 25.326
                            </h3>
                            <p>
                                VMP-EDTECH S.R.L. (CUIT 30-71936908-8), con domicilio en Juan B. Justo 385, Piso 1, Neuquén (8300), actúa en carácter de responsable del archivo, registro, base o banco de datos personales, conforme lo establece la Ley N.º 25.326 de Protección de los Datos Personales y su Decreto Reglamentario N.º 1558/2001. Los datos personales recabados a través del presente sitio web serán incorporados a una base de datos registrada ante la Agencia de Acceso a la Información Pública (AAIP) y serán tratados con estricta confidencialidad, con la finalidad de proveer los servicios de capacitación solicitados, emitir certificaciones, gestionar la relación contractual y cumplir con obligaciones fiscales y administrativas derivadas de la misma.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Eye className="h-5 w-5 text-secondary" />
                                2. Uso y Finalidad de los Datos Recabados
                            </h3>
                            <p>
                                Los datos de usuarios, alumnos y empresas que se recopilan a través de la plataforma son utilizados exclusivamente para:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Gestionar inscripciones y el progreso académico del alumno en los cursos correspondientes.</li>
                                <li>Emitir credenciales profesionales digitales y permitir su verificación pública a través de códigos QR.</li>
                                <li>Enviar notificaciones operativas relacionadas con las capacitaciones (bienvenida, recordatorios de vencimiento de credenciales, confirmaciones).</li>
                                <li>Procesar solicitudes de presupuesto y cotizaciones enviadas a través de los formularios del sitio.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Lock className="h-5 w-5 text-secondary" />
                                3. Confidencialidad y Medidas de Seguridad
                            </h3>
                            <p>
                                VMP-EDTECH se compromete a adoptar todas las medidas técnicas y organizativas necesarias para garantizar la seguridad y confidencialidad de los datos personales, evitando su adulteración, pérdida, consulta o tratamiento no autorizado, de conformidad con las directrices de la AAIP. No compartimos, vendemos ni cedemos datos personales a terceros sin consentimiento previo, excepto cuando medie requerimiento judicial o legal aplicable en la República Argentina.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Scale className="h-5 w-5 text-secondary" />
                                4. Derechos de Acceso, Rectificación y Supresión
                            </h3>
                            <p>
                                El titular de los datos personales tiene derecho a ejercer, en forma gratuita, los derechos de acceso, rectificación, actualización y supresión de sus datos, conforme a lo previsto en los artículos 14 a 17 de la Ley 25.326. La solicitud deberá cursarse por escrito al correo electrónico administracion@vmp-edtech.com, adjuntando acreditación de identidad suficiente. La AAIP, Órgano de Control de la Ley 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos.
                            </p>
                        </section>
                    </div>

                    <div className="border-t border-slate-100 pt-6 text-center text-xs text-slate-700">
                        <p>Última actualización: Junio de 2026</p>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
