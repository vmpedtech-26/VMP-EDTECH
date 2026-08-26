'use client';

import React from 'react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { FileText, Shield, Scale, BookOpen } from 'lucide-react';

export default function TerminosPage() {
    return (
        <main className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            {/* Header section */}
            <div className="pt-24 pb-12 bg-[#0A192F] text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">Términos y Condiciones del Servicio</h1>
                    <p className="text-gray-300 text-lg">
                        Condiciones generales de contratación y uso de la plataforma VMP - EDTECH
                    </p>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-grow py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-8 md:p-10 space-y-8">
                    <div className="flex items-center space-x-3 text-brand-legacy border-b border-slate-100 pb-4">
                        <FileText className="h-6 w-6" />
                        <h2 className="text-xl font-bold text-slate-900">Marco Legal de Contratación</h2>
                    </div>

                    <div className="space-y-6 text-slate-700 leading-relaxed text-sm md:text-base">
                        <section className="space-y-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Scale className="h-5 w-5 text-secondary" />
                                1. Naturaleza Contractual
                            </h3>
                            <p>
                                La utilización del presente sitio web y/o la contratación de cualquier servicio de capacitación ofrecido por VMP-EDTECH implica la aceptación plena e incondicional de los presentes Términos y Condiciones, los cuales revisten el carácter de condiciones generales del contrato en los términos del artículo 984 y siguientes del Código Civil y Comercial de la Nación (Ley N.º 26.994). Las partes convienen que la aceptación de estos términos, efectuada mediante actos inequívocos —incluyendo el envío de una consulta, la inscripción a un curso o el pago de cualquier arancel— perfecciona el vínculo contractual en los términos del artículo 971 y 972 del mismo cuerpo normativo.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-secondary" />
                                2. Servicios y Obligaciones
                            </h3>
                            <p>
                                VMP-EDTECH se obliga a prestar los servicios de formación y capacitación con la diligencia propia de un buen profesional en los términos del artículo 1724 del Código Civil y Comercial. El cursante queda obligado al pago del arancel acordado, a la asistencia en los módulos previstos y al cumplimiento del reglamento interno del curso. La certificación emitida queda sujeta a la aprobación de las instancias evaluativas establecidas en el programa académico correspondiente. VMP-EDTECH se reserva el derecho de modificar el cronograma de actividades por razones de fuerza mayor o caso fortuito (arts. 1730 y 1731 CCC), notificando a los inscriptos con la antelación razonable.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-secondary" />
                                3. Propiedad Intelectual (Ley 11.723)
                            </h3>
                            <p>
                                La totalidad de los contenidos del presente sitio web —incluyendo, de manera meramente enunciativa y no taxativa, los textos, materiales pedagógicos, programas de capacitación, fotografías, ilustraciones, diseño gráfico, logotipos, marcas, nombres comerciales y software— son de titularidad exclusiva de VMP-EDTECH y se encuentran protegidos por la Ley N.º 11.723 de Propiedad Intelectual y por los Convenios Internacionales sobre Derechos de Autor vigentes en la República Argentina. Queda expresamente prohibida su reproducción total o parcial, transmisión, modificación, distribución, exhibición pública o cualquier forma de explotación no autorizada, en soporte físico o digital, sin consentimiento previo, expreso y por escrito de VMP-EDTECH.
                            </p>
                            <p>
                                Los manuales, presentaciones, evaluaciones, videos y demás materiales didácticos entregados en el marco de los cursos son de uso exclusivo del cursante inscripto. Queda prohibida su cesión, reventa o difusión a terceros, bajo apercibimiento de las acciones civiles y penales que pudieran corresponder conforme los artículos 71 y siguientes de la Ley 11.723 y el artículo 1709 del Código Civil y Comercial.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Scale className="h-5 w-5 text-secondary" />
                                4. Jurisdicción y Ley Aplicable
                            </h3>
                            <p>
                                Las presentes condiciones se rigen exclusivamente por las leyes de la República Argentina, con especial aplicación del Código Civil y Comercial de la Nación (Ley 26.994), la Ley de Defensa del Consumidor (Ley N.º 24.240 y sus modificatorias), la Ley de Protección de Datos Personales (Ley N.º 25.326) y la Ley de Propiedad Intelectual (Ley N.º 11.723).
                            </p>
                            <p>
                                Para todos los efectos legales derivados del uso del sitio y/o de la contratación de servicios, las partes se someten a la jurisdicción de los Tribunales Ordinarios de la Ciudad de Neuquén, Provincia del Neuquén, renunciando expresamente a cualquier otro fuero o jurisdicción que pudiera corresponder. En los supuestos en que el usuario revista la calidad de consumidor final, resultarán aplicables las normas de orden público previstas en el artículo 36 y 37 de la Ley 24.240, las cuales primarán sobre cualquier cláusula en contrario.
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
